import { LitElement, html, css, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { HOPPER, afterBags, kgAtDepth } from "./hopper-logic";
import { hopperSvg } from "./hopper-svg";

const TAG = "impianto-pellet-dialog";

export interface PelletInfo {
  /** chili rimasti adesso (null = non si sa) */
  kg: number | null;
  /** consumo medio al giorno usato per l'autonomia */
  perDay: number | null;
  /** peso di un sacco */
  bagKg: number;
}

const fmt = (n: number, d = 0) => n.toFixed(d).replace(".", ",");

/**
 * Finestra «Pellet nel serbatoio»: quanto ne resta, quanti giorni bastano e i due modi di aggiornare il conteggio:
 * dopo aver versato dei sacchi, oppure misurando la quota del pellet dalla sommita' del serbatoio.
 * La scheda riceve gli eventi `bags` (numero di sacchi) e `level` (profondita' in cm) e scrive i valori di riferimento.
 */
export class ImpiantoPelletDialog extends LitElement {
  @property({ attribute: false }) info: PelletInfo = { kg: null, perDay: null, bagKg: HOPPER.bagKg };
  @state() private _bags = 1;
  @state() private _depth = "";
  @state() private _done = "";
  private _onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") this._close();
  };

  connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("keydown", this._onKey);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("keydown", this._onKey);
  }

  private _close(): void {
    this.dispatchEvent(new CustomEvent("closed"));
    this.remove();
  }

  private _step(dir: 1 | -1): void {
    this._bags = Math.max(0.5, Math.min(8, this._bags + dir * 0.5));
  }

  private _addBags(): void {
    this.dispatchEvent(new CustomEvent("bags", { detail: this._bags }));
    this._done = `Aggiunti ${fmt(this._bags, this._bags % 1 ? 1 : 0)} ${this._bags === 1 ? "sacco" : "sacchi"}.`;
  }

  private _setLevel(): void {
    const d = Number(this._depth.replace(",", "."));
    if (!Number.isFinite(d) || d < 0 || d > 94) return;
    this.dispatchEvent(new CustomEvent("level", { detail: d }));
    this._done = `Livello impostato a ${fmt(d, 1)} cm: ${fmt(kgAtDepth(d))} kg.`;
    this._depth = "";
  }

  render() {
    const { kg, perDay, bagKg } = this.info;
    const days = kg !== null && perDay ? kg / perDay : null;
    const after = kg !== null ? afterBags(kg, this._bags, bagKg) : null;
    const d = Number(this._depth.replace(",", "."));
    const levelOk = this._depth.trim() !== "" && Number.isFinite(d) && d >= 0 && d <= 94;
    return html`
      <div class="backdrop" @click=${(e: Event) => e.target === e.currentTarget && this._close()}>
        <div class="panel" role="dialog" aria-modal="true" aria-label="Pellet nel serbatoio">
          <div class="head">
            <div class="title">Pellet nel serbatoio</div>
            <button class="x" aria-label="Chiudi" @click=${() => this._close()}>✕</button>
          </div>
          <div class="body">
            <div class="top">
              <div class="fig">${hopperSvg(kg, "Serbatoio del pellet")}</div>
              <div class="num">
                <div class="big">${kg === null ? "–" : fmt(kg)}<span> kg</span></div>
                <div class="sub">${kg === null ? "quantità non nota" : `${fmt((kg / HOPPER.capacityKg) * 100)} % di ${HOPPER.capacityKg} kg (${HOPPER.capacityKg / bagKg} sacchi)`}</div>
                <div class="sub">${days === null ? "" : `circa ${fmt(days, days < 10 ? 1 : 0)} giorni al consumo di ${fmt(perDay ?? 0, 1)} kg al giorno`}</div>
              </div>
            </div>

            ${kg === null ? html`<div class="hint warn">Il conteggio non è ancora impostato: parti dal livello misurato (qui sotto), poi potrai aggiungere i sacchi.</div>` : nothing}
            <div class="sec">Ho versato dei sacchi</div>
            <div class="row">
              <div class="stepper">
                <button class="st" aria-label="Meno" @click=${() => this._step(-1)}>−</button>
                <div class="sv">${fmt(this._bags, this._bags % 1 ? 1 : 0)}<span> ${this._bags === 1 ? "sacco" : "sacchi"} da ${bagKg} kg</span></div>
                <button class="st" aria-label="Più" @click=${() => this._step(1)}>+</button>
              </div>
              <button class="btn primary" ?disabled=${kg === null} @click=${() => this._addBags()}>Aggiungi</button>
            </div>
            <div class="hint">${after === null ? "" : `Dopo il carico: ${fmt(after)} kg${kg !== null && kg + this._bags * bagKg > HOPPER.capacityKg ? " (il serbatoio è pieno)" : ""}.`}</div>

            <div class="sec">Oppure ho misurato il livello</div>
            <div class="row">
              <label class="field">
                <span>Quota del pellet dalla sommità (cm)</span>
                <input type="text" inputmode="decimal" .value=${this._depth} placeholder="es. 7,5" @input=${(e: Event) => (this._depth = (e.target as HTMLInputElement).value)} />
              </label>
              <button class="btn primary" ?disabled=${!levelOk} @click=${() => this._setLevel()}>Imposta</button>
            </div>
            <div class="hint">${levelOk ? `${fmt(d, 1)} cm sono circa ${fmt(kgAtDepth(d))} kg.` : "Misura dal bordo alto del serbatoio fino alla superficie del pellet, dopo averla livellata."}</div>

            ${this._done ? html`<div class="done">${this._done}</div>` : nothing}
            <div class="note">Da qui in poi i chili rimasti diminuiscono con il consumo stimato dalla scheda. Aggiorna il conteggio ogni volta che riempi il serbatoio o misuri il livello.</div>
          </div>
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
      background: var(--card-background-color, #fff);
      border-radius: 16px;
      width: 100%;
      max-width: 520px;
      max-height: min(92vh, 720px);
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
    .body {
      overflow-y: auto;
      padding: 12px 18px 18px;
    }
    .top {
      display: flex;
      gap: 18px;
      align-items: center;
    }
    .fig {
      flex: none;
      width: 84px;
    }
    .hopper-svg {
      width: 100%;
      height: auto;
      display: block;
    }
    .big {
      font-size: 40px;
      font-weight: 700;
      line-height: 1.1;
    }
    .big span {
      font-size: 18px;
      font-weight: 500;
      color: var(--secondary-text-color, #727272);
    }
    .sub {
      font-size: 13.5px;
      color: var(--secondary-text-color, #727272);
      margin-top: 2px;
    }
    .sec {
      margin: 18px 0 6px;
      font-size: 12.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--primary-color, #03a9f4);
    }
    .row {
      display: flex;
      gap: 12px;
      align-items: flex-end;
      justify-content: space-between;
      flex-wrap: wrap;
    }
    .stepper {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .st {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.5));
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
      color: inherit;
      font-size: 22px;
      cursor: pointer;
      padding: 0;
    }
    .sv {
      min-width: 130px;
      text-align: center;
      font-size: 22px;
      font-weight: 600;
    }
    .sv span {
      display: block;
      font-size: 12.5px;
      font-weight: 400;
      color: var(--secondary-text-color, #727272);
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
      min-width: 160px;
      font-size: 12.5px;
      color: var(--secondary-text-color, #727272);
    }
    input {
      min-height: 48px;
      font-size: 18px;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 10px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.5));
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #212121);
      box-sizing: border-box;
    }
    .btn {
      min-height: 48px;
      padding: 8px 20px;
      border-radius: 12px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.5));
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
      color: inherit;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn.primary {
      background: var(--primary-color, #03a9f4);
      color: #fff;
      border-color: transparent;
    }
    .btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .hint.warn {
      color: #f59e0b;
      font-weight: 600;
    }
    .hint {
      margin-top: 6px;
      font-size: 13px;
      color: var(--secondary-text-color, #727272);
      min-height: 18px;
    }
    .done {
      margin-top: 14px;
      padding: 10px 12px;
      border-radius: 10px;
      background: rgba(34, 197, 94, 0.16);
      color: #22c55e;
      font-size: 14px;
      font-weight: 600;
    }
    .note {
      margin-top: 14px;
      font-size: 12.5px;
      line-height: 1.4;
      color: var(--secondary-text-color, #727272);
    }
  `;
}

if (!customElements.get(TAG)) customElements.define(TAG, ImpiantoPelletDialog);
