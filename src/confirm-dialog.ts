import { LitElement, html, css } from "lit";
import { property } from "lit/decorators.js";

const TAG = "impianto-confirm-dialog";

/**
 * Finestra di conferma per i comandi che accendono o spengono qualcosa (caldaia, stufa): si aggiunge a document.body come le
 * altre. Il focus parte su «Annulla», così un tocco o un Invio distratti non eseguono il comando.
 * Eventi: "confirmed" (premuto il pulsante di conferma) e "closed" (sempre, alla chiusura).
 */
export class ImpiantoConfirmDialog extends LitElement {
  @property() heading = "";
  @property({ attribute: false }) lines: string[] = [];
  @property() confirmLabel = "Conferma";
  @property() cancelLabel = "Annulla";
  /** pulsante di conferma rosso (spegnimenti) invece che dell'azzurro del tema */
  @property({ type: Boolean }) danger = false;
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

  protected firstUpdated(): void {
    (this.renderRoot.querySelector("button.cancel") as HTMLElement | null)?.focus();
  }

  private _close(): void {
    this.dispatchEvent(new CustomEvent("closed"));
    this.remove();
  }

  private _confirm(): void {
    this.dispatchEvent(new CustomEvent("confirmed"));
    this._close();
  }

  render() {
    return html`
      <div class="backdrop" @click=${(e: Event) => e.target === e.currentTarget && this._close()}>
        <div class="panel" role="alertdialog" aria-modal="true" aria-label=${this.heading}>
          <div class="title">${this.heading}</div>
          ${this.lines.map((l) => html`<p>${l}</p>`)}
          <div class="row">
            <button class="cancel" @click=${() => this._close()}>${this.cancelLabel}</button>
            <button class=${this.danger ? "ok danger" : "ok"} @click=${() => this._confirm()}>${this.confirmLabel}</button>
          </div>
        </div>
      </div>
    `;
  }

  static styles = css`
    :host {
      position: fixed;
      inset: 0;
      z-index: 10001;
      color: var(--primary-text-color, #212121);
      font-family: var(--paper-font-body1_-_font-family, Roboto, Helvetica, Arial, sans-serif);
    }
    .backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px;
      box-sizing: border-box;
    }
    .panel {
      width: 100%;
      max-width: 420px;
      background: var(--card-background-color, #fff);
      border-radius: 16px;
      padding: 20px 20px 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      box-sizing: border-box;
    }
    .title {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 6px;
    }
    p {
      margin: 8px 0 0;
      font-size: 15px;
      line-height: 1.4;
      color: var(--secondary-text-color, #727272);
    }
    .row {
      display: flex;
      gap: 12px;
      margin-top: 20px;
    }
    button {
      flex: 1;
      min-height: 52px;
      border-radius: 14px;
      font: inherit;
      font-size: 17px;
      font-weight: 700;
      cursor: pointer;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.5));
    }
    .cancel {
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.15));
      color: inherit;
    }
    .ok {
      background: var(--primary-color, #03a9f4);
      border-color: transparent;
      color: var(--text-primary-color, #fff);
    }
    .ok.danger {
      background: #ef4444;
    }
    button:focus-visible {
      outline: 3px solid var(--primary-text-color, #212121);
      outline-offset: 2px;
    }
  `;
}

if (!customElements.get(TAG)) customElements.define(TAG, ImpiantoConfirmDialog);
