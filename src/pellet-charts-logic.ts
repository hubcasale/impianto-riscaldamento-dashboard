// Logica pura dei grafici del pellet: caricamenti e letture del livello ricavati dallo storico, consumo per giorno,
// autonomia e taratura. Nessuna dipendenza da Lit o da Home Assistant, così si prova con node:test.
import type { Pt } from "./charts-logic";

export interface PelletRange {
  id: string;
  label: string;
  hours: number;
  /** i riquadri del consumo: un'ora ciascuno (24 h) oppure un giorno */
  bucket: "hour" | "day";
}

export const PELLET_RANGES: PelletRange[] = [
  { id: "24h", label: "24 ore", hours: 24, bucket: "hour" },
  { id: "3d", label: "3 giorni", hours: 72, bucket: "day" },
  { id: "7d", label: "7 giorni", hours: 168, bucket: "day" },
  { id: "14d", label: "14 giorni", hours: 336, bucket: "day" },
  { id: "30d", label: "30 giorni", hours: 720, bucket: "day" },
  { id: "90d", label: "90 giorni", hours: 2160, bucket: "day" },
];

const MIN = 60000;
const HOUR = 3600000;
const DAY = 86400000;

/** Inizio del periodo: ore tonde per il grafico a ore, mezzanotte locale per quelli a giorni (l'ultimo giorno è oggi). */
export function rangeStart(range: PelletRange, now: number): number {
  const d = new Date(now);
  if (range.bucket === "hour") {
    d.setMinutes(0, 0, 0);
    return d.getTime() - (range.hours - 1) * HOUR;
  }
  d.setHours(0, 0, 0, 0);
  const days = Math.round(range.hours / 24);
  const start = new Date(d);
  start.setDate(start.getDate() - (days - 1));
  return start.getTime();
}

/** Valore della serie al tempo t: l'ultimo punto fino a t, altrimenti il primo (la serie non esisteva ancora). */
export function valueAt(pts: Pt[], t: number): number | null {
  if (pts.length === 0) return null;
  let lo = 0;
  let hi = pts.length - 1;
  if (t < pts[0].t) return pts[0].v;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (pts[mid].t <= t) lo = mid;
    else hi = mid - 1;
  }
  return pts[lo].v;
}

export type PelletEventKind = "carico" | "misura";

export interface PelletEvent {
  t: number;
  kind: PelletEventKind;
  /** chili stimati subito prima, e chili subito dopo (quelli scritti nel riferimento) */
  before: number;
  after: number;
  /** differenza non spiegata dal consumo: + chili aggiunti, − meno pellet di quanto stimato */
  delta: number;
  /** sacchi versati (solo per i caricamenti, passo di mezzo sacco) */
  bags: number | null;
  /** consumo stimato dall'evento precedente e consumo reale (solo letture del livello con un evento precedente) */
  used: number | null;
  real: number | null;
  /** consumo reale / stimato */
  ratio: number | null;
}

/** Un salto è un caricamento se è quasi un multiplo di mezzo sacco, o se riempie il serbatoio. */
export function classifyDelta(delta: number, after: number, bagKg: number, capacityKg = 120): { kind: PelletEventKind; bags: number | null } {
  if (delta > 0 && bagKg > 0) {
    const bags = Math.round((delta / bagKg) * 2) / 2;
    if (bags >= 0.5 && Math.abs(delta - bags * bagKg) <= 0.8) return { kind: "carico", bags };
    if (after >= capacityKg - 0.5 && delta >= 1) return { kind: "carico", bags: Math.round((delta / bagKg) * 2) / 2 || 0.5 };
  }
  return { kind: "misura", bags: null };
}

const SMALL = 0.12; // un passo al minuto sopra questo valore fa parte di un salto
const BIG = 0.35; // un salto più piccolo di questo è rumore di arrotondamento

/**
 * Cerca nello storico i momenti in cui il conteggio è stato riscritto (caricamento o lettura del livello).
 * Tra un evento e l'altro i chili rimasti calano esattamente quanto cresce il totale stimato: quello che non quadra è un evento.
 * Il campionamento è al minuto; la riscrittura dei due riferimenti (chili e totale) può cadere in due minuti vicini e si somma.
 */
export function detectEvents(rem: Pt[], tot: Pt[], t0: number, t1: number, bagKg: number): PelletEvent[] {
  if (rem.length === 0 || tot.length === 0 || t1 <= t0) return [];
  const n = Math.floor((t1 - t0) / MIN) + 1;
  const r: (number | null)[] = new Array(n).fill(null);
  const c: (number | null)[] = new Array(n).fill(null);
  let ri = 0;
  let ci = 0;
  let rv: number | null = null;
  let cv: number | null = null;
  for (let i = 0; i < n; i++) {
    const t = t0 + i * MIN;
    while (ri < rem.length && rem[ri].t <= t) rv = rem[ri++].v;
    while (ci < tot.length && tot[ci].t <= t) cv = tot[ci++].v;
    r[i] = rv;
    c[i] = cv;
  }
  const d: number[] = new Array(n).fill(0);
  for (let i = 1; i < n; i++) {
    if (r[i] !== null && r[i - 1] !== null && c[i] !== null && c[i - 1] !== null) d[i] = (r[i] as number) - (r[i - 1] as number) + ((c[i] as number) - (c[i - 1] as number));
  }
  const events: PelletEvent[] = [];
  let prev: { t: number; after: number; tot: number } | null = null;
  let i = 1;
  while (i < n) {
    if (Math.abs(d[i]) <= SMALL) {
      i++;
      continue;
    }
    let j = i;
    let sum = 0;
    let at = i;
    while (j < n && Math.abs(d[j]) > SMALL) {
      sum += d[j];
      if (Math.abs(d[j]) > Math.abs(d[at])) at = j;
      j++;
    }
    if (Math.abs(sum) > BIG) {
      const before = r[i - 1] as number;
      const after = r[j - 1] as number;
      const t = t0 + at * MIN;
      const cls = classifyDelta(sum, after, bagKg);
      const totNow = c[at] as number;
      let used: number | null = null;
      let real: number | null = null;
      let ratio: number | null = null;
      if (cls.kind === "misura" && prev) {
        used = totNow - prev.tot;
        real = prev.after - after;
        ratio = used >= 2 && real > 0 ? real / used : null;
      }
      events.push({ t, kind: cls.kind, before, after, delta: sum, bags: cls.bags, used, real, ratio });
      prev = { t, after, tot: totNow };
    }
    i = j;
  }
  return events;
}

