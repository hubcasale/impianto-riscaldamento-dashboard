import { LitElement, html, css, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import type { HomeAssistant } from "./types";
import { PENDING_MS, applyPending, buildSettingsView, clampValue, stepValue, writeService, type PendingMap, type RowView } from "./settings-logic";

const TAG = "impianto-settings-dialog";

/**
 * Finestra delle preferenze: si aggiunge a document.body (non sta dentro la scheda), così nessun contenitore
 * della dashboard può tagliarla o nasconderla. Gli interruttori e i numeri sono gli helper di Home Assistant
 * (input_boolean e input_number): ogni modifica è subito attiva e resta anche dopo un riavvio.
 */
export class ImpiantoSettingsDialog extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @state() private _open = new Set<string>();
  @state() private _error = "";
  private _pending: PendingMap = {};
  private _timers = new Map<string, number>();
  private _expiry?: number;
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

  private _toggleSection(title: string): void {
    const next = new Set(this._open);
    if (next.has(title)) next.delete(title);
    else next.add(title);
    this._open = next;
  }

  private _renderRow(row: RowView) {
    if (row.kind === "toggle") {
      return html`
        <div class="row tog">
          <div class="txt">
            <div class="lab">${row.label}</div>
            ${row.hint ? html`<div class="hint">${row.hint}</div>` : nothing}
          </div>
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
        <div class="txt">
          <div class="lab">${row.label}</div>
          ${row.hint ? html`<div class="hint">${row.hint}</div>` : nothing}
        </div>
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

  render() {
    if (!this.hass) return nothing;
    const built = applyPending(buildSettingsView(this.hass.states), this._pending, Date.now());
    for (const e of built.settled) delete this._pending[e];
    const sections = built.sections;
    return html`
      <div class="backdrop" @click=${(e: Event) => e.target === e.currentTarget && this._close()}>
        <div class="panel" role="dialog" aria-modal="true" aria-label="Preferenze impianto">
          <div class="head">
            <div class="title">Preferenze impianto</div>
            <button class="x" aria-label="Chiudi" @click=${() => this._close()}>✕</button>
          </div>
          <div class="body">
            ${sections.length === 0
              ? html`<div class="empty">Nessuna impostazione trovata: installa i pacchetti Home Assistant del progetto (cartella ha-packages).</div>`
              : sections.map((sec) => {
                  const open = !sec.advanced || this._open.has(sec.title);
                  return html`
                    <section>
                      ${sec.advanced
                        ? html`<button class="sec adv" aria-expanded=${open ? "true" : "false"} @click=${() => this._toggleSection(sec.title)}>
                            <span>${sec.title}</span><span class="chev">${open ? "▾" : "▸"}</span>
                          </button>`
                        : html`<div class="sec">${sec.title}</div>`}
                      ${open ? sec.rows.map((r) => this._renderRow(r)) : nothing}
                    </section>
                  `;
                })}
            ${this._error ? html`<div class="err">${this._error}</div>` : nothing}
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
      width: 46px;
      height: 26px;
      border-radius: 13px;
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
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #fff;
      transition: transform 0.15s;
    }
    .sw.on .knob {
      transform: translateX(20px);
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
      width: 34px;
      height: 34px;
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
      width: 64px;
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
