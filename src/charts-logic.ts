// Logica pura dei grafici: lettura dello storico di Home Assistant, campionamento, scale e assi, statistiche.
// Nessuna dipendenza da Lit o da Home Assistant, così si prova con node:test.

export interface Pt {
  /** millisecondi */
  t: number;
  v: number;
}

export interface StatePt {
  t: number;
  s: string;
}

/** Forma di uno stato nella risposta di `history/history_during_period` (con minimal_response i nomi sono abbreviati). */
export interface RawState {
  s?: string;
  state?: string;
  lu?: number | string;
  lc?: number | string;
  last_updated?: number | string;
  last_changed?: number | string;
}

function toMs(v: number | string | undefined): number | null {
  if (v === undefined || v === null) return null;
  if (typeof v === "number") return v < 1e11 ? v * 1000 : v; // secondi o millisecondi
  const d = Date.parse(v);
  return Number.isNaN(d) ? null : d;
}

function rawTime(r: RawState): number | null {
  return toMs(r.lu ?? r.last_updated ?? r.lc ?? r.last_changed);
}

function rawState(r: RawState): string | undefined {
  return r.s ?? r.state;
}

/** Punti numerici in ordine di tempo; gli stati non numerici (unavailable, unknown ...) si scartano. */
export function parseNumeric(raw: RawState[] | undefined): Pt[] {
  const out: Pt[] = [];
  for (const r of raw ?? []) {
    const t = rawTime(r);
    const s = rawState(r);
    if (t === null || s === undefined || s === "" || s === "unavailable" || s === "unknown") continue;
    const v = Number(s);
    if (Number.isFinite(v)) out.push({ t, v });
  }
  return out.sort((a, b) => a.t - b.t);
}

/** Stati testuali (stato della caldaia) in ordine di tempo. */
export function parseStates(raw: RawState[] | undefined): StatePt[] {
  const out: StatePt[] = [];
  for (const r of raw ?? []) {
    const t = rawTime(r);
    const s = rawState(r);
    if (t !== null && s !== undefined) out.push({ t, s });
  }
  return out.sort((a, b) => a.t - b.t);
}

/** Dopo quanto tempo senza letture il valore non si considera più valido (ms). */
export const MAX_GAP_MS = 3 * 3600 * 1000;

/**
 * `n` valori tra `t0` e `t1`: media pesata nel tempo del valore tenuto fino alla lettura successiva.
 * Nessun valore (null) prima della prima lettura e dopo `maxGap` senza letture.
 */
export function resample(pts: Pt[], t0: number, t1: number, n: number, maxGap = MAX_GAP_MS): (number | null)[] {
  const out: (number | null)[] = new Array(n).fill(null);
  if (n <= 0 || t1 <= t0) return out;
  const dt = (t1 - t0) / n;
  let idx = 0; // prima lettura dopo l'inizio del secchio
  let curV: number | null = null;
  let curT = 0;
  for (let i = 0; i < n; i++) {
    const a = t0 + i * dt;
    const b = a + dt;
    while (idx < pts.length && pts[idx].t <= a) {
      curV = pts[idx].v;
      curT = pts[idx].t;
      idx++;
    }
    let sum = 0;
    let cov = 0;
    let segStart = a;
    let v = curV;
    let vT = curT;
    const addSeg = (end: number) => {
      if (v === null) return;
      const validEnd = Math.min(end, vT + maxGap);
      const len = validEnd - segStart;
      if (len > 0) {
        sum += v * len;
        cov += len;
      }
    };
    let k = idx;
    while (k < pts.length && pts[k].t < b) {
      addSeg(pts[k].t);
      segStart = pts[k].t;
      v = pts[k].v;
      vT = pts[k].t;
      k++;
    }
    addSeg(b);
    out[i] = cov > 0 ? sum / cov : null;
  }
  return out;
}

export interface Stats {
  min: number;
  max: number;
  avg: number;
  last: number;
}

export function seriesStats(values: (number | null)[]): Stats | null {
  let min = Infinity;
  let max = -Infinity;
  let sum = 0;
  let cnt = 0;
  let last: number | null = null;
  for (const v of values) {
    if (v === null) continue;
    if (v < min) min = v;
    if (v > max) max = v;
    sum += v;
    cnt++;
    last = v;
  }
  return cnt === 0 || last === null ? null : { min, max, avg: sum / cnt, last };
}

/** Passo "tondo" (1, 2, 2.5, 5 per una potenza di 10) per i numeri sugli assi. */
function niceStep(raw: number): number {
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const f = raw / p;
  const m = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return m * p;
}

export interface Axis {
  min: number;
  max: number;
  ticks: number[];
}

