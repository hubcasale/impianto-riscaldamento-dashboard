// Calcoli per la scheda dell'impianto. Nessuna dipendenza da Home Assistant né dal DOM.

export interface BoilerModel {
  /** litri del serbatoio */
  volume: number;
  /** quota di volume rappresentata dalla sonda alta (0..1) */
  topShare: number;
  /** temperatura dell'acqua di rete, °C */
  mainsTemp: number;
  /** litri per doccia */
  showerVolume: number;
  /** temperatura della doccia, °C */
  showerTemp: number;
}

export const DEFAULT_MODEL: BoilerModel = {
  volume: 190,
  topShare: 0.5,
  mainsTemp: 15,
  showerVolume: 40,
  showerTemp: 38,
};

/**
 * Stima delle docce disponibili.
 * Il serbatoio è diviso in due zone: la parte alta (quota `topShare`) alla temperatura della sonda alta,
 * il resto a quella della sonda bassa. Ogni zona sopra la temperatura della doccia fornisce
 * litri_a_temperatura_doccia = volume_zona * (T - T_rete) / (T_doccia - T_rete).
 * Le zone più fredde della doccia non contano.
 */
export function showersEstimate(top: number | null, bottom: number | null, m: BoilerModel): number | null {
  if (top === null) return null;
  const span = m.showerTemp - m.mainsTemp;
  if (span <= 0 || m.showerVolume <= 0) return null;
  const zones: [number, number | null][] = [
    [m.volume * m.topShare, top],
    [m.volume * (1 - m.topShare), bottom ?? top],
  ];
  let liters = 0;
  for (const [v, t] of zones) {
    if (t !== null && t >= m.showerTemp) liters += (v * (t - m.mainsTemp)) / span;
  }
  return Math.floor(liters / m.showerVolume);
}

/** Aspetto della stufa in base allo stato letto dalla Polygon. */
export type StoveLook = "off" | "wait" | "start" | "work" | "standby" | "stopping";

export function stoveLook(state: string | undefined): StoveLook {
  const s = (state ?? "").trim().toUpperCase();
  if (["WORK", "LAVORO", "WORKING"].includes(s)) return "work";
  if (["START", "AVVIO", "ACCENSIONE", "IGNITION"].includes(s)) return "start";
  if (["WAIT", "ATTESA", "PRE-START"].includes(s)) return "wait";
  if (["STAND BY", "STANDBY", "STAND-BY"].includes(s)) return "standby";
  if (["STOP", "SPEGNIMENTO", "CLEANING", "PULIZIA"].includes(s)) return "stopping";
  return "off";
}

const COLOR_STOPS: [number, [number, number, number]][] = [
  [15, [59, 130, 246]], // blu
  [30, [147, 197, 253]], // azzurro chiaro
  [42, [252, 211, 77]], // giallo
  [55, [249, 115, 22]], // arancione
  [65, [239, 68, 68]], // rosso
];

/** Colore da blu (freddo) a rosso (caldo) per una temperatura dell'acqua, senza passare dal verde. */
export function tempColor(t: number | null): string {
  if (t === null || Number.isNaN(t)) return "#94a3b8";
  const first = COLOR_STOPS[0];
  const last = COLOR_STOPS[COLOR_STOPS.length - 1];
  let rgb = t <= first[0] ? first[1] : last[1];
  if (t > first[0] && t < last[0]) {
    for (let i = 1; i < COLOR_STOPS.length; i++) {
      const [t1, c1] = COLOR_STOPS[i];
      if (t <= t1) {
        const [t0, c0] = COLOR_STOPS[i - 1];
        const k = (t - t0) / (t1 - t0);
        rgb = [0, 1, 2].map((j) => Math.round(c0[j] + (c1[j] - c0[j]) * k)) as [number, number, number];
        break;
      }
    }
  }
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

/** Numero con virgola decimale all'italiana. */
export function fmt(n: number | null | undefined, decimals = 0): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "–";
  return n.toLocaleString("it-IT", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/** Numero da uno stato testuale di entità; null se non numerico. */
export function toNumber(state: string | undefined | null): number | null {
  if (state === undefined || state === null || state === "" || state === "unknown" || state === "unavailable") return null;
  const n = Number(state);
  return Number.isFinite(n) ? n : null;
}
