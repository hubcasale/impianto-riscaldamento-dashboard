import { LitElement, html, css, svg, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import type { HomeAssistant } from "./types";
import type { PlantEntities } from "./plant-card";
import {
  CHART_GROUPS, RANGES, allSeries, formatMoment, formatValue, linePath, niceAxis, normalizeValue, parseNumeric, parseStates,
  resample, seriesStats, stateAt, statusSegments, stoveStateColor, timeTicks,
  type Axis, type GroupDef, type Pt, type RawState, type SeriesDef, type Stats,
} from "./charts-logic";

const TAG = "impianto-charts-dialog";
const H_MS = 3600000;
const PLOT_H = 210;
const MT = 10;
const LABELS_H = 22;
const STRIP_H = 12;
const LIBERO: GroupDef = { id: "libero", title: "Confronto libero", normalized: true, series: allSeries() };

interface Computed {
  def: SeriesDef;
  cur: (number | null)[];
  prev: (number | null)[] | null;
  stats: Stats | null;
}

/**
 * Finestra "Grafici": storico dei valori principali dell'impianto letto dal recorder di Home Assistant.
 * Si aggiunge a document.body come le altre finestre. Grafici disegnati in SVG, senza librerie esterne.
 */
export class ImpiantoChartsDialog extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) entities!: PlantEntities;
  @state() private _group = CHART_GROUPS[0].id;
  @state() private _range = "24h";
  @state() private _compare = false;
  @state() private _normalized = false;
  @state() private _loading = false;
  @state() private _error = "";
  @state() private _w = 600;
  @state() private _hover: number | null = null;
  @state() private _hidden = new Set<string>();
  @state() private _shown = new Set<string>();
  @state() private _computed: Computed[] = [];
  private _t0 = 0;
  private _t1 = 0;
  private _n = 240;
  private _rawCur = new Map<string, Pt[]>();
  private _rawPrev = new Map<string, Pt[]>();
  private _states: ReturnType<typeof parseStates> = [];
  private _ro?: ResizeObserver;
  private _timer?: number;
  private _seq = 0;
  private _onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") this._close();
  };

  connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("keydown", this._onKey);
    this._timer = window.setInterval(() => void this._load(), 60000);
    void this._load();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("keydown", this._onKey);
    this._ro?.disconnect();
    if (this._timer) window.clearInterval(this._timer);
  }

  protected firstUpdated(): void {
    const wrap = this.renderRoot.querySelector(".chartwrap");
    if (!wrap) return;
    this._ro = new ResizeObserver((entries) => {
      const w = Math.floor(entries[0]?.contentRect.width ?? 600);
      if (w > 100 && Math.abs(w - this._w) > 2) {
        this._w = w;
        this._recompute();
      }
    });
    this._ro.observe(wrap);
  }

  private _close(): void {
    this.dispatchEvent(new CustomEvent("closed"));
    this.remove();
  }

  // ---- dati ----------------------------------------------------------------

  private get _def(): GroupDef {
    return this._group === LIBERO.id ? LIBERO : CHART_GROUPS.find((g) => g.id === this._group) ?? CHART_GROUPS[0];
  }

  private _entityOf(def: SeriesDef): string | undefined {
    return (this.entities as unknown as Record<string, string | undefined>)[def.entityKey];
  }

  /** Serie del grafico attuale che esistono in Home Assistant. */
  private _available(): SeriesDef[] {
    return this._def.series.filter((s) => {
      const id = this._entityOf(s);
      return id !== undefined && this.hass.states[id] !== undefined;
    });
  }

  private _isOn(def: SeriesDef): boolean {
    const key = `${this._def.id}:${def.id}`;
    if (this._shown.has(key)) return true;
    if (this._hidden.has(key)) return false;
    return !!def.on;
  }

  private async _history(ids: string[], start: number, end: number): Promise<Record<string, RawState[]>> {
    const cw = this.hass.callWS as unknown as (m: Record<string, unknown>) => Promise<Record<string, RawState[]>>;
    return cw.call(this.hass, {
      type: "history/history_during_period",
      start_time: new Date(start).toISOString(),
      end_time: new Date(end).toISOString(),
      entity_ids: ids,
      include_start_time_state: true,
      significant_changes_only: false,
      minimal_response: true,
      no_attributes: true,
    });
  }

  private async _load(): Promise<void> {
    if (!this.hass) return;
    const seq = ++this._seq;
    const range = RANGES.find((r) => r.id === this._range) ?? RANGES[1];
    const span = range.hours * H_MS;
    const now = Date.now();
    const defs = this._available();
    const ids = Array.from(new Set(defs.map((d) => this._entityOf(d) as string).concat(this.entities.stove_state)));
    this._loading = this._computed.length === 0;
    try {
      const cur = await this._history(ids, now - span, now);
      const prev = this._compare ? await this._history(ids, now - 2 * span, now - span) : null;
      if (seq !== this._seq) return; // nel frattempo è cambiato qualcosa: vale la richiesta più recente
      this._t0 = now - span;
      this._t1 = now;
      this._rawCur = new Map(Object.entries(cur).map(([k, v]) => [k, parseNumeric(v)]));
      this._rawPrev = new Map(prev ? Object.entries(prev).map(([k, v]) => [k, parseNumeric(v)]) : []);
      this._states = parseStates(cur[this.entities.stove_state]);
      this._error = "";
      this._recompute();
    } catch (err) {
      if (seq === this._seq) this._error = `Impossibile leggere lo storico: ${err instanceof Error ? err.message : String(err)}`;
    } finally {
      if (seq === this._seq) this._loading = false;
    }
  }

  private _recompute(): void {
    const n = Math.max(120, Math.min(360, Math.round(this._w / 2)));
    this._n = n;
    const span = this._t1 - this._t0;
    this._computed = this._available().map((def) => {
      const id = this._entityOf(def) as string;
      const cur = resample(this._rawCur.get(id) ?? [], this._t0, this._t1, n);
      const prev = this._compare ? resample(this._rawPrev.get(id) ?? [], this._t0 - span, this._t0, n) : null;
      return { def, cur, prev, stats: seriesStats(cur) };
    });
  }

  // ---- interazione -----------------------------------------------------------

  private _setGroup(id: string): void {
    this._group = id;
    this._hover = null;
    this._computed = [];
    void this._load();
  }

  private _setRange(id: string): void {
    this._range = id;
    this._hover = null;
    void this._load();
  }

  private _toggleCompare(): void {
    this._compare = !this._compare;
    void this._load();
  }

  private _toggleSeries(def: SeriesDef): void {
    const key = `${this._def.id}:${def.id}`;
    const turnOn = !this._isOn(def);
    const shown = new Set(this._shown);
    const hidden = new Set(this._hidden);
    if (turnOn) {
      shown.add(key);
      hidden.delete(key);
    } else {
      hidden.add(key);
      shown.delete(key);
    }
    this._shown = shown;
    this._hidden = hidden;
  }

  private _geometry() {
    const visible = this._computed.filter((c) => this._isOn(c.def));
    const norm = this._normalized || !!this._def.normalized;
    const hasRight = !norm && visible.some((c) => c.def.axis === "r");
    const ml = norm ? 38 : 46;
    const mr = hasRight ? 46 : 12;
    const plotW = Math.max(60, this._w - ml - mr);
    return { visible, norm, hasRight, ml, mr, plotW };
  }

  private _onMove(ev: PointerEvent): void {
    const g = this._geometry();
    const svgEl = ev.currentTarget as SVGSVGElement;
    const rect = svgEl.getBoundingClientRect();
    const x = ev.clientX - rect.left - g.ml;
    const i = Math.round((x / g.plotW) * (this._n - 1));
    this._hover = Math.max(0, Math.min(this._n - 1, i));
  }

  private _onLeave(ev: PointerEvent): void {
    if (ev.pointerType === "mouse") this._hover = null;
  }

  // ---- disegno ---------------------------------------------------------------

  private _axisFor(visible: Computed[], side: "l" | "r"): Axis | null {
    let min = Infinity;
    let max = -Infinity;
    for (const c of visible) {
      if (c.def.axis !== side) continue;
      for (const arr of [c.cur, c.prev ?? []]) {
        for (const v of arr) {
          if (v === null) continue;
          if (v < min) min = v;
          if (v > max) max = v;
        }
      }
    }
    return Number.isFinite(min) ? niceAxis(min, max, 5) : null;
  }

  private _renderChart() {
    const g = this._geometry();
    const { visible, norm, hasRight, ml, plotW } = g;
    const axL = norm ? null : this._axisFor(visible, "l");
    const axR = norm ? null : this._axisFor(visible, "r");
    const svgH = MT + PLOT_H + LABELS_H + STRIP_H + 6;
    const xOf = (i: number) => ml + (i / (this._n - 1)) * plotW;
    const yBase = MT + PLOT_H;
    const yFor = (c: Computed) => {
      if (norm) {
        const st = c.stats;
        return (v: number) => yBase - (st ? normalizeValue(v, st) : 0.5) * PLOT_H;
      }
      const ax = c.def.axis === "r" ? axR : axL;
      return (v: number) => (ax ? yBase - ((v - ax.min) / (ax.max - ax.min)) * PLOT_H : yBase);
    };
    const ticks = timeTicks(this._t0, this._t1, Math.max(3, Math.floor(plotW / 80)));
    const xOfT = (t: number) => ml + ((t - this._t0) / (this._t1 - this._t0)) * plotW;
    const segs = statusSegments(this._states, this._t0, this._t1);
    const hov = this._hover;
    const hx = hov !== null ? xOf(hov) : null;
    const gridAxis = axL ?? axR;

    return html`
      <div class="chartwrap">
        <svg width=${this._w} height=${svgH} viewBox="0 0 ${this._w} ${svgH}" role="img" aria-label="Grafico ${this._def.title}"
          @pointermove=${(e: PointerEvent) => this._onMove(e)} @pointerdown=${(e: PointerEvent) => this._onMove(e)} @pointerleave=${(e: PointerEvent) => this._onLeave(e)}>
          ${norm
            ? [0, 0.25, 0.5, 0.75, 1].map((f) => svg`<line class="grid" x1=${ml} x2=${ml + plotW} y1=${yBase - f * PLOT_H} y2=${yBase - f * PLOT_H} />`)
            : gridAxis?.ticks.map((tv) => {
                const y = yBase - ((tv - gridAxis.min) / (gridAxis.max - gridAxis.min)) * PLOT_H;
                return svg`<line class="grid" x1=${ml} x2=${ml + plotW} y1=${y} y2=${y} />`;
              })}
          ${norm
            ? svg`<text class="ax" x=${ml - 6} y=${MT + 4} text-anchor="end">max</text><text class="ax" x=${ml - 6} y=${yBase + 4} text-anchor="end">min</text>`
            : axL?.ticks.map((tv) => {
                const y = yBase - ((tv - axL.min) / (axL.max - axL.min)) * PLOT_H;
                return svg`<text class="ax" x=${ml - 6} y=${y + 4} text-anchor="end">${Number.isInteger(tv) ? tv : tv.toFixed(1).replace(".", ",")}</text>`;
              })}
          ${hasRight && axR
            ? axR.ticks.map((tv) => {
                const y = yBase - ((tv - axR.min) / (axR.max - axR.min)) * PLOT_H;
                return svg`<text class="ax" x=${ml + plotW + 6} y=${y + 4}>${Number.isInteger(tv) ? tv : tv.toFixed(1).replace(".", ",")}</text>`;
              })
            : nothing}
          ${ticks.map(
            (t) => svg`<line class=${t.major ? "vgrid major" : "vgrid"} x1=${xOfT(t.t)} x2=${xOfT(t.t)} y1=${MT} y2=${yBase} />
              <text class="ax" x=${xOfT(t.t)} y=${yBase + 15} text-anchor="middle">${t.label}</text>`,
          )}
          ${visible.map((c) =>
            c.prev
              ? svg`<path class="line prev" d=${linePath(c.prev, xOf, yFor(c))} stroke=${c.def.color} />`
              : nothing,
          )}
          ${visible.map((c) => svg`<path class="line" d=${linePath(c.cur, xOf, yFor(c))} stroke=${c.def.color} />`)}
          <!-- stato della caldaia -->
          ${segs.map(
            (s) => svg`<rect x=${xOfT(s.from)} y=${yBase + LABELS_H + 2} width=${Math.max(1, xOfT(s.to) - xOfT(s.from))} height=${STRIP_H} fill=${stoveStateColor(s.state)}><title>${s.state}</title></rect>`,
          )}
          ${hx !== null
            ? svg`<line class="cursor" x1=${hx} x2=${hx} y1=${MT} y2=${yBase} />
                ${visible.map((c) => {
                  const v = c.cur[hov as number];
                  return v === null ? nothing : svg`<circle cx=${hx} cy=${yFor(c)(v)} r="4" fill=${c.def.color} class="dot" />`;
                })}`
            : nothing}
        </svg>
        ${hov !== null ? this._renderTip(visible, hov, hx as number) : nothing}
      </div>
      <div class="strip-legend">
        <span class="swatch" style="background:#ef4444"></span>in lavoro
        <span class="swatch" style="background:#f59e0b"></span>accensione
        <span class="swatch" style="background:#60a5fa"></span>ECO STOP
        <span class="swatch" style="background:#475569"></span>spenta
        <small>(fascia sotto il grafico: stato della caldaia)</small>
      </div>
    `;
  }

  private _renderTip(visible: Computed[], i: number, x: number) {
    const t = this._t0 + (i / (this._n - 1)) * (this._t1 - this._t0);
    const st = stateAt(this._states, t);
    const left = x > this._w / 2;
    return html`
      <div class="tip ${left ? "l" : "r"}" style=${left ? `right:${this._w - x + 10}px` : `left:${x + 10}px`}>
        <div class="tt">${formatMoment(t)}</div>
        ${visible.map(
          (c) => html`<div class="tr">
            <i style="background:${c.def.color}"></i><span class="tn">${c.def.label}</span>
            <b>${formatValue(c.cur[i], c.def)}</b>
            ${c.prev ? html`<span class="pv">${formatValue(c.prev[i], c.def)}</span>` : nothing}
          </div>`,
        )}
        ${st ? html`<div class="tr"><i style="background:${stoveStateColor(st)}"></i><span class="tn">Caldaia</span><b>${st}</b></div>` : nothing}
        ${visible.some((c) => c.prev) ? html`<div class="note">grigio: stesso momento del periodo prima</div>` : nothing}
      </div>
    `;
  }

  private _renderTable(visible: Computed[]) {
    const hov = this._hover;
    if (visible.length === 0) return html`<div class="empty">Scegli almeno una serie qui sopra.</div>`;
    return html`
      <table>
        <thead>
          <tr><th></th><th>${hov !== null ? "Cursore" : "Ora"}</th><th>Min</th><th>Media</th><th>Max</th></tr>
        </thead>
        <tbody>
          ${visible.map((c) => {
            const v = hov !== null ? c.cur[hov] : c.stats?.last ?? null;
            return html`<tr>
              <td><i style="background:${c.def.color}"></i>${c.def.label}</td>
              <td><b>${formatValue(v, c.def)}</b></td>
              <td>${formatValue(c.stats?.min, c.def)}</td>
              <td>${formatValue(c.stats?.avg, c.def)}</td>
              <td>${formatValue(c.stats?.max, c.def)}</td>
            </tr>`;
          })}
        </tbody>
      </table>
    `;
  }

  render() {
    if (!this.hass || !this.entities) return nothing;
    const groups = [...CHART_GROUPS, LIBERO];
    const available = this._available();
    const visible = this._computed.filter((c) => this._isOn(c.def));
    const forced = !!this._def.normalized;
    return html`
      <div class="backdrop" @click=${(e: Event) => e.target === e.currentTarget && this._close()}>
        <div class="panel" role="dialog" aria-modal="true" aria-label="Grafici dell'impianto">
          <div class="head">
            <div class="title">Grafici</div>
            <button class="x" aria-label="Chiudi" @click=${() => this._close()}>✕</button>
          </div>
          <div class="body">
            <div class="tabs" role="tablist">
              ${groups.map(
                (gr) => html`<button role="tab" aria-selected=${gr.id === this._group} class=${gr.id === this._group ? "tab on" : "tab"} @click=${() => this._setGroup(gr.id)}>${gr.title}</button>`,
              )}
            </div>
            <div class="bar">
              <div class="seg">
                ${RANGES.map(
                  (r) => html`<button class=${r.id === this._range ? "on" : ""} @click=${() => this._setRange(r.id)}>${r.label}</button>`,
                )}
              </div>
              <label class="chk"><input type="checkbox" .checked=${this._compare} @change=${() => this._toggleCompare()} />Confronta con il periodo prima</label>
              <label class="chk" title="Ogni serie è riportata da 0 a 100 % del proprio intervallo: serve a confrontare le forme di grandezze diverse">
                <input type="checkbox" .checked=${forced || this._normalized} ?disabled=${forced} @change=${() => (this._normalized = !this._normalized)} />Confronta le forme (0–100 %)
              </label>
            </div>
            <div class="chips">
              ${available.map(
                (d) => html`<button class=${this._isOn(d) ? "chip on" : "chip"} aria-pressed=${this._isOn(d)} @click=${() => this._toggleSeries(d)}>
                  <i style="background:${this._isOn(d) ? d.color : "transparent"};border-color:${d.color}"></i>${d.label}
                </button>`,
              )}
            </div>
            ${this._error ? html`<div class="err">${this._error}</div>` : nothing}
            <div class="chartarea ${this._loading ? "loading" : ""}">${this._renderChart()} ${this._loading ? html`<div class="spin">Carico lo storico…</div>` : nothing}</div>
            ${this._renderTable(visible)}
            <p class="hint">Passa il dito o il mouse sul grafico per leggere i valori in ogni momento.</p>
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
      max-width: 940px;
      max-height: min(94vh, 900px);
      display: flex;
      flex-direction: column;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
      overflow: hidden;
    }
    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 18px;
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
      padding: 10px 18px 18px;
    }
    .tabs {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      padding-bottom: 6px;
    }
    .tab {
      flex: none;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.4));
      background: none;
      color: inherit;
      border-radius: 999px;
      padding: 7px 14px;
      font-size: 14px;
      cursor: pointer;
      font-family: inherit;
    }
    .tab.on {
      background: var(--primary-color, #03a9f4);
      border-color: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
      font-weight: 600;
    }
    .bar {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 16px;
      align-items: center;
      margin: 8px 0;
    }
    .seg {
      display: inline-flex;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.4));
      border-radius: 10px;
      overflow: hidden;
    }
    .seg button {
      background: none;
      border: none;
      color: inherit;
      padding: 7px 14px;
      cursor: pointer;
      font-size: 14px;
      font-family: inherit;
    }
    .seg button.on {
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.2));
      font-weight: 700;
    }
    .chk {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13.5px;
      cursor: pointer;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin: 6px 0 10px;
    }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.4));
      background: none;
      color: var(--secondary-text-color, #727272);
      border-radius: 999px;
      padding: 5px 11px;
      font-size: 13px;
      cursor: pointer;
      font-family: inherit;
    }
    .chip.on {
      color: var(--primary-text-color, #212121);
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
    }
    .chip i {
      width: 11px;
      height: 11px;
      border-radius: 50%;
      border: 2px solid;
      box-sizing: border-box;
    }
    .chartarea {
      position: relative;
    }
    .chartarea.loading svg {
      opacity: 0.35;
    }
    .spin {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--secondary-text-color, #727272);
    }
    .chartwrap {
      position: relative;
      width: 100%;
    }
    svg {
      display: block;
      touch-action: pan-y;
      user-select: none;
    }
    .grid {
      stroke: var(--divider-color, rgba(127, 127, 127, 0.3));
      stroke-width: 1;
    }
    .vgrid {
      stroke: var(--divider-color, rgba(127, 127, 127, 0.2));
      stroke-width: 1;
      stroke-dasharray: 2 4;
    }
    .vgrid.major {
      stroke-dasharray: none;
      stroke: var(--secondary-text-color, rgba(127, 127, 127, 0.5));
    }
    .ax {
      font-size: 11.5px;
      fill: var(--secondary-text-color, #727272);
    }
    .line {
      fill: none;
      stroke-width: 2.2;
      stroke-linejoin: round;
      stroke-linecap: round;
    }
    .line.prev {
      stroke-width: 1.6;
      stroke-dasharray: 5 4;
      opacity: 0.45;
    }
    .cursor {
      stroke: var(--primary-text-color, #212121);
      stroke-width: 1;
      opacity: 0.6;
    }
    .dot {
      stroke: var(--card-background-color, #fff);
      stroke-width: 2;
    }
    .tip {
      position: absolute;
      top: 6px;
      z-index: 2;
      pointer-events: none;
      min-width: 190px;
      max-width: 300px;
      padding: 8px 10px;
      border-radius: 10px;
      font-size: 12.5px;
      background: var(--card-background-color, #fff);
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.5));
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
    }
    .tt {
      font-weight: 700;
      margin-bottom: 4px;
    }
    .tr {
      display: flex;
      align-items: center;
      gap: 6px;
      line-height: 1.55;
    }
    .tr i,
    td i {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex: none;
      display: inline-block;
      margin-right: 6px;
    }
    .tr .tn {
      flex: 1;
      color: var(--secondary-text-color, #727272);
    }
    .tr .pv {
      color: var(--secondary-text-color, #727272);
      font-size: 11.5px;
    }
    .note {
      font-size: 11px;
      color: var(--secondary-text-color, #727272);
      margin-top: 2px;
    }
    .strip-legend {
      font-size: 12px;
      color: var(--secondary-text-color, #727272);
      display: flex;
      flex-wrap: wrap;
      gap: 4px 12px;
      align-items: center;
      margin: 2px 0 10px;
    }
    .swatch {
      display: inline-block;
      width: 12px;
      height: 8px;
      border-radius: 2px;
      margin-right: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13.5px;
    }
    th {
      text-align: right;
      font-weight: 600;
      color: var(--secondary-text-color, #727272);
      font-size: 12px;
      padding: 4px 6px;
    }
    th:first-child,
    td:first-child {
      text-align: left;
    }
    td {
      text-align: right;
      padding: 6px 6px;
      border-top: 1px solid var(--divider-color, rgba(127, 127, 127, 0.2));
      white-space: nowrap;
    }
    td:first-child {
      white-space: normal;
    }
    .empty,
    .hint {
      color: var(--secondary-text-color, #727272);
      font-size: 13px;
      margin: 10px 0 0;
    }
    .err {
      color: #ef4444;
      font-size: 13.5px;
      margin: 6px 0;
    }
    @media (max-width: 520px) {
      .body {
        padding: 8px 10px 14px;
      }
      td:nth-child(4) {
        display: none;
      }
      th:nth-child(4) {
        display: none;
      }
    }
  `;
}

if (!customElements.get(TAG)) customElements.define(TAG, ImpiantoChartsDialog);