/** Scala con numeri tondi che contiene [min, max]. */
export function niceAxis(min: number, max: number, count = 5): Axis {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return { min: 0, max: 1, ticks: [0, 1] };
  if (max - min < 1e-9) {
    const c = min;
    min = c - 1;
    max = c + 1;
  }
  const step = niceStep((max - min) / Math.max(1, count - 1));
  const lo = Math.floor(min / step + 1e-9) * step;
  const hi = Math.ceil(max / step - 1e-9) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step * 1e-6; v += step) ticks.push(Math.round(v / step) * step);
  return { min: lo, max: hi, ticks };
}

const DAYS = ["dom", "lun", "mar", "mer", "gio", "ven", "sab"];

function hhmm(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export interface TimeTick {
  t: number;
  label: string;
  /** inizio giornata: tratto più marcato */
  major: boolean;
}

const STEPS_H = [1, 2, 3, 6, 12, 24, 48];

/** Tacche dell'asse del tempo, ogni 1/2/3/6/12/24 ore a seconda della durata. */
export function timeTicks(t0: number, t1: number, maxTicks = 6): TimeTick[] {
  const hours = (t1 - t0) / 3600000;
  const stepH = STEPS_H.find((s) => hours / s <= maxTicks) ?? 48;
  const stepMs = stepH * 3600000;
  const first = new Date(t0);
  // allinea alla prossima ora tonda multipla dello passo (per i giorni: mezzanotte)
  first.setMinutes(0, 0, 0);
  if (stepH >= 24) first.setHours(0);
  else first.setHours(Math.ceil(first.getHours() / stepH) * stepH);
  const out: TimeTick[] = [];
  for (let t = first.getTime(); t <= t1; t += stepMs) {
    if (t < t0) continue;
    const d = new Date(t);
    const major = d.getHours() === 0;
    out.push({ t, major, label: hours > 30 ? (major ? `${DAYS[d.getDay()]} ${d.getDate()}` : hhmm(d)) : hhmm(d) });
  }
  return out;
}

/** "ven 10 ott, 12:34" */
export function formatMoment(t: number): string {
  const d = new Date(t);
  const mesi = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
  return `${DAYS[d.getDay()]} ${d.getDate()} ${mesi[d.getMonth()]}, ${hhmm(d)}`;
}

/** Percorso SVG di una linea; i valori nulli interrompono la linea. */
export function linePath(values: (number | null)[], xOf: (i: number) => number, yOf: (v: number) => number): string {
  let d = "";
  let pen = false;
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (v === null) {
      pen = false;
      continue;
    }
    d += `${pen ? "L" : "M"}${xOf(i).toFixed(1)} ${yOf(v).toFixed(1)}`;
    pen = true;
  }
  return d;
}

export interface Segment {
  from: number;
  to: number;
  state: string;
}

/** Tratti dello stato nel periodo [t0, t1]; lo stato precedente al periodo si estende dall'inizio. */
export function statusSegments(states: StatePt[], t0: number, t1: number): Segment[] {
  const out: Segment[] = [];
  let cur: StatePt | null = null;
  for (const p of states) {
    if (p.t <= t0) cur = p;
    else break;
  }
  let from = t0;
  let state = cur?.s ?? "";
  for (const p of states) {
    if (p.t <= t0 || p.t >= t1) continue;
    if (state !== "") out.push({ from, to: p.t, state });
    from = p.t;
    state = p.s;
  }
  if (state !== "" && from < t1) out.push({ from, to: t1, state });
  // unisce i tratti consecutivi con lo stesso stato
  const merged: Segment[] = [];
  for (const s of out) {
    const last = merged[merged.length - 1];
    if (last && last.state === s.state && last.to === s.from) last.to = s.to;
    else merged.push({ ...s });
  }
  return merged;
}

export function stateAt(states: StatePt[], t: number): string | null {
  let cur: string | null = null;
  for (const p of states) {
    if (p.t <= t) cur = p.s;
    else break;
  }
  return cur;
}

/** Colore dello stato della caldaia per la fascia sotto il grafico. */
export function stoveStateColor(state: string): string {
  const s = state.trim().toUpperCase();
  if (["WORK", "LAVORO", "WORKING"].includes(s)) return "#ef4444";
  if (["START", "WAIT", "AVVIO", "ATTESA", "ACCENSIONE"].includes(s)) return "#f59e0b";
  if (s === "ECO STOP") return "#60a5fa";
  if (["STAND BY", "STANDBY"].includes(s)) return "#a78bfa";
  if (s.startsWith("ALARM") || s === "ALLARME") return "#b91c1c";
  if (["UNAVAILABLE", "UNKNOWN"].includes(s)) return "transparent";
  return "#475569"; // OFF, STOP, SPENTO ...
}

// ---------------------------------------------------------------------------
// Definizione dei grafici
// ---------------------------------------------------------------------------

export type AxisSide = "l" | "r";

export interface SeriesDef {
  id: string;
  /** chiave della scheda in PlantEntities (così valgono le entità scelte nella configurazione) */
  entityKey: string;
  label: string;
  unit: string;
  color: string;
  axis: AxisSide;
  decimals: number;
  /** acceso all'apertura del grafico */
  on?: boolean;
}

