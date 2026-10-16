import { LitElement, html, css, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import type { HomeAssistant } from "./types";
import { PENDING_MS, applyPending, buildSettingsView, clampValue, sectionSummary, stepValue, writeService, type HelpDef, type PendingMap, type RowView, type SectionView } from "./settings-logic";

const TAG = "impianto-settings-dialog";

/**
 * Finestra delle preferenze: si aggiunge a document.body (non sta dentro la scheda), così nessun contenitore
 * della dashboard può tagliarla o nasconderla. Gli interruttori e i numeri sono gli helper di Home Assistant
 * (input_boolean e input_number): ogni modifica è subito attiva e resta anche dopo un riavvio.
 */
export class ImpiantoSettingsDialog extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @state() private _open: string | null = null;
  @state() private _help: { title: string; help: HelpDef } | null = null;
  @state() private _thermoBusy = false;
  @state() private _error = "";
  private _pending: PendingMap = {};
  private _timers = new Map<string, number>();
  private _expiry?: number;
  private _onKey = (e: KeyboardEvent) => {
    if (e.key !== "Escape") return;
    if (this._help) this._help = null;
    else this._close();
  };

  connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("keydown", this._onKey);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("keydown", this._onKey);
    for (const t of this._timers.values()) window.clearTimeout(t);
    this._timers.clear();
    if (this._expiry) window.clearTimeout(this._expiry);
  }

  private _close(): void {
    this.dispatchEvent(new CustomEvent("closed"));
    this.remove();
  }

  private async _call(domain: string, service: string, data: Record<string, unknown>): Promise<void> {
    try {
      this._error = "";
      await this.hass.callService(domain, service, data);
    } catch (err) {
      this._error = `Impossibile salvare: ${err instanceof Error ? err.message : String(err)}`;
    }
  }

  private _toggle(row: RowView): void {
    void this._call("input_boolean", row.on ? "turn_off" : "turn_on", { entity_id: row.entity });
  }

  /**
   * Il valore scelto si vede subito; la scrittura parte dopo una breve pausa, così più pressioni di + o − diventano
   * una sola richiesta (la caldaia conferma via cloud dopo parecchi secondi).
   */
  private _setNumber(row: RowView, value: number): void {
    this._pending[row.entity] = { value, until: Date.now() + PENDING_MS };
    this.requestUpdate();
    if (this._expiry) window.clearTimeout(this._expiry);
    this._expiry = window.setTimeout(() => this.requestUpdate(), PENDING_MS + 100);
    const old = this._timers.get(row.entity);
    if (old) window.clearTimeout(old);
    this._timers.set(
      row.entity,
      window.setTimeout(() => {
        this._timers.delete(row.entity);
        const w = writeService(row, this._pending[row.entity]?.value ?? value);
        void this._call(w.domain, w.service, w.data).then(() => {
          if (this._error) delete this._pending[row.entity];
        });
      }, 600),
    );
  }

  private _step(row: RowView, dir: 1 | -1): void {
    this._setNumber(row, stepValue(row.value, dir, row.min, row.max, row.step));
  }

  private _typed(row: RowView, ev: Event): void {
    const raw = (ev.target as HTMLInputElement).value.replace(",", ".");
    const n = Number(raw);
    if (raw.trim() === "" || !Number.isFinite(n)) {
      (ev.target as HTMLInputElement).value = row.value === null ? "" : String(row.value);
      return;
    }
    this._setNumber(row, clampValue(n, row.min, row.max, row.step));
  }

  private _toggleBlock(id: string): void {
    this._open = this._open === id ? null : id;
  }

  private _helpBtn(title: string, help?: HelpDef) {
    if (!help) return nothing;
    return html`<button class="i" aria-label="Spiegazione: ${title}" @click=${(e: Event) => { e.stopPropagation(); this._help = { title, help }; }}>i</button>`;
  }

  private _renderRow(row: RowView) {
    if (row.kind === "toggle") {
      return html`
        <div class="row tog">
          <div class="txt"><span class="lab">${row.label}</span>${this._helpBtn(row.label, row.help)}</div>
          <button
            class=${row.on ? "sw on" : "sw"}
            role="switch"
            aria-checked=${row.on ? "true" : "false"}
            aria-label=${row.label}
            ?disabled=${row.unavailable}
            @click=${() => this._toggle(row)}
          ><span class="knob"></span></button>
        </div>
      `;
    }
    return html`
      <div class="row">
        <div class="txt"><span class="lab">${row.label}</span>${this._helpBtn(row.label, row.help)}</div>
        <div class="num">
          <button class="st" aria-label="Diminuisci" ?disabled=${row.unavailable || (row.value !== null && row.value <= row.min)} @click=${() => this._step(row, -1)}>−</button>
          <input
            type="text"
            inputmode="decimal"
            class=${row.saving ? "saving" : ""}
            .value=${row.value === null ? "" : String(row.value)}
            ?disabled=${row.unavailable}
            aria-label=${row.label}
            @change=${(e: Event) => this._typed(row, e)}
          />
          <span class="unit">${row.unit}</span>
          <button class="st" aria-label="Aumenta" ?disabled=${row.unavailable || (row.value !== null && row.value >= row.max)} @click=${() => this._step(row, 1)}>+</button>
        </div>
      </div>
    `;
  }

  private _renderBlock(sec: SectionView) {
    const open = this._open === sec.id;
    return html`
      <section class="block ${open ? "open" : ""}">
        <div class="bh" role="button" tabindex="0" aria-expanded=${open ? "true" : "false"} @click=${() => this._toggleBlock(sec.id)} @keydown=${(e: KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") this._toggleBlock(sec.id); }}>
          <ha-icon icon=${sec.icon}></ha-icon>
          <div class="bt"><div class="bn">${sec.title}</div><div class="bs">${sectionSummary(sec)}</div></div>
          ${this._helpBtn(sec.title, sec.help)}
          <span class="chev">${open ? "▾" : "▸"}</span>
        </div>
        ${open ? html`<div class="bb">${sec.rows.map((r) => this._renderRow(r))}</div>` : nothing}
      </section>
    `;
  }

  /** Le preferenze del termostato stanno nell'altra integrazione: si apre la sua finestra. */
  private async _openThermostat(): Promise<void> {
    this._thermoBusy = true;
    this._error = "";
    try {
      const cw = this.hass.callWS as unknown as ((m: Record<string, unknown>) => Promise<unknown>) | undefined;
      if (!cw) throw new Error("callWS non disponibile");
      const info = await cw.call(this.hass, { type: "termostato_riscaldamento/info" });
      const d = document.createElement("termostato-settings-dialog") as HTMLElement & { hass: HomeAssistant; info: unknown };
      d.hass = this.hass;
      d.info = info;
      document.body.appendChild(d);
    } catch (err) {
      this._error = `Termostato non raggiungibile: ${err instanceof Error ? err.message : (err as { message?: string })?.message ?? String(err)}`;
    } finally {
      this._thermoBusy = false;
    }
  }

  private _renderThermostatBlock() {
    if (!customElements.get("termostato-settings-dialog")) return nothing;
    const id = "termostato";
    const open = this._open === id;
    const help: HelpDef = {
      what: "Antigelo, limiti dell'obiettivo, durata del timer, comportamento a casa vuota, annunci vocali e collegamenti del termostato ambiente.",
      when: "Per cambiare come il termostato scalda quando non c'è il programma o quando la casa è vuota.",
    };
    return html`
      <section class="block ${open ? "open" : ""}">
        <div class="bh" role="button" tabindex="0" aria-expanded=${open ? "true" : "false"} @click=${() => this._toggleBlock(id)} @keydown=${(e: KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") this._toggleBlock(id); }}>
          <ha-icon icon="mdi:thermostat"></ha-icon>
          <div class="bt"><div class="bn">Termostato ambiente</div><div class="bs">Antigelo, timer, casa vuota, annunci</div></div>
          ${this._helpBtn("Termostato ambiente", help)}
          <span class="chev">${open ? "▾" : "▸"}</span>
        </div>
        ${open ? html`<div class="bb"><div class="row"><div class="txt"><span class="lab">Preferenze del termostato</span></div><button class="btn" ?disabled=${this._thermoBusy} @click=${() => void this._openThermostat()}>Apri</button></div></div>` : nothing}
      </section>
    `;
  }

  private _renderHelp() {
    if (!this._help) return nothing;
    const { title, help } = this._help;
    return html`
      <div class="hback" @click=${(e: Event) => e.target === e.currentTarget && (this._help = null)}>
        <div class="hbox" role="dialog" aria-modal="true" aria-label=${title}>
          <div class="ht">${title}</div>
          <div class="hs">Cosa fa</div><p>${help.what}</p>
          <div class="hs">Quando serve</div><p>${help.when}</p>
          ${help.suggested ? html`<div class="hs">Valore consigliato</div><p>${help.suggested}</p>` : nothing}
          <button class="btn primary" @click=${() => (this._help = null)}>Ho capito</button>
        </div>
      </div>
    `;
  }

  render() {
    if (!this.hass) return nothing;
    const built = applyPending(buildSettingsView(this.hass.states), this._pending, Date.now());
    for (const e of built.settled) delete this._pending[e];
    const main = built.sections.filter((x) => !x.advanced);
    const adv = built.sections.filter((x) => x.advanced);
    const thermo = this._renderThermostatBlock();
    return html`
      <div class="backdrop" @click=${(e: Event) => e.target === e.currentTarget && this._close()}>
        <div class="panel" role="dialog" aria-modal="true" aria-label="Preferenze impianto">
          <div class="head">
            <div class="title">Preferenze impianto</div>
            <button class="x" aria-label="Chiudi" @click=${() => this._close()}>✕</button>
          </div>
          <div class="body">
            ${built.sections.length === 0 && thermo === nothing
              ? html`<div class="empty">Nessuna impostazione trovata: installa i pacchetti Home Assistant del progetto (cartella ha-packages).</div>`
              : html`
                  ${main.map((sec) => this._renderBlock(sec))}
                  ${thermo}
                  ${adv.length ? html`<div class="adv">Avanzate</div>${adv.map((sec) => this._renderBlock(sec))}` : nothing}
                `}
            ${this._error ? html`<div class="err">${this._error}</div>` : nothing}
          </div>
          ${this._renderHelp()}
        </div>
      </div>
    `;
  }

  static styles = css`
    :host {
      position: fixed;
      inset: 0;
      z-index: 10000;
      color: var(--primary-text-color, #212121);
      font-family: var(--paper-font-body1_-_font-family, Roboto, Helvetica, Arial, sans-serif);
    }
    .backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px;
      box-sizing: border-box;
    }
    .panel {
      position: relative;
      background: var(--card-background-color, #fff);
      border-radius: 16px;
      width: 100%;
      max-width: 560px;
      max-height: min(86vh, 760px);
      display: flex;
      flex-direction: column;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
      overflow: hidden;
    }
    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 18px;
      border-bottom: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
    }
    .title {
      font-size: 19px;
      font-weight: 700;
    }
    .x {
      background: none;
      border: none;
      color: inherit;
      font-size: 20px;
      cursor: pointer;
      padding: 6px 10px;
      border-radius: 8px;
    }
    .x:hover {
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.15));
    }
    .body {
      overflow-y: auto;
      padding: 4px 18px 18px;
    }
    section {
      margin-top: 14px;
    }
    .sec {
      font-size: 12.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--primary-color, #03a9f4);
      margin: 0 0 4px;
    }
    .sec.adv {
      background: none;
      border: none;
      width: 100%;
      display: flex;
      justify-content: space-between;
      cursor: pointer;
      padding: 4px 0;
      font-family: inherit;
    }
    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      padding: 9px 0;
      border-bottom: 1px solid var(--divider-color, rgba(127, 127, 127, 0.2));
    }
    .txt {
      min-width: 0;
      flex: 1;
    }
    .lab {
      font-size: 15px;
    }
    .hint {
      font-size: 12.5px;
      color: var(--secondary-text-color, #727272);
      margin-top: 2px;
    }
    .sw {
      flex: none;
      width: 54px;
      height: 30px;
      border-radius: 15px;
      border: none;
      padding: 0;
      background: var(--disabled-text-color, #9e9e9e);
      position: relative;
      cursor: pointer;
      transition: background 0.15s;
    }
    .sw.on {
      background: var(--primary-color, #03a9f4);
    }
    .sw .knob {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #fff;
      transition: transform 0.15s;
    }
    .sw.on .knob {
      transform: translateX(24px);
    }
    .sw:disabled,
    .st:disabled,
    input:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
    .num {
      flex: none;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .st {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.5));
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
      color: inherit;
      font-size: 20px;
      line-height: 1;
      cursor: pointer;
      padding: 0;
    }
    input {
      width: 66px;
      min-height: 44px;
      text-align: center;
      font-size: 16px;
      font-weight: 600;
      padding: 6px 4px;
      border-radius: 8px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.5));
      background: var(--card-background-color, #fff);
      color: inherit;
      box-sizing: border-box;
    }
    input.saving {
      border-color: var(--primary-color, #03a9f4);
      font-style: italic;
    }
    .unit {
      min-width: 22px;
      font-size: 13px;
      color: var(--secondary-text-color, #727272);
    }
    .block {
      margin-top: 10px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
      border-radius: 14px;
      overflow: hidden;
    }
    .block.open {
      border-color: var(--primary-color, #03a9f4);
    }
    .bh {
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 58px;
      padding: 6px 12px;
      cursor: pointer;
    }
    .bh ha-icon {
      --mdc-icon-size: 26px;
      flex: none;
      color: var(--secondary-text-color, #727272);
    }
    .bt {
      flex: 1;
      min-width: 0;
    }
    .bn {
      font-size: 16px;
      font-weight: 600;
    }
    .bs {
      font-size: 12.5px;
      color: var(--secondary-text-color, #727272);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .chev {
      width: 18px;
      text-align: center;
      color: var(--secondary-text-color, #727272);
    }
    .bb {
      padding: 0 12px 8px;
      border-top: 1px solid var(--divider-color, rgba(127, 127, 127, 0.25));
    }
    .bb .row:last-child {
      border-bottom: none;
    }
    .adv {
      margin: 18px 2px 0;
      font-size: 12.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--secondary-text-color, #727272);
    }
    .txt {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
    }
    .i {
      flex: none;
      width: 36px;
      height: 36px;
      margin-left: 6px;
      border-radius: 50%;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.5));
      background: transparent;
      color: var(--secondary-text-color, #727272);
      font-size: 15px;
      font-style: italic;
      font-family: Georgia, serif;
      cursor: pointer;
    }
    .btn {
      min-height: 44px;
      padding: 8px 18px;
      border-radius: 12px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.5));
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
      color: inherit;
      font-size: 15px;
      cursor: pointer;
    }
    .btn.primary {
      background: var(--primary-color, #03a9f4);
      color: #fff;
      border-color: transparent;
    }
    .hback {
      position: absolute;
      inset: 0;
      z-index: 2;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 14px;
    }
    .hbox {
      background: var(--card-background-color, #fff);
      border-radius: 16px;
      padding: 16px 18px;
      max-width: 420px;
      max-height: 90%;
      overflow-y: auto;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
    }
    .ht {
      font-size: 17px;
      font-weight: 700;
      margin-bottom: 6px;
    }
    .hs {
      margin-top: 8px;
      font-size: 11.5px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--secondary-text-color, #727272);
    }
    .hbox p {
      margin: 2px 0 0;
      font-size: 15px;
      line-height: 1.4;
    }
    .hbox .btn {
      margin-top: 14px;
      width: 100%;
    }
    .empty,
    .err {
      margin-top: 16px;
      font-size: 14px;
    }
    .err {
      color: var(--error-color, #db4437);
    }
    @media (max-width: 480px) {
      .row:not(.tog) {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
      }
      .num {
        justify-content: flex-end;
      }
    }
  `;
}

if (!customElements.get(TAG)) customElements.define(TAG, ImpiantoSettingsDialog);
