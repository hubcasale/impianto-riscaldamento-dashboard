import { LitElement, html, css, nothing } from "lit";
import { property } from "lit/decorators.js";
import type { SummaryLine } from "./summary-logic";

const TAG = "impianto-info-dialog";

/**
 * Finestra "Stato": che cosa sta succedendo all'impianto, in poche righe. Come quella delle preferenze si aggiunge
 * a document.body; la scheda le passa le righe aggiornate a ogni cambio di stato.
 */
export class ImpiantoInfoDialog extends LitElement {
  @property({ attribute: false }) lines: SummaryLine[] = [];
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
        <div class="panel" role="dialog" aria-modal="true" aria-label="Stato dell'impianto">
          <div class="head">
            <div class="title">Stato dell'impianto</div>
            <button class="x" aria-label="Chiudi" @click=${() => this._close()}>✕</button>
          </div>
          <div class="body">
            ${this.lines.length === 0
              ? html`<div class="empty">Nessuna informazione disponibile.</div>`
              : this.lines.map(
                  (l) => html`<div class="line ${l.tone}"><ha-icon icon=${l.icon}></ha-icon><span>${l.text}</span></div>`,
                )}
          </div>
        </div>
      </div>
      ${nothing}
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
      padding: 6px 10px;
      border-radius: 8px;
    }
    .x:hover {
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.15));
    }
    .body {
      overflow-y: auto;
      padding: 8px 18px 18px;
    }
    .line {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      padding: 10px 0;
      font-size: 15px;
      line-height: 1.4;
      border-bottom: 1px solid var(--divider-color, rgba(127, 127, 127, 0.2));
    }
    .line:last-child {
      border-bottom: none;
    }
    .line ha-icon {
      --mdc-icon-size: 22px;
      flex: none;
      color: var(--secondary-text-color, #727272);
    }
    .line.ok ha-icon {
      color: #22c55e;
    }
    .line.warn ha-icon {
      color: #f59e0b;
    }
    .line.bad {
      color: #ef4444;
      font-weight: 600;
    }
    .line.bad ha-icon {
      color: #ef4444;
    }
    .empty {
      padding: 16px 0;
      color: var(--secondary-text-color, #727272);
    }
  `;
}

if (!customElements.get(TAG)) customElements.define(TAG, ImpiantoInfoDialog);