export interface GroupDef {
  id: string;
  title: string;
  /** se true, tutte le serie sono sulla scala 0-100 % (per confrontare le forme) */
  normalized?: boolean;
  series: SeriesDef[];
}

const S = {
  puffer: { id: "puffer", entityKey: "puffer_effective", label: "Puffer 50 L", unit: "°C", color: "#f97316", axis: "l", decimals: 1 },
  boilerTop: { id: "boilerTop", entityKey: "boiler_top", label: "Boiler alto (S3)", unit: "°C", color: "#ef4444", axis: "l", decimals: 1 },
  boilerBottom: { id: "boilerBottom", entityKey: "boiler_bottom", label: "Boiler basso (S2)", unit: "°C", color: "#3b82f6", axis: "l", decimals: 1 },
  stoveWater: { id: "stoveWater", entityKey: "stove_water", label: "Acqua caldaia", unit: "°C", color: "#a855f7", axis: "l", decimals: 1 },
  collector: { id: "collector", entityKey: "collector_temp", label: "Collettore solare", unit: "°C", color: "#eab308", axis: "l", decimals: 1 },
  smoke: { id: "smoke", entityKey: "smoke", label: "Fumi", unit: "°C", color: "#94a3b8", axis: "l", decimals: 0 },
  power: { id: "power", entityKey: "power", label: "Potenza caldaia", unit: "%", color: "#22c55e", axis: "r", decimals: 0 },
  integIn: { id: "integIn", entityKey: "coil_integ_in", label: "Serpentina integrazione, ingresso", unit: "°C", color: "#ec4899", axis: "l", decimals: 1 },
  integOut: { id: "integOut", entityKey: "coil_integ_out", label: "Serpentina integrazione, uscita", unit: "°C", color: "#0ea5e9", axis: "l", decimals: 1 },
  integW: { id: "integW", entityKey: "integration_power", label: "Pompa integrazione", unit: "W", color: "#22c55e", axis: "r", decimals: 0 },
  solarIn: { id: "solarIn", entityKey: "coil_solar_in", label: "Serpentina solare, ingresso", unit: "°C", color: "#f59e0b", axis: "l", decimals: 1 },
  solarOut: { id: "solarOut", entityKey: "coil_solar_out", label: "Serpentina solare, uscita", unit: "°C", color: "#06b6d4", axis: "l", decimals: 1 },
  solarKw: { id: "solarKw", entityKey: "solar_power", label: "Potenza solare", unit: "kW", color: "#22c55e", axis: "r", decimals: 2 },
  collectorW: { id: "collectorW", entityKey: "collector_power", label: "Alimentazione Elios (pompa collettore)", unit: "W", color: "#84cc16", axis: "r", decimals: 0 },
} satisfies Record<string, SeriesDef>;

const on = (s: SeriesDef): SeriesDef => ({ ...s, on: true });
const off = (s: SeriesDef): SeriesDef => ({ ...s, on: false });

export const CHART_GROUPS: GroupDef[] = [
  {
    id: "temperature",
    title: "Temperature",
    series: [on(S.puffer), on(S.boilerTop), on(S.boilerBottom), on(S.stoveWater), off(S.collector)],
  },
  {
    id: "caldaia",
    title: "Caldaia",
    series: [on(S.stoveWater), on(S.puffer), off(S.smoke), on(S.power)],
  },
  {
    id: "integrazione",
    title: "Pompa di integrazione",
    series: [on(S.puffer), on(S.boilerTop), off(S.integIn), off(S.integOut), on(S.integW)],
  },
  {
    id: "solare",
    title: "Solare",
    series: [on(S.collector), on(S.solarIn), on(S.solarOut), on(S.boilerBottom), off(S.solarKw)],
  },
];

/** Tutte le serie, per il confronto libero (scala 0-100 %). */
export function allSeries(): SeriesDef[] {
  return Object.values(S).map((s) => ({ ...s, on: ["puffer", "boilerTop", "stoveWater"].includes(s.id) }));
}

export interface RangeDef {
  id: string;
  label: string;
  hours: number;
}

export const RANGES: RangeDef[] = [
  { id: "6h", label: "6 h", hours: 6 },
  { id: "24h", label: "24 h", hours: 24 },
  { id: "3d", label: "3 gg", hours: 72 },
  { id: "7d", label: "7 gg", hours: 168 },
];

/** Valore di una serie come numero formattato con unità, "–" se manca. */
export function formatValue(v: number | null | undefined, def: Pick<SeriesDef, "decimals" | "unit">): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return "–";
  return `${v.toFixed(def.decimals).replace(".", ",")} ${def.unit}`;
}

/** Posizione (0..1) dentro la scala di una serie normalizzata sul proprio minimo-massimo. */
export function normalizeValue(v: number, st: Pick<Stats, "min" | "max">): number {
  if (st.max - st.min < 1e-9) return 0.5;
  return (v - st.min) / (st.max - st.min);
}
