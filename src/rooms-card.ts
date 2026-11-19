import { LitElement, html, css, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import type { HomeAssistant } from "./types";
import type { ImpiantoChartsDialog } from "./charts-dialog";
import type { PlantEntities } from "./plant-card";
import {
  BAR_MAX,
  BAR_MIN,
  TEMP_COLOR,
  barFraction,
  fmtNum,
  humClass,
  normalizeRooms,
  roomExists,
  roomValues,
  shortName,
  summarize,
  tempClass,
  toNum,
  type HumClass,
  type RoomValue,
} from "./rooms-logic";

const CARD_TAG = "impianto-rooms-card";

interface RoomsConfig {
  type?: string;
  /** titolo della scheda (predefinito «Stanze») */
  title?: string;
  /** stanze con i loro sensori (predefinito: soggiorno, cucina, 3 camere e 2 bagni) */
  rooms?: unknown;
  /** termostato di cui mostrare l'obiettivo come linea tratteggiata (predefinito climate.termostato) */
  target_entity?: string;
  /** dentro un'altra scheda (senza riquadro proprio) */
  embedded?: boolean;
  /** sensore dello stato della caldaia, per la striscia di stato dei grafici */
  stove_state?: string;
}

const HUM_COLOR: Record<HumClass, string> = { bad: "#f87171", amber: "#fbbf24", ok: "#4ade80", dry: "#60a5fa" };

/**
 * Scheda «Stanze»: temperatura e umidità di ogni stanza in colonne affiancate, con la linea dell'obiettivo del termostato,
 * tre chip di sintesi (più calda, più fredda, umidità alta). Un tocco su una stanza apre i grafici delle ultime ore.
 */
export class ImpiantoRoomsCard extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @state() private _config: RoomsConfig = {};
  private _dialog?: ImpiantoChartsDialog;

  setConfig(config: RoomsConfig): void {
    this._config = { ...config };
  }

  getCardSize(): number {
    return 5;
  }

  private get _rooms() {
    return normalizeRooms(this._config.rooms);
  }

  /** Le stanze da mostrare: tutte quelle della configurazione, ma solo se almeno un sensore esiste in Home Assistant. */
  private _values(): RoomValue[] | null {
    if (!this.hass) return null;
    const rooms = this._rooms;
    const exists = (id: string) => !!id && this.hass.states[id] !== undefined;
    if (!rooms.some((r) => roomExists(r, exists))) return null;
    return roomValues(rooms, (id) => this.hass.states[id]?.state);
  }

  private _target(): number | null {
    const id = this._config.target_entity ?? "climate.termostato";
    return toNum(String(this.hass?.states[id]?.attributes?.temperature ?? ""));
  }

  private _open(roomId: string): void {
    if (this._dialog) return;
    const d = document.createElement("impianto-charts-dialog") as ImpiantoChartsDialog;
    d.hass = this.hass;
    d.entities = { stove_state: this._config.stove_state ?? "sensor.casale_stato", cless_mode: "input_boolean.impianto_modo_cless" } as unknown as PlantEntities;
    d.rooms = this._rooms;
    d.focusRoom = roomId;
    d.addEventListener("closed", () => {
      this._dialog = undefined;
    });
    document.body.appendChild(d);
    this._dialog = d;
  }

  private _column(v: RoomValue) {
    const missing = v.t === null && v.h === null;
    const color = v.t === null ? "var(--secondary-text-color)" : TEMP_COLOR[tempClass(v.t)];
    const frac = v.t === null ? 0.04 : Math.max(0.1, barFraction(v.t));
    const hcol = v.h === null ? "var(--secondary-text-color)" : HUM_COLOR[humClass(v.h)];
    const title = missing ? `${v.room.name}: sensore non disponibile` : `${v.room.name}: ${fmtNum(v.t)} °C, ${v.h === null ? "–" : Math.round(v.h)} %`;
    return html`
      <div class=${missing ? "col off" : "col"} role=${missing ? "presentation" : "button"} tabindex=${missing ? "-1" : "0"} title=${title}
        @click=${() => !missing && this._open(v.room.id)}
        @keydown=${(e: KeyboardEvent) => !missing && (e.key === "Enter" || e.key === " ") && this._open(v.room.id)}>
        <div class="plot">
          <div class="bar" style="height:${(frac * 100).toFixed(1)}%;background:${missing ? "var(--divider-color)" : color}">
            <span>${fmtNum(v.t)}</span>
          </div>
        </div>
        <div class="hum" style="color:${hcol}">${v.h === null ? "–" : `${Math.round(v.h)} %`}</div>
        <div class="nm">${shortName(v.room)}</div>
      </div>
    `;
  }

  render() {
    const values = this._values();
    if (!values) return nothing;
    const sum = summarize(values);
    const target = this._target();
    const embedded = this._config.embedded === true;
    const targetFrac = target === null || target < BAR_MIN || target > BAR_MAX ? null : barFraction(target);
    const body = html`
      <div class="rooms">
        <div class="head">
          <h3>${this._config.title ?? "Stanze"}</h3>
          <div class="sum">
          ${sum.warmest ? html`<div class="chip">Più calda: <b style="color:${TEMP_COLOR.warm}">${shortName(sum.warmest.room)} ${fmtNum(sum.warmest.t)} °C</b></div>` : nothing}
          ${sum.coolest && sum.coolest !== sum.warmest
            ? html`<div class="chip">Più fredda: <b style="color:${TEMP_COLOR.cool}">${shortName(sum.coolest.room)} ${fmtNum(sum.coolest.t)} °C</b></div>`
            : nothing}
          ${sum.humid.map((h) => html`<div class="chip bad">Umidità alta: <b>${shortName(h.room)} ${Math.round(h.h as number)} %</b></div>`)}
          </div>
        </div>
        <div class="area" style="--n:${values.length}">
          ${targetFrac === null
            ? nothing
            : html`<div class="tline" style="bottom:calc(var(--below) + (100% - var(--below)) * ${targetFrac.toFixed(4)})"><span>obiettivo ${fmtNum(target)}</span></div>`}
          ${values.map((v) => this._column(v))}
        </div>
      </div>
    `;
    return embedded ? html`<div class="embed">${body}</div>` : html`<ha-card>${body}</ha-card>`;
  }

  static styles = css`
    :host {
      display: block;
      container-type: inline-size;
    }
    ha-card {
      overflow: hidden;
    }
    .embed {
      background: var(--secondary-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 20px;
      height: 100%;
      box-sizing: border-box;
    }
    .rooms {
      padding: 10px 14px 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      height: 100%;
      box-sizing: border-box;
      --below: 50px;
    }
    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 6px 10px;
    }
    h3 {
      margin: 0;
      font-size: 17px;
      font-weight: 700;
      color: var(--primary-text-color);
    }
    .sum {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 6px;
    }
    .chip {
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 12px;
      padding: 3px 10px;
      font-size: 12px;
      color: var(--primary-text-color);
    }
    .chip.bad {
      background: rgba(248, 113, 113, 0.14);
      border-color: rgba(248, 113, 113, 0.55);
    }
    .area {
      position: relative;
      display: grid;
      grid-template-columns: repeat(var(--n), minmax(0, 1fr));
      gap: 6px;
      flex: 1;
      min-height: 112px;
      margin-top: 12px;
    }
    .col {
      display: grid;
      grid-template-rows: 1fr auto auto;
      align-items: end;
      justify-items: center;
      cursor: pointer;
      outline: none;
      border-radius: 10px;
      min-width: 0;
    }
    .col.off {
      cursor: default;
      opacity: 0.7;
    }
    .col:focus-visible {
      box-shadow: 0 0 0 2px var(--primary-color);
    }
    .plot {
      width: 100%;
      height: 100%;
      min-height: 70px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }
    .bar {
      width: min(46px, 78%);
      border-radius: 8px 8px 4px 4px;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding-top: 6px;
      box-sizing: border-box;
      color: #111;
      font-weight: 700;
      font-size: 13px;
      min-height: 10px;
      position: relative;
      z-index: 1;
    }
    .hum {
      margin-top: 6px;
      font-size: 12.5px;
      font-weight: 700;
      background: var(--card-background-color);
      border-radius: 10px;
      padding: 2px 9px;
    }
    .nm {
      margin-top: 3px;
      font-size: 11.5px;
      line-height: 1.15;
      text-align: center;
      color: var(--secondary-text-color);
      overflow-wrap: break-word;
      min-height: 14px;
    }
    .tline {
      position: absolute;
      left: 0;
      right: 0;
      border-top: 2px dashed var(--secondary-text-color);
      opacity: 0.8;
      pointer-events: none;
      z-index: 0;
    }
    .tline span {
      position: absolute;
      right: 0;
      top: -19px;
      font-size: 11px;
      color: var(--secondary-text-color);
      background: var(--secondary-background-color);
      padding: 0 4px;
    }
    /* su schermi stretti (telefono) i testi si riducono per non spezzare i nomi */
    @container (max-width: 480px) {
      .rooms {
        padding: 12px 10px 8px;
      }
      .area {
        gap: 3px;
      }
      .nm {
        font-size: 9.5px;
        letter-spacing: -0.2px;
      }
      .hum {
        font-size: 11px;
        padding: 2px 5px;
      }
      .bar {
        font-size: 11px;
        width: 84%;
      }
      .chip {
        font-size: 12px;
        padding: 4px 10px;
      }
    }
  `;
}

if (!customElements.get(CARD_TAG)) customElements.define(CARD_TAG, ImpiantoRoomsCard);
