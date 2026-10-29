import { LitElement, html, css, svg, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import type { HomeAssistant } from "./types";
import { formatMoment, niceAxis, parseNumeric, timeTicks, type Pt, type RawState } from "./charts-logic";
import {
  PELLET_RANGES, calibration, consumptionBuckets, detectEvents, mergeSeries, rangeStart, runOut, statsToPoints, summarizePeriod, valueAt,
  type Bucket, type PelletEvent,
} from "./pellet-charts-logic";

const TAG = "impianto-pellet-charts-dialog";
const PLOT_H = 230;
const BARS_H = 150;
const BT = 24;
const ML = 40;
const MR = 12;
const MT = 24;
const MB = 22;
const CAPACITY = 120;
const DAYS = ["dom", "lun", "mar", "mer", "gio", "ven", "sab"];
const MESI = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];

const fmt = (n: number, d = 1) => n.toFixed(d).replace(".", ",");
const sign = (n: number, d = 1) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${fmt(Math.abs(n), d)}`;
const dayLabel = (t: number) => {
  const d = new Date(t);
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MESI[d.getMonth()]}`;
};

/** Identificatori delle entità usate dai grafici del pellet. */
export interface PelletChartIds {
  remaining: string;
  total: string;
  factor?: string;
}

interface Loaded {
  t0: number;
  t1: number;
  rem: Pt[];
  tot: Pt[];
  events: PelletEvent[];
  buckets: Bucket[];
  bucket: "hour" | "day";
  /** storico del fattore di taratura (chi cambia il fattore cambia anche le stime da quel momento) */
  factor: Pt[];
  /** lo storico dettagliato non copre tutto il periodo (il registratore conserva pochi giorni) */
  partial: boolean;
}

/**
 * Finestra «Pellet: consumi e caricamenti»: chili rimasti nel tempo con i caricamenti e le letture del livello evidenziati,
 * consumo stimato per giorno, autonomia e taratura. Legge lo storico di Home Assistant; i caricamenti e le letture non sono
 * registrati a parte: si riconoscono dai salti del conteggio (vedi pellet-charts-logic.ts).
 */
