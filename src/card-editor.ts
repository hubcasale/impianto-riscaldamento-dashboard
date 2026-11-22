import { LitElement, html, css, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import {
  addRoom,
  applyGeneral,
  applyParts,
  partsValues,
  generalValues,
  moveRoom,
  removeRoom,
  roomComplete,
  roomDrafts,
  roomsOptions,
  setRooms,
  setRoomsOptions,
  updateRoom,
  type EditorConfig,
  type GeneralValues,
  type PartsValues,
  type RoomDraft,
} from "./editor-logic";
import { ENTITY_GROUPS, applyGroup, groupChanged, groupMissing, groupValues, keyDomain, type EntityGroup } from "./entity-catalog";
import type { HomeAssistant } from "./types";

interface FormSchema {
  name: string;
  selector?: Record<string, unknown>;
  type?: string;
  title?: string;
  flatten?: boolean;
  expanded?: boolean;
  schema?: FormSchema[];
}

const TAG = "impianto-overview-card-editor";

const LABELS: Record<string, string> = {
  title: "Titolo",
  layout: "Disposizione",
  boiler: "Disegno del boiler",
  show_boiler: "Boiler solare / puffer",
  show_caldaia: "Caldaia a pellet",
  show_stufa: "Stufa a pellet",
  show_termostato: "Termostato ambiente",
  show_rooms: "Stanze (temperatura e umidità)",
  btn_settings: "Pulsante «Preferenze» (ingranaggio)",
  btn_summary: "Pulsante «Stato»",
  btn_charts: "Pulsante «Grafici»",
  btn_schedule: "Pulsante «Programmazione»",
  name: "Nome",
  short: "Nome corto (se quello intero non ci sta)",
  temperature: "Sensore di temperatura",
  humidity: "Sensore di umidità",
  rooms_title: "Titolo del riquadro",
  stufa_title: "Stufa: titolo",
  stufa_entry: "Stufa: quale (se ne hai più di una)",
  thermo_title: "Termostato: titolo",
  thermo_entry: "Termostato: quale (se ne hai più di uno)",
  target_entity: "Termostato per la linea dell'obiettivo",
};
const HELP: Record<string, string> = {
  layout: "Affiancata: boiler, caldaia e stufa in colonne, termostato e stanze sotto a tutta larghezza.",
  boiler: "Il boiler corto si usa solo con la disposizione affiancata.",
  show_stufa: "Serve l'integrazione «Impianto di riscaldamento» con la stufa configurata.",
  btn_settings: "Le preferenze di funzionamento (set boiler, stagione, soglie, assenza) restano lì.",
  rooms_title: "Vuoto = «Stanze».",
  target_entity: "Vuoto = climate.termostato.",
};

const GENERAL_SCHEMA: FormSchema[] = [
  { name: "title", selector: { text: {} } },
  {
    name: "layout",
    selector: { select: { mode: "dropdown", options: [{ value: "classic", label: "Classica: boiler a sinistra, il resto a destra" }, { value: "split", label: "Affiancata: colonne, termostato e stanze sotto" }] } },
  },
  { name: "boiler", selector: { select: { mode: "dropdown", options: [{ value: "full", label: "Intero" }, { value: "short", label: "Corto" }] } } },
  {
    name: "cosa",
    type: "expandable",
    title: "Cosa mostrare",
    flatten: true,
    expanded: true,
    schema: [
      { name: "show_boiler", selector: { boolean: {} } },
      { name: "show_caldaia", selector: { boolean: {} } },
      { name: "show_stufa", selector: { boolean: {} } },
      { name: "show_termostato", selector: { boolean: {} } },
      { name: "show_rooms", selector: { boolean: {} } },
    ],
  },
  {
    name: "pulsanti",
    type: "expandable",
    title: "Pulsanti",
    flatten: true,
    schema: [
      { name: "btn_settings", selector: { boolean: {} } },
      { name: "btn_summary", selector: { boolean: {} } },
      { name: "btn_charts", selector: { boolean: {} } },
      { name: "btn_schedule", selector: { boolean: {} } },
    ],
  },
];

const ROOM_SCHEMA: FormSchema[] = [
  { name: "name", selector: { text: {} } },
  { name: "short", selector: { text: {} } },
  { name: "temperature", selector: { entity: { filter: { domain: "sensor", device_class: "temperature" } } } },
  { name: "humidity", selector: { entity: { filter: { domain: "sensor", device_class: "humidity" } } } },
];

const PARTS_SCHEMA: FormSchema[] = [
  { name: "stufa_title", selector: { text: {} } },
  { name: "stufa_entry", selector: { config_entry: { integration: "impianto_riscaldamento" } } },
  { name: "thermo_title", selector: { text: {} } },
  { name: "thermo_entry", selector: { config_entry: { integration: "impianto_riscaldamento" } } },
];

const ROOMS_OPT_SCHEMA: FormSchema[] = [
  { name: "rooms_title", selector: { text: {} } },
  { name: "target_entity", selector: { entity: { filter: { domain: "climate" } } } },
];

/**
 * Editor visuale della scheda dell'impianto: cosa mostrare, disposizione, pulsanti e stanze.
 * Le preferenze di funzionamento dell'impianto restano nell'ingranaggio della scheda.
 */
export class ImpiantoOverviewCardEditor extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @state() private _config: EditorConfig = { type: "custom:impianto-overview-card" };
  /** stanza aperta nell'elenco (una alla volta) */
  @state() private _openRoom: string | null = null;
  @state() private _note = "";
  /** gruppo aperto tra «Stufa e termostato» e le entità (uno alla volta: i selettori si creano solo per quello aperto) */
  @state() private _openGroup: string | null = null;

  setConfig(config: EditorConfig): void {
    this._config = { ...config };
  }

  private _emit(next: EditorConfig): void {
    this._config = next;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: next }, bubbles: true, composed: true }));
  }

  private _onGeneral(ev: CustomEvent<{ value: Record<string, unknown> }>): void {
    ev.stopPropagation();
    const cur = generalValues(this._config);
    const v = { ...cur, ...(ev.detail.value as Partial<GeneralValues>) };
    v.title = typeof v.title === "string" ? v.title : "";
    const next = applyGeneral(this._config, v);
    if (next === this._config) {
      this._note = "Almeno una sezione deve restare visibile.";
      this.requestUpdate();
      return;
    }
    this._note = "";
    this._emit(next);
  }

  private _rooms(): RoomDraft[] {
    return roomDrafts(this._config);
  }

  private _setRooms(rooms: RoomDraft[]): void {
    this._emit(setRooms(this._config, rooms));
  }

  private _onRoom(index: number, ev: CustomEvent<{ value: Record<string, unknown> }>): void {
    ev.stopPropagation();
    const v = ev.detail.value;
    const s = (x: unknown) => (typeof x === "string" ? x : "");
    this._setRooms(updateRoom(this._rooms(), index, { name: s(v.name), short: s(v.short), temperature: s(v.temperature), humidity: s(v.humidity) }));
  }

  private _onRoomsOpt(ev: CustomEvent<{ value: Record<string, unknown> }>): void {
    ev.stopPropagation();
    const v = ev.detail.value;
    const s = (x: unknown) => (typeof x === "string" ? x : "");
    this._emit(setRoomsOptions(this._config, { title: s(v.rooms_title), target_entity: s(v.target_entity) }));
  }

  private _onParts(ev: CustomEvent<{ value: Record<string, unknown> }>): void {
    ev.stopPropagation();
    const v = ev.detail.value;
    const s = (x: unknown) => (typeof x === "string" ? x : "");
    const vals: PartsValues = { stufa_title: s(v.stufa_title), stufa_entry: s(v.stufa_entry), thermo_title: s(v.thermo_title), thermo_entry: s(v.thermo_entry) };
    this._emit(applyParts(this._config, vals));
  }

  private _onGroup(group: EntityGroup, ev: CustomEvent<{ value: Record<string, unknown> }>): void {
    ev.stopPropagation();
    this._emit(applyGroup(this._config, group, ev.detail.value));
  }

  private _groupHead(id: string, icon: string, title: string, sub: string, warn: boolean) {
    const open = this._openGroup === id;
    return html`<button class="gh" aria-expanded=${open ? "true" : "false"} @click=${() => (this._openGroup = open ? null : id)}>
      <ha-icon icon=${icon}></ha-icon>
      <span class="gt"><span class="rn">${title}</span><span class=${warn ? "rs warn" : "rs"}>${sub}</span></span>
      <ha-icon icon=${open ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon>
    </button>`;
  }

  private _renderParts() {
    const open = this._openGroup === "parti";
    const v = partsValues(this._config);
    const sub = [v.stufa_title || v.stufa_entry ? "stufa personalizzata" : "", v.thermo_title || v.thermo_entry ? "termostato personalizzato" : ""].filter(Boolean).join(" · ") || "Titoli e voci di partenza";
    return html`<div class=${open ? "room open" : "room"}>
      ${this._groupHead("parti", "mdi:tune-variant", "Stufa e termostato", sub, false)}
      ${open
        ? html`<div class="rb">
            <ha-form
              .hass=${this.hass}
              .data=${v}
              .schema=${PARTS_SCHEMA}
              .computeLabel=${(s: FormSchema) => LABELS[s.name] ?? s.name}
              @value-changed=${(e: CustomEvent<{ value: Record<string, unknown> }>) => this._onParts(e)}
            ></ha-form>
          </div>`
        : nothing}
    </div>`;
  }

  private _renderGroup(g: EntityGroup) {
    const open = this._openGroup === g.id;
    const changed = groupChanged(this._config, g);
    const missing = groupMissing(this._config, g, (id) => this.hass.states[id] !== undefined);
    const sub = [`${g.items.length} entità`, changed ? `${changed} ${changed === 1 ? "cambiata" : "cambiate"}` : "", missing ? `${missing} non ${missing === 1 ? "trovata" : "trovate"}` : ""].filter(Boolean).join(" · ");
    const labels = Object.fromEntries(g.items.map((it) => [it.key, it.label]));
    const schema: FormSchema[] = g.items.map((it) => {
      const domain = keyDomain(it.key);
      return { name: it.key, selector: { entity: domain ? { filter: { domain } } : {} } };
    });
    return html`<div class=${open ? "room open" : "room"}>
      ${this._groupHead(g.id, g.icon, g.title, sub, missing > 0)}
      ${open
        ? html`<div class="rb">
            <ha-form
              .hass=${this.hass}
              .data=${groupValues(this._config, g)}
              .schema=${schema}
              .computeLabel=${(s: FormSchema) => labels[s.name] ?? s.name}
              @value-changed=${(e: CustomEvent<{ value: Record<string, unknown> }>) => this._onGroup(g, e)}
            ></ha-form>
          </div>`
        : nothing}
    </div>`;
  }

  private _add(): void {
    const rooms = addRoom(this._rooms());
    this._openRoom = rooms[rooms.length - 1].id;
    this._setRooms(rooms);
  }

  private _stateText(id: string, unit: string): string {
    const st = id ? this.hass.states[id] : undefined;
    if (!id) return "";
    if (!st) return "sensore non trovato";
    const n = Number(st.state);
    return Number.isFinite(n) ? `${n.toFixed(1).replace(".", ",")} ${unit}` : "non disponibile";
  }

  private _renderRoom(r: RoomDraft, i: number, count: number) {
    const open = this._openRoom === r.id;
    const complete = roomComplete(r);
    const sub = complete ? [this._stateText(r.temperature, "°C"), this._stateText(r.humidity, "%")].filter(Boolean).join(" · ") : "Manca il nome o un sensore: non compare nella scheda";
    return html`
      <div class=${open ? "room open" : "room"}>
        <div class="rh">
          <button class="rt" aria-expanded=${open ? "true" : "false"} @click=${() => (this._openRoom = open ? null : r.id)}>
            <span class="rn">${r.name.trim() || "Nuova stanza"}</span>
            <span class=${complete ? "rs" : "rs warn"}>${sub}</span>
          </button>
          <button class="ib" title="Sposta su" aria-label="Sposta su" ?disabled=${i === 0} @click=${() => this._setRooms(moveRoom(this._rooms(), i, -1))}><ha-icon icon="mdi:arrow-up"></ha-icon></button>
          <button class="ib" title="Sposta giù" aria-label="Sposta giù" ?disabled=${i === count - 1} @click=${() => this._setRooms(moveRoom(this._rooms(), i, 1))}><ha-icon icon="mdi:arrow-down"></ha-icon></button>
          <button class="ib del" title="Togli la stanza" aria-label="Togli la stanza" @click=${() => this._setRooms(removeRoom(this._rooms(), i))}><ha-icon icon="mdi:delete-outline"></ha-icon></button>
        </div>
        ${open
          ? html`<div class="rb">
              <ha-form
                .hass=${this.hass}
                .data=${{ name: r.name, short: r.short, temperature: r.temperature, humidity: r.humidity }}
                .schema=${ROOM_SCHEMA}
                .computeLabel=${(s: FormSchema) => LABELS[s.name] ?? s.name}
                @value-changed=${(e: CustomEvent<{ value: Record<string, unknown> }>) => this._onRoom(i, e)}
              ></ha-form>
            </div>`
          : nothing}
      </div>
    `;
  }

  render() {
    if (!this.hass) return nothing;
    const general = generalValues(this._config);
    const rooms = this._rooms();
    const opt = roomsOptions(this._config);
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${general}
        .schema=${GENERAL_SCHEMA}
        .computeLabel=${(s: FormSchema) => s.title ?? LABELS[s.name] ?? s.name}
        .computeHelper=${(s: FormSchema) => HELP[s.name] ?? ""}
        @value-changed=${(e: CustomEvent<{ value: Record<string, unknown> }>) => this._onGeneral(e)}
      ></ha-form>
      ${this._note ? html`<p class="note">${this._note}</p>` : nothing}
      ${general.show_rooms
        ? html`
            <h3>Stanze</h3>
            <p class="hint">Tocca una stanza per cambiare nome e sensori. L'ordine dell'elenco è quello delle colonne nella scheda.</p>
            <div class="rooms">${rooms.map((r, i) => this._renderRoom(r, i, rooms.length))}</div>
            <button class="add" @click=${() => this._add()}><ha-icon icon="mdi:plus"></ha-icon> Aggiungi una stanza</button>
            <ha-form
              class="ropt"
              .hass=${this.hass}
              .data=${{ rooms_title: opt.title, target_entity: opt.target_entity }}
              .schema=${ROOMS_OPT_SCHEMA}
              .computeLabel=${(s: FormSchema) => LABELS[s.name] ?? s.name}
              .computeHelper=${(s: FormSchema) => HELP[s.name] ?? ""}
              @value-changed=${(e: CustomEvent<{ value: Record<string, unknown> }>) => this._onRoomsOpt(e)}
            ></ha-form>
          `
        : nothing}
      <h3>Entità dell'impianto</h3>
      <p class="hint">Di solito non serve toccarle. Ogni campo mostra l'entità in uso; se lo svuoti torna quella di partenza.</p>
      <div class="rooms">${this._renderParts()}${ENTITY_GROUPS.map((g) => this._renderGroup(g))}</div>
      <p class="hint">Set boiler, stagione, soglie, assenza e taratura si regolano dall'ingranaggio «Preferenze» della scheda: valgono per l'impianto, non per l'aspetto.</p>
    `;
  }

  static styles = css`
    :host {
      display: block;
    }
    h3 {
      font-size: 16px;
      font-weight: 500;
      margin: 24px 0 4px;
    }
    .hint {
      font-size: 13px;
      line-height: 1.4;
      color: var(--secondary-text-color, #727272);
      margin: 4px 0 12px;
    }
    .note {
      font-size: 13px;
      color: var(--error-color, #db4437);
      margin: 8px 0 0;
    }
    .rooms {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .room {
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 12px;
      overflow: hidden;
    }
    .room.open {
      border-color: var(--primary-color, #03a9f4);
    }
    .rh {
      display: flex;
      align-items: center;
      gap: 2px;
      padding-right: 4px;
    }
    .rt {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;
      padding: 10px 12px;
      background: none;
      border: 0;
      color: inherit;
      font: inherit;
      text-align: left;
      cursor: pointer;
    }
    .rn {
      font-weight: 500;
    }
    .gh {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      min-height: 56px;
      background: none;
      border: 0;
      color: inherit;
      font: inherit;
      text-align: left;
      cursor: pointer;
    }
    .gh ha-icon {
      flex: none;
      color: var(--secondary-text-color, #727272);
    }
    .gt {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .rs {
      font-size: 12px;
      color: var(--secondary-text-color, #727272);
    }
    .rs.warn {
      color: var(--warning-color, #ffa600);
    }
    .ib {
      width: 44px;
      height: 44px;
      flex: none;
      display: grid;
      place-items: center;
      background: none;
      border: 0;
      border-radius: 50%;
      color: var(--secondary-text-color, #727272);
      cursor: pointer;
    }
    .ib:disabled {
      opacity: 0.3;
      cursor: default;
    }
    .ib.del {
      color: var(--error-color, #db4437);
    }
    .rb {
      padding: 4px 12px 12px;
    }
    .add {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin: 12px 0 20px;
      padding: 10px 16px;
      min-height: 44px;
      border: 1px dashed var(--primary-color, #03a9f4);
      border-radius: 12px;
      background: none;
      color: var(--primary-color, #03a9f4);
      font: inherit;
      font-weight: 500;
      cursor: pointer;
    }
    .ropt {
      display: block;
      margin-bottom: 16px;
    }
  `;
}

if (!customElements.get(TAG)) customElements.define(TAG, ImpiantoOverviewCardEditor);
