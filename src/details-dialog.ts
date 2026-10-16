import { LitElement, html, css, nothing } from "lit";
import { property } from "lit/decorators.js";

const TAG = "impianto-details-dialog";

export interface DetailTile {
  label: string;
  value: string;
  color?: string;
}

export interface DetailGroup {
  title: string;
  tiles: DetailTile[];
}

/**
 * Finestra "Altri dati": i valori della caldaia che non servono sempre sotto gli occhi (fumi, pressioni, estrattore,
 * consumo di pellet...). Come le altre finestre si aggiunge a document.body; la scheda le passa i gruppi aggiornati.
 */
export class ImpiantoDetailsDialog extends LitElement {
  @property({ attribute: false }) groups: DetailGroup[] = [];
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

  render() {
    return html`
      <div class="backdrop" @click=${(e: Event) => e.target === e.currentTarget && this._close()}>
        <div class="panel" role="dialog" aria-modal="true" aria-label="Altri dati della caldaia">
          <div class="head">
            <div class="title">Altri dati della caldaia</div>
            <button class="x" aria-label="Chiudi" @click=${() => this._close()}>✕</button>
          </div>
          <div class="body">
            ${this.groups.length === 0 ? html`<div class="empty">Nessun dato disponibile.</div>` : nothing}
            ${this.groups.map(
              (g) => html`
                <div class="gt">${g.title}</div>
                <div class="grid">
                  ${g.tiles.map(
                    (t) => html`<div class="tile"><span class="tl">${t.label}</span><span class="tv" style=${t.color ? `color:${t.color}` : ""}>${t.value}</span></div>`,
                  )}
                </div>`,
            )}
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
      max-width: 560px;
      max-height: min(86vh, 700px);
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
      padding: 10px 14px;
      border-radius: 10px;
    }
    .body {
      overflow-y: auto;
      padding: 4px 18px 18px;
    }
    .gt {
      margin: 14px 0 6px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--secondary-text-color, #727272);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 8px;
    }
    .tile {
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
      border-radius: 10px;
      padding: 8px 12px;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .tl {
      font-size: 12px;
      color: var(--secondary-text-color, #727272);
    }
    .tv {
      font-size: 18px;
      font-weight: 700;
    }
    .empty {
      padding: 16px 0;
      color: var(--secondary-text-color, #727272);
    }
  `;
}

if (!customElements.get(TAG)) customElements.define(TAG, ImpiantoDetailsDialog);
