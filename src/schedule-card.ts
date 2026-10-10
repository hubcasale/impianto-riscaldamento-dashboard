import { LitElement, html, css, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import type { HomeAssistant } from "./types";
import {
  DAY_LONG,
  DAY_SHORT,
  DEFAULT_PRESETS,
  PROGRAMS,
  SAVED_PRESETS_KEY,
  describeProgram,
  mergePresets,
  removeSaved,
  sanitizeSaved,
  snapshotPreset,
  upsertSaved,
  describeOverlaps,
  findOverlaps,
  formatHM,
  hmToMinutes,
  parseTimeState,
  planPreset,
  programEntityIds,
  segmentsOnDay,
  toTimeValue,
  type Preset,
  type ProgramState,
  type ServiceAction,
} from "./schedule-logic";
import { toNumber } from "./plant-logic";

const CARD_TAG = "caldaia-schedule-card";

/** Colori dei 4 programmi (validi sia su tema chiaro che scuro). */
const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7"];

export interface ScheduleCardConfig {
  type: string;
  title?: string;
  /** prefisso delle entità dell'integrazione (default "casale": time.casale_crono_p1_accensione, ...) */
  prefix?: string;
  /** interruttore generale del cronotermostato */
  master?: string;
  /** sensore di stato della caldaia */
  status?: string;
  /** preset personalizzati; se assenti si usano quelli predefiniti */
  presets?: Preset[];
  /** nascondi sezioni: "weekly", "presets" */
  hide?: string[];
}

type Pending = Record<string, number>; // entity_id -> timestamp scadenza

export class CaldaiaScheduleCard extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @state() private _config!: ScheduleCardConfig;
  @state() private _pending: Pending = {};
  @state() private _confirm: Preset | null = null;
  /** preset salvati dall'utente (dati utente di Home Assistant) */
  @state() private _saved: Preset[] = [];
  /** finestrella "Salva": dove salvare la programmazione attuale (nome di un preset o NEW) */
  @state() private _saving: { target: string; newName: string } | null = null;
  private _savedRequested = false;
  @state() private _busy: { done: number; total: number; label: string } | null = null;
  @state() private _message: { kind: "ok" | "err"; text: string } | null = null;
  private _tick?: number;

  setConfig(config: ScheduleCardConfig): void {
    if (!config || typeof config !== "object") throw new Error("caldaia-schedule-card: configurazione non valida");
    this._config = { prefix: "casale", ...config };
  }

  getCardSize(): number {
    return 12;
  }

  static getStubConfig(): ScheduleCardConfig {
    return { type: `custom:${CARD_TAG}` };
  }

  connectedCallback(): void {
    super.connectedCallback();
    // aggiorna la linea "adesso" della vista settimanale
    this._tick = window.setInterval(() => this.requestUpdate(), 60_000);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._tick) window.clearInterval(this._tick);
  }

  // ---- lettura dello stato -------------------------------------------------

  private get _prefix(): string {
    return this._config.prefix ?? "casale";
  }
  private get _master(): string {
    return this._config.master ?? `switch.${this._prefix}_cronotermostato_settimanale`;
  }
  private get _status(): string {
    return this._config.status ?? `sensor.${this._prefix}_stato`;
  }

  private _programs(): ProgramState[] {
    return PROGRAMS.map((n) => {
      const ids = programEntityIds(this._prefix, n);
      const st = (id: string) => this.hass.states[id]?.state;
      return {
        n,
        on: parseTimeState(st(ids.on)),
        off: parseTimeState(st(ids.off)),
        days: ids.day.map((d) => st(d) === "on"),
        setBoiler: toNumber(st(ids.setBoiler)),
        setWater: toNumber(st(ids.setWater)),
      };
    });
  }

  private _cronoOn(): boolean | null {
    const s = this.hass.states[this._master]?.state;
    return s === "on" ? true : s === "off" ? false : null;
  }

  // ---- scritture ------------------------------------------------------------

  private async _call(a: ServiceAction): Promise<void> {
    await this.hass.callService(a.domain, a.service, { entity_id: a.entity_id, ...a.data });
  }

  private _markPending(entityId: string) {
    this._pending = { ...this._pending, [entityId]: Date.now() + 20_000 };
    window.setTimeout(() => {
      const { [entityId]: _drop, ...rest } = this._pending;
      void _drop;
      this._pending = rest;
    }, 20_000);
  }

  private async _run(action: ServiceAction) {
    this._message = null;
    this._markPending(action.entity_id);
    try {
      await this._call(action);
    } catch (err) {
      this._message = { kind: "err", text: `Non riuscito: ${action.label} (${(err as Error).message ?? err})` };
    }
  }

  private _setTime(n: number, which: "on" | "off", value: string) {
    const m = hmToMinutes(value);
    if (m === null) return;
    const ids = programEntityIds(this._prefix, n);
    void this._run({
      domain: "time",
      service: "set_value",
      entity_id: which === "on" ? ids.on : ids.off,
      data: { time: toTimeValue(m) },
      label: `P${n} ${which === "on" ? "accensione" : "spegnimento"} ${formatHM(m)}`,
    });
  }

  private _setNumber(n: number, which: "setBoiler" | "setWater", raw: string) {
    const v = Number(raw);
    if (!Number.isFinite(v)) return;
    const ids = programEntityIds(this._prefix, n);
    void this._run({
      domain: "number",
      service: "set_value",
      entity_id: which === "setBoiler" ? ids.setBoiler : ids.setWater,
      data: { value: v },
      label: `P${n} ${which === "setBoiler" ? "set boiler" : "set acqua"} ${v} °C`,
    });
  }

  private _toggleDay(n: number, d: number, isOn: boolean) {
    const ids = programEntityIds(this._prefix, n);
    void this._run({
      domain: "switch",
      service: isOn ? "turn_off" : "turn_on",
      entity_id: ids.day[d],
      data: {},
      label: `P${n} ${DAY_SHORT[d]} ${isOn ? "spento" : "attivo"}`,
    });
  }

  private _toggleMaster() {
    const on = this._cronoOn();
    void this._run({
      domain: "switch",
      service: on ? "turn_off" : "turn_on",
      entity_id: this._master,
      data: {},
      label: `Cronotermostato ${on ? "disattivato" : "attivo"}`,
    });
  }

  private get _presets(): Preset[] {
    const base = this._config.presets && this._config.presets.length ? this._config.presets : DEFAULT_PRESETS;
    return mergePresets(base, this._saved);
  }

  private get _basePresets(): Preset[] {
    return this._config.presets && this._config.presets.length ? this._config.presets : DEFAULT_PRESETS;
  }

  protected updated(changed: Map<string, unknown>): void {
    if (changed.has("hass") && this.hass && !this._savedRequested) {
      this._savedRequested = true;
      void this._loadSaved();
    }
  }

  private _ws(msg: Record<string, unknown>): Promise<{ value?: unknown } | null> {
    const cw = this.hass.callWS as unknown as ((m: Record<string, unknown>) => Promise<{ value?: unknown } | null>) | undefined;
    return cw ? cw.call(this.hass, msg) : Promise.reject(new Error("callWS non disponibile"));
  }

  private async _loadSaved(): Promise<void> {
    try {
      const r = await this._ws({ type: "frontend/get_user_data", key: SAVED_PRESETS_KEY });
      this._saved = sanitizeSaved(r?.value);
    } catch {
      this._saved = [];
    }
  }

  private async _persistSaved(next: Preset[]): Promise<void> {
    await this._ws({ type: "frontend/set_user_data", key: SAVED_PRESETS_KEY, value: { version: 1, presets: next } });
    this._saved = next;
  }

  private _openSave(): void {
    this._confirm = null;
    this._message = null;
    this._saving = { target: "__new__", newName: "" };
  }

  private async _doSave(): Promise<void> {
    const sv = this._saving;
    if (!sv) return;
    const isNew = sv.target === "__new__";
    const name = isNew ? sv.newName.trim() : sv.target;
    if (!name) return;
    const base = this._presets.find((p) => p.name === name);
    const preset = snapshotPreset(name, this._programs(), this._cronoOn(), base);
    try {
      await this._persistSaved(upsertSaved(this._saved, preset));
      this._saving = null;
      this._message = { kind: "ok", text: `Preset "${name}" salvato con la programmazione attuale (orari, giorni, temperature e cronotermostato).` };
    } catch (err) {
      this._message = { kind: "err", text: `Non sono riuscito a salvare: ${(err as Error).message ?? err}` };
    }
  }

  private async _deleteSaved(name: string): Promise<void> {
    const isDefault = this._basePresets.some((p) => p.name === name);
    try {
      await this._persistSaved(removeSaved(this._saved, name));
      this._message = { kind: "ok", text: isDefault ? `Preset "${name}" ripristinato com'era in origine.` : `Preset "${name}" eliminato.` };
      if (this._saving?.target === name) this._saving = { target: "__new__", newName: "" };
    } catch (err) {
      this._message = { kind: "err", text: `Non sono riuscito a eliminare: ${(err as Error).message ?? err}` };
    }
  }

  private _plan(preset: Preset): ServiceAction[] {
    return planPreset(
      { prefix: this._prefix, master: this._master, programs: this._programs(), cronoOn: this._cronoOn() },
      preset
    );
  }

  private async _applyPreset(preset: Preset) {
    const plan = this._plan(preset);
    this._confirm = null;
    this._message = null;
    if (!plan.length) {
      this._message = { kind: "ok", text: `"${preset.name}" è già impostato.` };
      return;
    }
    for (let i = 0; i < plan.length; i++) {
      this._busy = { done: i, total: plan.length, label: plan[i].label };
      try {
        await this._call(plan[i]);
        this._markPending(plan[i].entity_id);
      } catch (err) {
        this._busy = null;
        this._message = { kind: "err", text: `Fermato a "${plan[i].label}": ${(err as Error).message ?? err}. Eseguite ${i} operazioni su ${plan.length}.` };
        return;
      }
    }
    this._busy = null;
    this._message = { kind: "ok", text: `"${preset.name}" applicato (${plan.length} modifiche). La caldaia aggiorna i dati tramite il cloud: può servire qualche minuto.` };
  }

  // ---- disegno --------------------------------------------------------------

  private _renderHeader(crono: boolean | null) {
    const status = this.hass.states[this._status]?.state;
    return html`
      <div class="head">
        <div>
          <div class="title">${this._config.title ?? "Programmazione caldaia"}</div>
          <div class="sub">
            Cronotermostato settimanale · stato caldaia: <b>${status ?? "–"}</b>
          </div>
        </div>
        <button
          class="master ${crono ? "on" : crono === false ? "off" : "na"}"
          @click=${() => this._toggleMaster()}
          ?disabled=${crono === null}
          title="Attiva o disattiva tutti i programmi"
        >
          <span class="knob"></span>
          <span>${crono ? "Crono attivo" : crono === false ? "Crono spento" : "n.d."}</span>
        </button>
      </div>
      ${crono === false
        ? html`<div class="note">Il cronotermostato è disattivato: nessun programma parte, anche se i giorni sono attivi.</div>`
        : nothing}
    `;
  }

  private _renderWarnings(programs: ProgramState[]) {
    const lines = describeOverlaps(findOverlaps(programs));
    if (!lines.length) return nothing;
    return html`<div class="warn">
      <b>Attenzione, programmi sovrapposti</b>
      <ul>${lines.map((l) => html`<li>${l}</li>`)}</ul>
    </div>`;
  }

  private _renderSave() {
    const sv = this._saving;
    if (!sv) return nothing;
    const programs = this._programs();
    const crono = this._cronoOn();
    const isNew = sv.target === "__new__";
    const canSave = isNew ? sv.newName.trim() !== "" : true;
    const targetName = isNew ? sv.newName.trim() : sv.target;
    const exists = this._presets.some((p) => p.name === targetName);
    return html`<div class="confirm save">
      <div><b>Salva la programmazione attuale</b></div>
      <ul>
        ${programs.map((p) => html`<li>${describeProgram(p)}</li>`)}
        <li>Cronotermostato ${crono === null ? "non disponibile" : crono ? "attivo" : "spento"}</li>
      </ul>
      <div class="small">In quale preset la salvo?</div>
      <div class="targets">
        ${this._presets.map((p) => {
          const saved = this._saved.some((x) => x.name === p.name);
          const isDefault = this._basePresets.some((b) => b.name === p.name);
          return html`<div class="target">
            <label>
              <input type="radio" name="target" .checked=${sv.target === p.name} @change=${() => (this._saving = { ...sv, target: p.name })} />
              <span>${p.name}${saved ? html` <small>(personalizzato)</small>` : html` <small>(predefinito)</small>`}</span>
            </label>
            ${saved
              ? html`<button class="mini" @click=${() => this._deleteSaved(p.name)}>${isDefault ? "Ripristina" : "Elimina"}</button>`
              : nothing}
          </div>`;
        })}
        <div class="target">
          <label>
            <input type="radio" name="target" .checked=${isNew} @change=${() => (this._saving = { ...sv, target: "__new__" })} />
            <span>Nuovo preset</span>
          </label>
          <input
            class="name"
            type="text"
            placeholder="Nome (per esempio Inverno)"
            maxlength="30"
            .value=${sv.newName}
            @focus=${() => (this._saving = { ...sv, target: "__new__" })}
            @input=${(e: Event) => (this._saving = { target: "__new__", newName: (e.target as HTMLInputElement).value })}
          />
        </div>
      </div>
      ${canSave && targetName
        ? html`<div class="small">${exists ? html`Sostituisce il contenuto di <b>${targetName}</b>.` : html`Crea il preset <b>${targetName}</b>.`}</div>`
        : nothing}
      <div class="row">
        <button class="primary" ?disabled=${!canSave} @click=${() => this._doSave()}>Salva</button>
        <button @click=${() => (this._saving = null)}>Annulla</button>
      </div>
    </div>`;
  }

  private _renderPresets() {
    if (this._config.hide?.includes("presets")) return nothing;
    const confirm = this._confirm;
    const plan = confirm ? this._plan(confirm) : [];
    return html`
      <div class="section">Preset</div>
      <div class="presets">
        ${this._presets.map(
          (p) => html`<button class="preset" ?disabled=${!!this._busy} @click=${() => { this._saving = null; this._confirm = p; }} title=${p.description ?? ""}>
            ${p.icon ? html`<ha-icon .icon=${p.icon}></ha-icon>` : nothing}<span>${p.name}</span>
          </button>`
        )}
        <button class="preset save" ?disabled=${!!this._busy} @click=${() => this._openSave()} title="Salva la programmazione attuale come preset">
          <ha-icon icon="mdi:content-save-outline"></ha-icon><span>Salva…</span>
        </button>
      </div>
      ${this._renderSave()}
      ${confirm
        ? html`<div class="confirm">
            <div><b>${confirm.name}</b>${confirm.description ? html` · ${confirm.description}` : nothing}</div>
            ${plan.length
              ? html`<div class="small">${plan.length} modifiche:</div>
                  <ul>${plan.slice(0, 12).map((a) => html`<li>${a.label}</li>`)}${plan.length > 12 ? html`<li>… e altre ${plan.length - 12}</li>` : nothing}</ul>`
              : html`<div class="small">Già impostato, non c'è niente da cambiare.</div>`}
            <div class="row">
              <button class="primary" @click=${() => this._applyPreset(confirm)}>Applica</button>
              <button @click=${() => (this._confirm = null)}>Annulla</button>
            </div>
          </div>`
        : nothing}
      ${this._busy
        ? html`<div class="busy">
            <div class="bar"><div style="width:${(this._busy.done / this._busy.total) * 100}%"></div></div>
            ${this._busy.done + 1}/${this._busy.total} · ${this._busy.label}
          </div>`
        : nothing}
      ${this._message ? html`<div class="msg ${this._message.kind}">${this._message.text}</div>` : nothing}
    `;
  }

  private _renderProgram(p: ProgramState) {
    const ids = programEntityIds(this._prefix, p.n);
    const color = COLORS[p.n - 1];
    const active = p.days.some(Boolean);
    const pend = (id: string) => (this._pending[id] ? "pending" : "");
    const numAttr = (id: string, key: "min" | "max" | "step", dflt: number) => {
      const v = this.hass.states[id]?.attributes?.[key];
      return typeof v === "number" ? v : dflt;
    };
    const timeVal = (m: number | null) => (m === null ? "" : formatHM(m));
    return html`
      <div class="prog" style="--c:${color}">
        <div class="prog-head">
          <b>Programma ${p.n}</b>
          <span class="badge ${active ? "yes" : "no"}">${active ? "attivo" : "nessun giorno"}</span>
        </div>
        <div class="times">
          <label class=${pend(ids.on)}>
            <span>Accensione</span>
            <input type="time" step="600" .value=${timeVal(p.on)} @change=${(e: Event) => this._setTime(p.n, "on", (e.target as HTMLInputElement).value)} />
          </label>
          <label class=${pend(ids.off)}>
            <span>Spegnimento</span>
            <input type="time" step="600" .value=${timeVal(p.off === 1440 ? 0 : p.off)} @change=${(e: Event) => this._setTime(p.n, "off", (e.target as HTMLInputElement).value)} />
          </label>
        </div>
        <div class="days">
          ${DAY_SHORT.map(
            (name, d) => html`<button
              class="day ${p.days[d] ? "on" : ""} ${pend(ids.day[d])}"
              title=${DAY_LONG[d]}
              aria-pressed=${p.days[d]}
              @click=${() => this._toggleDay(p.n, d, p.days[d])}
            >${name}</button>`
          )}
        </div>
        <div class="temps">
          <label class=${pend(ids.setBoiler)}>
            <span>Set boiler</span>
            <span class="num"><input type="number" min=${numAttr(ids.setBoiler, "min", 45)} max=${numAttr(ids.setBoiler, "max", 70)} step=${numAttr(ids.setBoiler, "step", 1)} .value=${p.setBoiler === null ? "" : String(p.setBoiler)} @change=${(e: Event) => this._setNumber(p.n, "setBoiler", (e.target as HTMLInputElement).value)} /> °C</span>
          </label>
          <label class=${pend(ids.setWater)}>
            <span>Set acqua</span>
            <span class="num"><input type="number" min=${numAttr(ids.setWater, "min", 50)} max=${numAttr(ids.setWater, "max", 75)} step=${numAttr(ids.setWater, "step", 1)} .value=${p.setWater === null ? "" : String(p.setWater)} @change=${(e: Event) => this._setNumber(p.n, "setWater", (e.target as HTMLInputElement).value)} /> °C</span>
          </label>
        </div>
      </div>
    `;
  }

  private _renderWeekly(programs: ProgramState[]) {
    if (this._config.hide?.includes("weekly")) return nothing;
    const overlaps = findOverlaps(programs);
    const now = new Date();
    const today = (now.getDay() + 6) % 7;
    const nowPct = ((now.getHours() * 60 + now.getMinutes()) / 1440) * 100;
    const ticks = [0, 3, 6, 9, 12, 15, 18, 21, 24];
    return html`
      <div class="section">Vista settimanale</div>
      <div class="weekly">
        <div class="axis">${ticks.map((h) => html`<span style="left:${(h / 24) * 100}%">${h}</span>`)}</div>
        ${DAY_SHORT.map((name, d) => {
          const bars = programs.flatMap((p) => segmentsOnDay(p, d).map((s) => ({ p: p.n, ...s })));
          const ov = overlaps.filter((o) => o.day === d);
          return html`<div class="wrow ${d === today ? "today" : ""}">
            <span class="wlabel">${name}</span>
            <div class="track">
              ${ticks.slice(1, -1).map((h) => html`<i class="grid" style="left:${(h / 24) * 100}%"></i>`)}
              ${bars.map(
                (b) => html`<div class="bar" style="left:${(b.start / 1440) * 100}%;width:${((b.end - b.start) / 1440) * 100}%;background:${COLORS[b.p - 1]}" title="P${b.p} ${formatHM(b.start)}–${formatHM(b.end)}"></div>`
              )}
              ${ov.map((o) => html`<div class="bar clash" style="left:${(o.start / 1440) * 100}%;width:${((o.end - o.start) / 1440) * 100}%"></div>`)}
              ${d === today ? html`<div class="now" style="left:${nowPct}%"></div>` : nothing}
            </div>
          </div>`;
        })}
        <div class="legend">
          ${PROGRAMS.map((n) => html`<span><i style="background:${COLORS[n - 1]}"></i>P${n}</span>`)}
          <span><i class="clashkey"></i>sovrapposizione</span>
        </div>
      </div>
    `;
  }

  render() {
    if (!this._config || !this.hass) return nothing;
    const programs = this._programs();
    const crono = this._cronoOn();
    return html`
      <ha-card>
        <div class="wrap">
          ${this._renderHeader(crono)} ${this._renderWarnings(programs)} ${this._renderPresets()}
          <div class="section">Programmi</div>
          <div class="grid">${programs.map((p) => this._renderProgram(p))}</div>
          ${this._renderWeekly(programs)}
        </div>
      </ha-card>
    `;
  }

  static styles = css`
    :host {
      display: block;
    }
    .wrap {
      padding: 16px;
      color: var(--primary-text-color);
    }
    .head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .title {
      font-size: 20px;
      font-weight: 700;
    }
    .sub {
      color: var(--secondary-text-color);
      font-size: 13px;
      margin-top: 2px;
    }
    .section {
      margin: 18px 0 8px;
      font-weight: 700;
      font-size: 14px;
    }
    button {
      font: inherit;
      color: inherit;
      cursor: pointer;
    }
    .master {
      display: flex;
      align-items: center;
      gap: 10px;
      border: none;
      border-radius: 22px;
      padding: 8px 16px 8px 10px;
      font-weight: 700;
      font-size: 14px;
      background: var(--secondary-background-color);
    }
    .master .knob {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--disabled-text-color, #94a3b8);
    }
    .master.on {
      background: color-mix(in srgb, var(--success-color, #22c55e) 25%, transparent);
      color: var(--success-color, #16a34a);
    }
    .master.on .knob {
      background: var(--success-color, #22c55e);
    }
    .master.off {
      color: var(--secondary-text-color);
    }
    .note {
      margin-top: 10px;
      padding: 8px 12px;
      border-radius: 10px;
      font-size: 13px;
      background: color-mix(in srgb, var(--warning-color, #f59e0b) 18%, transparent);
    }
    .warn {
      margin-top: 12px;
      padding: 10px 14px;
      border-radius: 12px;
      border: 1px solid var(--error-color, #ef4444);
      background: color-mix(in srgb, var(--error-color, #ef4444) 12%, transparent);
      font-size: 13px;
    }
    .warn ul,
    .confirm ul {
      margin: 6px 0 0;
      padding-left: 18px;
    }
    .presets {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .preset {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border: 1px solid var(--divider-color);
      background: var(--secondary-background-color);
      border-radius: 20px;
      padding: 8px 14px;
      font-size: 14px;
    }
    .preset:hover:not(:disabled) {
      border-color: var(--primary-color);
    }
    .preset:disabled {
      opacity: 0.5;
      cursor: default;
    }
    .confirm.save .targets {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin: 6px 0;
    }
    .target {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 4px 0;
      border-bottom: 1px solid var(--divider-color);
    }
    .target label {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 14px;
      color: var(--primary-text-color);
      text-transform: none;
      letter-spacing: 0;
    }
    .target label small {
      color: var(--secondary-text-color);
      font-size: 12px;
    }
    .target input[type="radio"] {
      width: auto;
      margin: 0;
    }
    .target input.name {
      flex: 1;
      min-width: 0;
      max-width: 240px;
      padding: 6px 8px;
      border-radius: 8px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font: inherit;
    }
    .mini {
      font-size: 12px;
      padding: 4px 10px;
    }
    .confirm {
      margin-top: 10px;
      padding: 12px;
      border-radius: 12px;
      background: var(--secondary-background-color);
      font-size: 14px;
    }
    .small {
      color: var(--secondary-text-color);
      font-size: 12px;
      margin-top: 4px;
    }
    .row {
      display: flex;
      gap: 8px;
      margin-top: 10px;
    }
    .row button {
      border: 1px solid var(--divider-color);
      background: transparent;
      border-radius: 8px;
      padding: 6px 14px;
    }
    .row button.primary {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }
    .busy {
      margin-top: 10px;
      font-size: 13px;
    }
    .busy .bar {
      height: 6px;
      border-radius: 3px;
      background: var(--divider-color);
      margin-bottom: 4px;
      overflow: hidden;
    }
    .busy .bar div {
      height: 100%;
      background: var(--primary-color);
      transition: width 0.3s;
    }
    .msg {
      margin-top: 10px;
      padding: 8px 12px;
      border-radius: 10px;
      font-size: 13px;
    }
    .msg.ok {
      background: color-mix(in srgb, var(--success-color, #22c55e) 18%, transparent);
    }
    .msg.err {
      background: color-mix(in srgb, var(--error-color, #ef4444) 18%, transparent);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
      gap: 12px;
    }
    .prog {
      border: 1px solid var(--divider-color);
      border-left: 6px solid var(--c);
      border-radius: 14px;
      padding: 12px 14px;
      background: var(--secondary-background-color);
    }
    .prog-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .badge {
      font-size: 12px;
      border-radius: 12px;
      padding: 2px 10px;
      font-weight: 700;
    }
    .badge.yes {
      background: color-mix(in srgb, var(--success-color, #22c55e) 25%, transparent);
      color: var(--success-color, #16a34a);
    }
    .badge.no {
      background: var(--divider-color);
      color: var(--secondary-text-color);
    }
    .times,
    .temps {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    label {
      display: flex;
      flex-direction: column;
      font-size: 11px;
      color: var(--secondary-text-color);
      gap: 3px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .temps label {
      margin-top: 10px;
      text-transform: none;
      font-size: 12px;
    }
    input {
      font: inherit;
      font-size: 22px;
      font-weight: 700;
      color: var(--primary-text-color);
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 4px 8px;
      box-sizing: border-box;
      width: 100%;
      min-width: 0;
    }
    input[type="number"] {
      font-size: 17px;
      width: 4.2em;
    }
    .num {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--primary-text-color);
      font-weight: 700;
    }
    input:focus {
      outline: none;
      border-color: var(--primary-color);
    }
    label.pending input,
    label.pending {
      opacity: 0.55;
    }
    .days {
      display: flex;
      gap: 6px;
      margin: 12px 0 2px;
    }
    .day {
      flex: 1;
      min-width: 0;
      aspect-ratio: 1;
      max-height: 40px;
      border-radius: 50%;
      border: none;
      font-size: 12px;
      font-weight: 600;
      background: var(--divider-color);
      color: var(--secondary-text-color);
    }
    .day.on {
      background: var(--c);
      color: #fff;
    }
    .day.pending {
      opacity: 0.5;
    }
    .weekly {
      position: relative;
    }
    .axis {
      position: relative;
      height: 14px;
      margin-left: 38px;
      font-size: 10px;
      color: var(--secondary-text-color);
    }
    .axis span {
      position: absolute;
      transform: translateX(-50%);
    }
    .wrow {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 4px;
    }
    .wlabel {
      width: 32px;
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    .wrow.today .wlabel {
      color: var(--primary-text-color);
      font-weight: 700;
    }
    .track {
      position: relative;
      flex: 1;
      height: 20px;
      border-radius: 6px;
      background: var(--secondary-background-color);
      overflow: hidden;
    }
    .track .grid {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 1px;
      background: var(--divider-color);
      display: block;
      padding: 0;
    }
    .track .bar {
      position: absolute;
      top: 0;
      bottom: 0;
      border-radius: 4px;
      opacity: 0.92;
    }
    .track .bar.clash {
      background: repeating-linear-gradient(45deg, var(--error-color, #ef4444) 0 4px, transparent 4px 8px);
      border: 1px solid var(--error-color, #ef4444);
      opacity: 1;
    }
    .now {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 2px;
      background: var(--primary-text-color);
      opacity: 0.8;
    }
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
      margin: 10px 0 0 38px;
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    .legend i {
      display: inline-block;
      width: 11px;
      height: 11px;
      border-radius: 3px;
      margin-right: 5px;
      vertical-align: -1px;
    }
    .legend i.clashkey {
      background: repeating-linear-gradient(45deg, var(--error-color, #ef4444) 0 3px, transparent 3px 6px);
      border: 1px solid var(--error-color, #ef4444);
    }
  `;
}

customElements.define(CARD_TAG, CaldaiaScheduleCard);