export class ImpiantoPelletChartsDialog extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) ids!: PelletChartIds;
  @property({ attribute: false }) bagKg = 15;
  /** consumo medio al giorno usato dalla scheda quando i dati del periodo sono pochi */
  @property({ attribute: false }) perDay = 6;
  @state() private _range = "7d";
  @state() private _showLoads = true;
  @state() private _showReads = true;
  @state() private _showGap = true;
  @state() private _loading = false;
  @state() private _error = "";
  @state() private _w = 600;
  @state() private _data: Loaded | null = null;
  @state() private _selT: number | null = null;
  @state() private _selBar: number | null = null;
  private _ro?: ResizeObserver;
  private _timer?: number;
  private _seq = 0;
  private _onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") this._close();
  };

  connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("keydown", this._onKey);
    this._timer = window.setInterval(() => void this._load(), 120000);
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
      if (w > 100 && Math.abs(w - this._w) > 2) this._w = w;
    });
    this._ro.observe(wrap);
  }

  private _close(): void {
    this.dispatchEvent(new CustomEvent("closed"));
    this.remove();
  }

  // ---- dati ----------------------------------------------------------------

  private _ws<T>(msg: Record<string, unknown>): Promise<T> {
    const cw = this.hass.callWS as unknown as (m: Record<string, unknown>) => Promise<T>;
    return cw.call(this.hass, msg);
  }

  private async _load(): Promise<void> {
    if (!this.hass || !this.ids) return;
    const seq = ++this._seq;
    const range = PELLET_RANGES.find((r) => r.id === this._range) ?? PELLET_RANGES[2];
    const now = Date.now();
    const t0 = rangeStart(range, now);
    const { remaining, total } = this.ids;
    this._loading = this._data === null;
    try {
      const hist = await this._ws<Record<string, RawState[]>>({
        type: "history/history_during_period",
        start_time: new Date(t0).toISOString(),
        end_time: new Date(now).toISOString(),
        entity_ids: this.ids.factor ? [remaining, total, this.ids.factor] : [remaining, total],
        include_start_time_state: true,
        significant_changes_only: false,
        minimal_response: true,
        no_attributes: true,
      });
      if (seq !== this._seq) return;
      const factor = this.ids.factor ? parseNumeric(hist[this.ids.factor]) : [];
      const remH = parseNumeric(hist[remaining]);
      const totH = parseNumeric(hist[total]);
      const firstH = Math.min(remH[0]?.t ?? now, totH[0]?.t ?? now);
      const partial = firstH > t0 + 3 * 3600000;
      let rem = remH;
      let tot = totH;
      if (partial) {
        // prima dello storico dettagliato restano le statistiche a lungo termine (un valore all'ora)
        try {
          const st = await this._ws<Record<string, { start?: number; end?: number; mean?: number | null; state?: number | null }[]>>({
            type: "recorder/statistics_during_period",
            start_time: new Date(t0).toISOString(),
            end_time: new Date(firstH).toISOString(),
            statistic_ids: [remaining, total],
            period: "hour",
            types: ["mean", "state"],
          });
          rem = mergeSeries(statsToPoints(st[remaining], "mean"), remH);
          tot = mergeSeries(statsToPoints(st[total], "state"), totH);
        } catch {
          /* senza statistiche si vede solo lo storico */
        }
      }
      if (seq !== this._seq) return;
      const fineFrom = Math.max(t0, Math.min(remH[0]?.t ?? now, totH[0]?.t ?? now));
      const events = detectEvents(remH, totH, fineFrom, now, this.bagKg);
      this._data = { t0, t1: now, rem, tot, events, factor, buckets: consumptionBuckets(tot, t0, now, range.bucket), bucket: range.bucket, partial };
      this._error = "";
      if (this._selT !== null && (this._selT < t0 || this._selT > now)) this._selT = null;
    } catch (e) {
      this._error = `Non riesco a leggere lo storico: ${(e as Error)?.message ?? e}`;
    } finally {
      if (seq === this._seq) this._loading = false;
    }
  }

  private _setRange(id: string): void {
    if (id === this._range) return;
    this._range = id;
    this._selT = null;
    this._selBar = null;
    this._data = null;
    void this._load();
  }

  // ---- grafico dei chili rimasti ----------------------------------------------

  private _renderLevel(d: Loaded) {
    const W = this._w;
    const pw = Math.max(50, W - ML - MR);
    const axis = { min: 0, max: CAPACITY, ticks: [0, 30, 60, 90, 120] };
    const x = (t: number) => ML + ((t - d.t0) / Math.max(1, d.t1 - d.t0)) * pw;
    const y = (v: number) => MT + (1 - (v - axis.min) / (axis.max - axis.min)) * PLOT_H;
    const inside = d.rem.filter((p) => p.t >= d.t0 && p.t <= d.t1);
    const stride = Math.max(1, Math.ceil(inside.length / 1400));
    const pts: Pt[] = inside.filter((_, i) => i % stride === 0);
    if (inside.length && pts[pts.length - 1] !== inside[inside.length - 1]) pts.push(inside[inside.length - 1]);
    if (pts.length) pts.push({ t: d.t1, v: pts[pts.length - 1].v });
    const line = pts.map((p, i) => `${i ? "L" : "M"}${x(p.t).toFixed(1)} ${y(p.v).toFixed(1)}`).join("");
    const area = pts.length ? `${line}L${x(pts[pts.length - 1].t).toFixed(1)} ${y(0)}L${x(pts[0].t).toFixed(1)} ${y(0)}Z` : "";
    const ticks = this._ticks(d, Math.max(3, Math.floor(pw / 90)));
    const sel = this._selT;
    const selV = sel !== null ? valueAt(d.rem, sel) : null;
    const ev = d.events.filter((e) => e.t >= d.t0 && e.t <= d.t1);
    const H = MT + PLOT_H + MB;
    return svg`
      <svg width=${W} height=${H} viewBox="0 0 ${W} ${H}" role="img" aria-label="Chili di pellet rimasti nel serbatoio"
        @pointerdown=${(e: PointerEvent) => this._pick(e, d, x)} @pointermove=${(e: PointerEvent) => e.pointerType === "mouse" && this._pick(e, d, x)}>
        <defs><linearGradient id="pcg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9922b" stop-opacity="0.45" /><stop offset="1" stop-color="#d9922b" stop-opacity="0.04" /></linearGradient></defs>
        ${axis.ticks.map((v) => svg`<line class="grid" x1=${ML} x2=${W - MR} y1=${y(v)} y2=${y(v)} /><text class="ax" x=${ML - 6} y=${y(v) + 4} text-anchor="end">${v}</text>`)}
        <text class="ax" x="4" y="12">kg</text>
        ${ticks.map((tk) => svg`<line class=${tk.major ? "vgrid major" : "vgrid"} x1=${x(tk.t)} x2=${x(tk.t)} y1=${MT} y2=${MT + PLOT_H} /><text class="ax" x=${x(tk.t)} y=${MT + PLOT_H + 15} text-anchor="middle">${tk.label}</text>`)}
        <line class="cap" x1=${ML} x2=${W - MR} y1=${y(CAPACITY)} y2=${y(CAPACITY)} />
        ${area ? svg`<path d=${area} fill="url(#pcg)" />` : nothing}
        ${line ? svg`<path class="line" d=${line} />` : nothing}
        ${ev.map((e) => this._marker(e, x, y))}
        ${sel !== null && selV !== null ? svg`<line class="cursor" x1=${x(sel)} x2=${x(sel)} y1=${MT} y2=${MT + PLOT_H} /><circle class="dot" cx=${x(sel)} cy=${y(selV)} r="4.5" fill="#d9922b" />` : nothing}
      </svg>
    `;
  }

  /** Tacche dell'asse del tempo: con i periodi a giorni una per giorno (mezzanotte locale, anche col cambio dell'ora), altrimenti a ore. */
  private _ticks(d: Loaded, maxTicks: number) {
    if (d.bucket === "hour") return timeTicks(d.t0, d.t1, maxTicks);
    const days = Math.ceil((d.t1 - d.t0) / 86400000);
    const every = Math.max(1, Math.ceil(days / maxTicks));
    const out: { t: number; label: string; major: boolean }[] = [];
    const c = new Date(d.t0);
    c.setHours(0, 0, 0, 0);
    for (let i = 0; c.getTime() <= d.t1; i++, c.setDate(c.getDate() + 1)) {
      if (c.getTime() < d.t0 || i % every) continue;
      out.push({ t: c.getTime(), label: days > 14 ? `${c.getDate()} ${MESI[c.getMonth()]}` : `${DAYS[c.getDay()]} ${c.getDate()}`, major: true });
    }
    return out;
  }

  private _marker(e: PelletEvent, x: (t: number) => number, y: (v: number) => number) {
    const cx = x(e.t);
    if (e.kind === "carico") {
      if (!this._showLoads) return nothing;
      return svg`
        <line class="evline load" x1=${cx} x2=${cx} y1=${y(e.before)} y2=${y(e.after)} />
        <path class="load" d="M${cx} ${y(e.after) - 9}l6 10h-12z" />
        <text class="evtxt load" x=${cx} y=${y(e.after) - 13} text-anchor="middle">${sign(e.delta, 0)} kg</text>`;
    }
    if (!this._showReads) return nothing;
    return svg`
      ${this._showGap ? svg`<line class="evline gap" x1=${cx} x2=${cx} y1=${y(e.before)} y2=${y(e.after)} />` : nothing}
      <circle class="read" cx=${cx} cy=${y(e.after)} r="5.5" />
      <text class="evtxt read" x=${cx > this._w - 150 ? cx - 8 : cx + 8} text-anchor=${cx > this._w - 150 ? "end" : "start"} y=${y(e.after) + (e.after < 20 ? -8 : 15)}>${fmt(e.after, 1)} kg${this._showGap ? html` (${sign(e.delta)})` : ""}</text>`;
  }

  private _pick(ev: PointerEvent, d: Loaded, x: (t: number) => number): void {
    const svgEl = ev.currentTarget as SVGSVGElement;
    const r = svgEl.getBoundingClientRect();
    const px = ev.clientX - r.left;
    const t = d.t0 + ((px - ML) / Math.max(1, this._w - ML - MR)) * (d.t1 - d.t0);
    // vicino a un caricamento o a una lettura si aggancia a quello
    const near = d.events.find((e) => Math.abs(x(e.t) - px) <= 14);
    this._selT = Math.max(d.t0, Math.min(d.t1, near ? near.t : t));
  }

  private _renderTip(d: Loaded) {
    if (this._selT === null) return nothing;
    const t = this._selT;
    const v = valueAt(d.rem, t);
    const px = ML + ((t - d.t0) / Math.max(1, d.t1 - d.t0)) * Math.max(50, this._w - ML - MR);
    const near = d.events.find((e) => Math.abs(e.t - t) < Math.max(5 * 60000, (d.t1 - d.t0) / 200));
    const left = px > this._w / 2 ? { right: `${this._w - px + 8}px` } : { left: `${px + 8}px` };
    const style = Object.entries(left).map(([k, val]) => `${k}:${val}`).join(";");
    return html`<div class="tip" style=${style}>
      <div class="tt">${formatMoment(t)}</div>
      <div class="tr"><i style="background:#d9922b"></i><span class="tn">Rimasti</span><b>${v === null ? "–" : `${fmt(v)} kg`}</b></div>
      ${near
        ? near.kind === "carico"
          ? html`<div class="tr ev load"><span class="tn">Caricamento</span><b>${sign(near.delta)} kg${near.bags ? ` · ${fmt(near.bags, near.bags % 1 ? 1 : 0)} ${near.bags === 1 ? "sacco" : "sacchi"}` : ""}</b></div>
              <div class="note">da ${fmt(near.before)} a ${fmt(near.after)} kg</div>`
          : html`<div class="tr ev read"><span class="tn">Lettura del livello</span><b>${fmt(near.after)} kg</b></div>
              <div class="note">la stima diceva ${fmt(near.before)} kg: scarto ${sign(near.delta)} kg${near.ratio !== null ? ` · consumo reale ${fmt(near.ratio * 100, 0)} % della stima` : ""}</div>`
        : nothing}
    </div>`;
  }

  // ---- consumo per giorno -------------------------------------------------------

  private _renderBars(d: Loaded) {
    const W = this._w;
    const pw = Math.max(50, W - ML - MR);
    const bs = d.buckets;
    if (bs.length === 0) return html`<p class="empty">Nessun dato di consumo nel periodo.</p>`;
    const max = Math.max(0.5, ...bs.map((b) => b.kg));
    const axis = niceAxis(0, max, 4);
    const y = (v: number) => BT + (1 - (v - axis.min) / (axis.max - axis.min)) * BARS_H;
    const slot = pw / bs.length;
    const bw = Math.max(3, Math.min(54, slot * 0.7));
    const full = bs.filter((b) => !b.partial);
    const avg = full.length ? full.reduce((s, b) => s + b.kg, 0) / full.length : null;
    const labels = bs.length <= 16;
    const unit = d.bucket === "hour" ? "kg/h" : "kg/giorno";
    const H = BT + BARS_H + 22;
    const every = Math.max(1, Math.ceil(bs.length / Math.max(3, Math.floor(pw / 60))));
    const label = (b: Bucket) => (d.bucket === "hour" ? `${String(new Date(b.t0).getHours()).padStart(2, "0")}:00` : `${DAYS[new Date(b.t0).getDay()]} ${new Date(b.t0).getDate()}`);
    return svg`
      <svg width=${W} height=${H} viewBox="0 0 ${W} ${H}" role="img" aria-label="Consumo stimato di pellet">
        ${axis.ticks.map((v) => svg`<line class="grid" x1=${ML} x2=${W - MR} y1=${y(v)} y2=${y(v)} /><text class="ax" x=${ML - 6} y=${y(v) + 4} text-anchor="end">${fmt(v, v % 1 ? 1 : 0)}</text>`)}
        <text class="ax" x="4" y="9">${unit}</text>
        ${bs.map((b, i) => {
          const cx = ML + slot * (i + 0.5);
          const top = y(b.kg);
          const on = this._selBar === i;
          return svg`<g class="bar" @pointerdown=${() => (this._selBar = on ? null : i)}>
            <rect x=${ML + slot * i} y=${BT} width=${slot} height=${BARS_H} fill="transparent" />
            <rect class=${`b${b.partial ? " partial" : ""}${on ? " on" : ""}`} x=${cx - bw / 2} y=${top} width=${bw} height=${Math.max(0.5, y(0) - top)} rx="3" />
            ${labels || on ? svg`<text class="blab" x=${cx} y=${top - 4} text-anchor="middle">${fmt(b.kg, 1)}</text>` : nothing}
            ${i % every === 0 ? svg`<text class="ax" x=${cx} y=${BT + BARS_H + 15} text-anchor="middle">${label(b)}</text>` : nothing}
          </g>`;
        })}
        ${avg !== null ? svg`<line class="avg" x1=${ML} x2=${W - MR} y1=${y(avg)} y2=${y(avg)} /><text class="avgt" x=${W - MR} y=${y(avg) - 4} text-anchor="end">media ${fmt(avg, 1)}</text>` : nothing}
      </svg>
    `;
  }

  private _renderBarReadout(d: Loaded) {
    if (this._selBar === null) return html`<p class="hint">Tocca una colonna per leggere il consumo di quel ${d.bucket === "hour" ? "ora" : "giorno"}.</p>`;
    const b = d.buckets[this._selBar];
    if (!b) return nothing;
    const when = d.bucket === "hour" ? `${dayLabel(b.t0)}, ${String(new Date(b.t0).getHours()).padStart(2, "0")}:00` : dayLabel(b.t0);
    return html`<p class="hint"><b>${when}</b>: ${fmt(b.kg, 2)} kg stimati${b.partial ? " (non ancora finito)" : ""}.</p>`;
  }

  // ---- riepilogo, eventi, taratura -----------------------------------------------

  private _tile(label: string, value: string, sub = "") {
    return html`<div class="tile"><div class="tl">${label}</div><div class="tv">${value}</div>${sub ? html`<div class="ts">${sub}</div>` : nothing}</div>`;
  }

  private _renderSummary(d: Loaded) {
    const s = summarizePeriod(d.tot, d.events, d.t0, d.t1);
    const remNow = d.rem.length ? d.rem[d.rem.length - 1].v : null;
    const rate = s.perDay !== null && s.days >= 3 ? s.perDay : this.perDay;
    const out = runOut(remNow, rate, d.t1);
    const dd = out ? new Date(out.date) : null;
    return html`<div class="tiles">
      ${this._tile("Rimasti adesso", remNow === null ? "–" : `${fmt(remNow)} kg`, remNow === null ? "" : `${fmt((remNow / CAPACITY) * 100, 0)} % del serbatoio`)}
      ${this._tile("Consumo medio", s.perDay === null ? "–" : `${fmt(s.perDay)} kg/giorno`, `stima su ${fmt(s.days, s.days < 10 ? 1 : 0)} giorni`)}
      ${this._tile("Consumati nel periodo", `${fmt(s.consumed)} kg`, "stima della scheda")}
      ${this._tile("Caricati nel periodo", `${fmt(s.loaded, 0)} kg`, s.bags ? `${fmt(s.bags, s.bags % 1 ? 1 : 0)} ${s.bags === 1 ? "sacco" : "sacchi"}` : "nessun caricamento")}
      ${this._tile("Finisce", dd ? `${DAYS[dd.getDay()]} ${dd.getDate()} ${MESI[dd.getMonth()]}` : "–", out ? `tra ${fmt(out.days, out.days < 10 ? 1 : 0)} giorni a ${fmt(rate)} kg/giorno` : "")}
    </div>`;
  }

  private _renderEvents(d: Loaded) {
    const ev = d.events.filter((e) => e.t >= d.t0).slice().reverse();
    if (ev.length === 0) return html`<p class="empty">Nel periodo non risultano caricamenti né letture del livello${d.partial ? " nello storico dettagliato" : ""}.</p>`;
    return html`<table>
      <thead><tr><th>Quando</th><th>Cosa</th><th>Chili</th><th>Dettaglio</th></tr></thead>
      <tbody>
        ${ev.map(
          (e) => html`<tr class=${e.kind === "carico" ? "load" : "read"} @click=${() => (this._selT = e.t)}>
            <td>${formatMoment(e.t)}</td>
            <td>${e.kind === "carico" ? html`<span class="badge load">Caricamento</span>` : html`<span class="badge read">Lettura</span>`}</td>
            <td>${e.kind === "carico" ? `${sign(e.delta)}` : fmt(e.after)} kg</td>
            <td class="det">${e.kind === "carico"
              ? `${e.bags ? `${fmt(e.bags, e.bags % 1 ? 1 : 0)} ${e.bags === 1 ? "sacco" : "sacchi"}, ` : ""}da ${fmt(e.before)} a ${fmt(e.after)} kg`
              : `stima ${fmt(e.before)} kg, scarto ${sign(e.delta)} kg${e.ratio !== null ? `, consumo reale ${fmt(e.ratio * 100, 0)} % della stima` : ""}`}</td>
          </tr>`,
        )}
      </tbody>
    </table>`;
  }

  private _renderCalibration(d: Loaded) {
    const f = this.ids.factor ? Number(this.hass.states[this.ids.factor]?.state) : NaN;
    const cur = Number.isFinite(f) ? f : null;
    const c = calibration(d.events, d.tot, d.factor, cur);
    if (!c) return html`<p class="hint">Per controllare la taratura servono almeno due eventi con una lettura del livello in mezzo: la scheda confronta quanto pellet è sceso davvero con quanto aveva stimato.</p>`;
    const same = c.suggested !== null && cur !== null && Math.abs(c.suggested - cur) < 0.03;
    return html`<div class="calib">
      <b>Taratura della stima</b>
      <p>Nelle ${c.readings} ${c.readings === 1 ? "lettura" : "letture"} del livello il pellet sceso davvero è stato il <b>${fmt(c.ratio * 100, 0)} %</b> di quello stimato
      (${fmt(c.usedKg, 0)} kg stimati${c.usedFactor !== null ? `, con il fattore di allora, in media ${fmt(c.usedFactor, 2)}` : ""}).
      ${c.suggested !== null
        ? same
          ? html`Il fattore attuale (${fmt(cur as number, 2)}) è già quello che torna con le letture.`
          : html`Il fattore che avrebbe dato la stima giusta è <b>${fmt(c.suggested, 2)}</b>${cur !== null ? ` (adesso ${fmt(cur, 2)}; cambialo dalle preferenze, blocco «Pellet»)` : ""}. Dopo averlo cambiato il valore resta lo stesso: le stime passate non si ricalcolano.`
        : nothing}
      ${c.usedKg < 15 ? " Sono pochi chili: aspetta altre letture prima di cambiare il fattore." : ""}</p>
    </div>`;
  }

  // ---- pagina ---------------------------------------------------------------

  render() {
    const d = this._data;
    return html`
      <div class="backdrop" @click=${(e: Event) => e.target === e.currentTarget && this._close()}>
        <div class="panel" role="dialog" aria-modal="true" aria-label="Pellet: consumi e caricamenti">
          <div class="head">
            <div class="title">Pellet: consumi e caricamenti</div>
            <button class="x" aria-label="Chiudi" @click=${() => this._close()}>✕</button>
          </div>
          <div class="body">
            <div class="chips" role="group" aria-label="Periodo">
              ${PELLET_RANGES.map((r) => html`<button class=${r.id === this._range ? "chip on" : "chip"} aria-pressed=${r.id === this._range} @click=${() => this._setRange(r.id)}>${r.label}</button>`)}
            </div>
            ${this._error ? html`<div class="err">${this._error}</div>` : nothing}
            ${d ? this._renderSummary(d) : nothing}
            <div class="sect">Chili rimasti nel serbatoio</div>
            <div class="chips" role="group" aria-label="Cosa evidenziare">
              <button class=${this._showLoads ? "chip on" : "chip"} aria-pressed=${this._showLoads} @click=${() => (this._showLoads = !this._showLoads)}><i class="load"></i>Caricamenti</button>
              <button class=${this._showReads ? "chip on" : "chip"} aria-pressed=${this._showReads} @click=${() => (this._showReads = !this._showReads)}><i class="read"></i>Letture del livello</button>
              <button class=${this._showGap ? "chip on" : "chip"} aria-pressed=${this._showGap} ?disabled=${!this._showReads} @click=${() => (this._showGap = !this._showGap)}><i class="gap"></i>Scarto della stima</button>
            </div>
            <div class="chartarea ${this._loading ? "loading" : ""}">
              <div class="chartwrap">${d ? this._renderLevel(d) : html`<div style="height:${PLOT_H + MT + MB}px"></div>`}${d ? this._renderTip(d) : nothing}</div>
              ${this._loading ? html`<div class="spin">Carico lo storico…</div>` : nothing}
            </div>
            ${d?.partial ? html`<p class="hint">Lo storico dettagliato non copre tutto il periodo (Home Assistant ne conserva pochi giorni): prima si vede solo un andamento approssimato, senza caricamenti né letture.</p>` : nothing}
            ${d ? html`<div class="sect">Consumo stimato ${d.bucket === "hour" ? "per ora" : "per giorno"}</div>${this._renderBars(d)}${this._renderBarReadout(d)}` : nothing}
            ${d ? html`<div class="sect">Caricamenti e letture del livello</div>${this._renderEvents(d)}${this._renderCalibration(d)}` : nothing}
            <p class="hint">Il consumo è una stima della scheda (potenza, stand-by e accensioni); la lettura del livello la corregge e si vede come scarto.</p>
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
      padding: 8px 12px;
      border-radius: 8px;
    }
    .x:hover {
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.15));
    }
    .body {
      overflow-y: auto;
      padding: 10px 18px 18px;
    }
    .sect {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--secondary-text-color, #727272);
      margin: 16px 0 4px;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin: 6px 0 8px;
    }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      min-height: 36px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.4));
      background: none;
      color: var(--secondary-text-color, #727272);
      border-radius: 999px;
      padding: 6px 13px;
      font-size: 13.5px;
      cursor: pointer;
      font-family: inherit;
    }
    .chip.on {
      color: var(--primary-text-color, #212121);
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
      border-color: var(--secondary-text-color, #727272);
    }
    .chip:disabled {
      opacity: 0.4;
    }
    .chip i {
      width: 11px;
      height: 11px;
      border-radius: 50%;
      border: 2px solid;
      box-sizing: border-box;
      display: inline-block;
    }
    i.load {
      border-color: #22c55e;
      background: #22c55e;
      border-radius: 2px;
    }
    i.read {
      border-color: #3b82f6;
      background: #3b82f6;
    }
    i.gap {
      border-color: #f97316;
      background: #f97316;
      border-radius: 1px;
      width: 4px;
    }
    .tiles {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 8px;
      margin: 6px 0 4px;
    }
    .tile {
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
      border-radius: 12px;
      padding: 8px 12px;
    }
    .tl {
      font-size: 12px;
      color: var(--secondary-text-color, #727272);
    }
    .tv {
      font-size: 19px;
      font-weight: 700;
      margin-top: 1px;
    }
    .ts {
      font-size: 11.5px;
      color: var(--secondary-text-color, #727272);
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
    .cap {
      stroke: #22c55e;
      stroke-width: 1;
      stroke-dasharray: 6 4;
      opacity: 0.55;
    }
    .ax {
      font-size: 11.5px;
      fill: var(--secondary-text-color, #727272);
    }
    .line {
      fill: none;
      stroke: #d9922b;
      stroke-width: 2.4;
      stroke-linejoin: round;
      stroke-linecap: round;
    }
    .evline {
      stroke-width: 2.4;
      stroke-dasharray: 4 3;
    }
    .evline.load {
      stroke: #22c55e;
    }
    .evline.gap {
      stroke: #f97316;
      stroke-dasharray: none;
      stroke-width: 3.2;
      opacity: 0.85;
    }
    path.load {
      fill: #22c55e;
    }
    circle.read {
      fill: #3b82f6;
      stroke: var(--card-background-color, #fff);
      stroke-width: 2;
    }
    .evtxt {
      font-size: 11.5px;
      font-weight: 700;
    }
    .evtxt.load {
      fill: #16a34a;
    }
    .evtxt.read {
      fill: #2563eb;
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
      min-width: 200px;
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
    .tr i {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex: none;
      display: inline-block;
    }
    .tr .tn {
      flex: 1;
      color: var(--secondary-text-color, #727272);
    }
    .tr.ev.load b {
      color: #16a34a;
    }
    .tr.ev.read b {
      color: #2563eb;
    }
    .note {
      font-size: 11.5px;
      color: var(--secondary-text-color, #727272);
      margin-top: 2px;
    }
    rect.b {
      fill: #d9922b;
      opacity: 0.85;
    }
    rect.b.partial {
      opacity: 0.45;
    }
    rect.b.on {
      fill: #f59e0b;
      opacity: 1;
    }
    .blab {
      font-size: 11px;
      fill: var(--primary-text-color, #212121);
    }
    .avg {
      stroke: var(--secondary-text-color, #727272);
      stroke-width: 1.5;
      stroke-dasharray: 5 4;
    }
    .avgt {
      font-size: 11.5px;
      fill: var(--secondary-text-color, #727272);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13.5px;
    }
    th {
      text-align: left;
      font-weight: 600;
      color: var(--secondary-text-color, #727272);
      font-size: 12px;
      padding: 4px 6px;
    }
    td {
      padding: 7px 6px;
      border-top: 1px solid var(--divider-color, rgba(127, 127, 127, 0.2));
      vertical-align: top;
    }
    tr:hover td {
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.08));
    }
    td.det {
      color: var(--secondary-text-color, #727272);
      font-size: 12.5px;
    }
    .badge {
      display: inline-block;
      border-radius: 999px;
      padding: 2px 9px;
      font-size: 12px;
      font-weight: 700;
      color: #fff;
    }
    .badge.load {
      background: #16a34a;
    }
    .badge.read {
      background: #2563eb;
    }
    .calib {
      margin-top: 10px;
      padding: 10px 14px;
      border-radius: 12px;
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
      font-size: 13.5px;
    }
    .calib p {
      margin: 4px 0 0;
    }
    .empty,
    .hint {
      color: var(--secondary-text-color, #727272);
      font-size: 13px;
      margin: 8px 0 0;
    }
    .err {
      color: #ef4444;
      font-size: 13.5px;
      margin: 6px 0;
    }
    @media (max-width: 560px) {
      .body {
        padding: 8px 10px 14px;
      }
      td.det {
        display: none;
      }
      th:nth-child(4) {
        display: none;
      }
    }
  `;
}

if (!customElements.get(TAG)) customElements.define(TAG, ImpiantoPelletChartsDialog);
