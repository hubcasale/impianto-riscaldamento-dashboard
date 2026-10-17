import { LitElement, html, css } from "lit";
import { property } from "lit/decorators.js";
import type { HomeAssistant } from "./types";

const TAG = "impianto-card-dialog";

type CardEl = HTMLElement & { hass: HomeAssistant; setConfig(c: Record<string, unknown>): void };

/**
 * Popup che mostra un'altra scheda (per esempio la scheda completa della stufa a pellet) a tutta pagina.
 * La scheda che apre il popup gli passa lo stato aggiornato a ogni cambio.
 */
export class ImpiantoCardDialog extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  /** nome dell'elemento della scheda da mostrare (per esempio "stufa-pellet-card") */
  @property() tag = "";
  /** configurazione da dare alla scheda */
  @property({ attribute: false }) config: Record<string, unknown> = {};
  /** titolo per i lettori di schermo */
  @property() label = "";
  private _card?: CardEl;
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

  private _ensureCard(): CardEl {
    if (!this._card) {
      const el = document.createElement(this.tag) as CardEl;
      el.setConfig({ type: `custom:${this.tag}`, ...this.config });
      this._card = el;
    }
    return this._card;
  }

  render() {
    const card = this._ensureCard();
    if (this.hass) card.hass = this.hass;
    return html`
      <div class="backdrop" @click=${(e: Event) => e.target === e.currentTarget && this._close()}>
        <div class="panel" role="dialog" aria-modal="true" aria-label=${this.label || this.tag}>
          <div class="bar"><button class="x" aria-label="Chiudi" @click=${() => this._close()}>✕</button></div>
          <div class="body">${card}</div>
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
      width: 100%;
      max-width: 620px;
      max-height: 94vh;
      display: flex;
      flex-direction: column;
      border-radius: 16px;
      overflow: hidden;
      background: var(--card-background-color, #fff);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
    }
    .bar {
      display: flex;
      justify-content: flex-end;
      padding: 4px 8px 0;
    }
    .x {
      width: 44px;
      height: 44px;
      background: none;
      border: none;
      color: inherit;
      font-size: 20px;
      cursor: pointer;
      border-radius: 50%;
    }
    .x:hover {
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.15));
    }
    .body {
      overflow-y: auto;
    }
  `;
}

if (!customElements.get(TAG)) customElements.define(TAG, ImpiantoCardDialog);