export interface Bucket {
  t0: number;
  t1: number;
  kg: number;
  /** il riquadro non è finito (ora o giorno corrente) */
  partial: boolean;
}

/** Consumo stimato per ora o per giorno dal totale cumulativo (le discese del contatore non contano). */
export function consumptionBuckets(tot: Pt[], t0: number, t1: number, bucket: "hour" | "day"): Bucket[] {
  const out: Bucket[] = [];
  if (tot.length === 0) return out;
  let b0 = t0;
  while (b0 < t1) {
    let b1: number;
    if (bucket === "hour") b1 = b0 + HOUR;
    else {
      const d = new Date(b0);
      d.setDate(d.getDate() + 1);
      d.setHours(0, 0, 0, 0);
      b1 = d.getTime();
    }
    const end = Math.min(b1, t1);
    const a = valueAt(tot, b0);
    const b = valueAt(tot, end);
    out.push({ t0: b0, t1: b1, kg: a === null || b === null ? 0 : Math.max(0, b - a), partial: b1 > t1 });
    b0 = b1;
  }
  return out;
}

export interface PelletSummary {
  consumed: number;
  perDay: number | null;
  loaded: number;
  bags: number;
  /** giorni coperti dai dati del periodo */
  days: number;
}

export function summarizePeriod(tot: Pt[], events: PelletEvent[], t0: number, t1: number): PelletSummary {
  const first = tot.length ? Math.max(t0, tot[0].t) : t1;
  const days = Math.max(0, (t1 - first) / DAY);
  const a = valueAt(tot, first);
  const b = valueAt(tot, t1);
  const consumed = a === null || b === null ? 0 : Math.max(0, b - a);
  const loadedEv = events.filter((e) => e.kind === "carico");
  return {
    consumed,
    perDay: days >= 0.5 ? consumed / days : null,
    loaded: loadedEv.reduce((s, e) => s + e.delta, 0),
    bags: loadedEv.reduce((s, e) => s + (e.bags ?? 0), 0),
    days,
  };
}

/** Quanti giorni bastano i chili rimasti a quel consumo, e quando finiscono. */
export function runOut(remKg: number | null, perDay: number | null, now: number): { days: number; date: number } | null {
  if (remKg === null || perDay === null || perDay <= 0.05) return null;
  const days = remKg / perDay;
  return { days, date: now + days * DAY };
}

export interface Calibration {
  /** consumo reale / stimato di tutte le letture del livello utili, pesato sui chili */
  ratio: number;
  usedKg: number;
  readings: number;
  /** fattore di taratura suggerito (quello attuale × rapporto) */
  suggested: number | null;
}

export function calibration(events: PelletEvent[], currentFactor: number | null): Calibration | null {
  const ok = events.filter((e) => e.kind === "misura" && e.ratio !== null && e.used !== null && e.real !== null);
  if (ok.length === 0) return null;
  const used = ok.reduce((s, e) => s + (e.used as number), 0);
  const real = ok.reduce((s, e) => s + (e.real as number), 0);
  if (used <= 0) return null;
  const ratio = real / used;
  return { ratio, usedKg: used, readings: ok.length, suggested: currentFactor !== null && currentFactor > 0 ? Math.round(currentFactor * ratio * 100) / 100 : null };
}

/** Punti dalle statistiche a lungo termine (`recorder/statistics_during_period`): `field` è mean per i sensori istantanei, state per i contatori. */
export function statsToPoints(rows: { start?: number | string; end?: number | string; mean?: number | null; state?: number | null }[] | undefined, field: "mean" | "state"): Pt[] {
  const out: Pt[] = [];
  const ms = (v: number | string | undefined): number | null => {
    if (v === undefined) return null;
    if (typeof v === "number") return v < 1e11 ? v * 1000 : v;
    const x = Date.parse(v);
    return Number.isNaN(x) ? null : x;
  };
  for (const r of rows ?? []) {
    const v = r[field];
    const s = ms(r.start);
    const e = ms(r.end);
    if (typeof v === "number" && Number.isFinite(v) && s !== null) out.push({ t: field === "state" && e !== null ? e - 1 : s + 30 * MIN, v });
  }
  return out.sort((a, b) => a.t - b.t);
}

/** Unisce i punti delle statistiche (prima) e dello storico (poi): dove c'è lo storico vale lui. */
export function mergeSeries(stats: Pt[], history: Pt[]): Pt[] {
  if (history.length === 0) return stats;
  const from = history[0].t;
  return stats.filter((p) => p.t < from).concat(history);
}
