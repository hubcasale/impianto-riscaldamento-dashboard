// Serbatoio del pellet del Polygon: forma, quantita' rimasta e conti per il disegno.
// Nessuna dipendenza da Lit o da Home Assistant, cosi' si prova con node:test.
//
// Misure del serbatoio (23/10/2026), in cm, dalla sommita':
//   - scatola alta: 28 di altezza x 54 di larghezza x 56,5 di profondita';
//   - trapezio: 50 di altezza, larghezza da 54 a 19 (il lato sinistro e' verticale, quello destro obliquo), profondita' 56,5;
//   - tronco di piramide: 16 di altezza, base 19 x 56,5, punta 7 x 12.
// Densita' del pellet ricavata da due sacchi da 15 kg versati: 0,655 kg/litro (2,0 kg per cm nella scatola alta).
// La capienza vera e' di 8 sacchi (120 kg): la geometria dice 128,6 kg, il resto (8,6 kg) e' occupato dalla coclea e da altro
// e si suppone in fondo al serbatoio.

export const HOPPER = {
  depthCm: 56.5,
  topH: 28,
  topW: 54,
  midH: 50,
  midBottomW: 19,
  lowH: 16,
  lowBottomW: 7,
  lowBottomD: 12,
  rho: 0.655,
  capacityKg: 120,
  bagKg: 15,
};

/** Altezza totale del disegno (cm). */
export const HOPPER_HEIGHT = HOPPER.topH + HOPPER.midH + HOPPER.lowH;

const TOP_CM2 = HOPPER.topW * HOPPER.depthCm;

function lowArea(t: number): number {
  const f = t / HOPPER.lowH;
  const w = HOPPER.midBottomW + (HOPPER.lowBottomW - HOPPER.midBottomW) * f;
  const d = HOPPER.depthCm + (HOPPER.lowBottomD - HOPPER.depthCm) * f;
  return w * d;
}

const LOW_TOTAL_CM3 = (() => {
  const n = 400;
  let s = 0;
  for (let i = 0; i < n; i++) s += lowArea(((i + 0.5) / n) * HOPPER.lowH) * (HOPPER.lowH / n);
  return s;
})();
const MID_TOTAL_CM3 = ((HOPPER.topW + HOPPER.midBottomW) / 2) * HOPPER.depthCm * HOPPER.midH;
const TOP_TOTAL_CM3 = TOP_CM2 * HOPPER.topH;

/** Volume (cm3) del serbatoio sotto la profondita' indicata, come lo da' la geometria. */
function volumeBelow(depth: number): number {
  const d = Math.max(0, depth);
  if (d <= HOPPER.topH) return MID_TOTAL_CM3 + LOW_TOTAL_CM3 + TOP_CM2 * (HOPPER.topH - d);
  const y = d - HOPPER.topH;
  if (y <= HOPPER.midH) {
    const dw = HOPPER.topW - HOPPER.midBottomW;
    // larghezza w(u) = topW - dw/midH * u, integrata da y a midH
    const k = dw / HOPPER.midH;
    return HOPPER.depthCm * (HOPPER.topW * (HOPPER.midH - y) - (k / 2) * (HOPPER.midH * HOPPER.midH - y * y)) + LOW_TOTAL_CM3;
  }
  const z = y - HOPPER.midH;
  if (z >= HOPPER.lowH) return 0;
  const n = 300;
  let s = 0;
  for (let i = 0; i < n; i++) s += lowArea(z + ((i + 0.5) / n) * (HOPPER.lowH - z)) * ((HOPPER.lowH - z) / n);
  return s;
}

/** Volume morto (coclea e altro) in kg: capienza geometrica meno 8 sacchi. */
export const DEAD_KG = ((TOP_TOTAL_CM3 + MID_TOTAL_CM3 + LOW_TOTAL_CM3) / 1000) * HOPPER.rho - HOPPER.capacityKg;

/** Chili di pellet rimasti con la superficie alla profondita' indicata (cm dalla sommita'). */
export function kgAtDepth(depthCm: number): number {
  return Math.min(HOPPER.capacityKg, Math.max(0, (volumeBelow(depthCm) / 1000) * HOPPER.rho - DEAD_KG));
}

/** Profondita' (cm dalla sommita') alla quale la superficie del pellet sta con i chili indicati. */
export function depthAtKg(kg: number): number {
  const k = Math.min(HOPPER.capacityKg, Math.max(0, kg));
  let lo = 0;
  let hi = HOPPER_HEIGHT;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (kgAtDepth(mid) > k) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * Pellet rimasto adesso: i chili del riferimento meno quelli consumati da allora secondo il totale stimato della scheda.
 * Il riferimento si aggiorna ogni volta che si versano dei sacchi o si misura il livello.
 */
export function remainingKg(refKg: number | null, total: number | null, totalRef: number | null): number | null {
  // totale di riferimento 0 = il conteggio non e' ancora stato impostato
  if (refKg === null || total === null || totalRef === null || totalRef <= 0) return null;
  const used = Math.max(0, total - totalRef);
  return Math.min(HOPPER.capacityKg, Math.max(0, refKg - used));
}

/** Giorni di autonomia al consumo medio indicato (kg al giorno). */
export function daysLeft(kg: number | null, kgPerDay: number | null): number | null {
  if (kg === null || kgPerDay === null || kgPerDay <= 0) return null;
  return kg / kgPerDay;
}

/** Nuovo riferimento dopo aver versato dei sacchi: quello che c'e' adesso piu' i sacchi (non oltre la capienza). */
export function afterBags(currentKg: number, bags: number, bagKg = HOPPER.bagKg): number {
  return Math.min(HOPPER.capacityKg, Math.max(0, currentKg + bags * bagKg));
}

/** Contorno del serbatoio nel disegno (cm, origine in alto a sinistra): il lato sinistro e' verticale, quello destro obliquo. */
export function hopperOutline(): Array<[number, number]> {
  return [
    [0, 0],
    [HOPPER.topW, 0],
    [HOPPER.topW, HOPPER.topH],
    [HOPPER.midBottomW, HOPPER.topH + HOPPER.midH],
    [HOPPER.lowBottomW, HOPPER_HEIGHT],
    [0, HOPPER_HEIGHT],
  ];
}

/** Colore del livello: rosso sotto i 20 kg, arancio sotto i 40, altrimenti il colore del pellet. */
export function levelColor(kg: number | null): string {
  if (kg === null) return "#64748b";
  if (kg < 20) return "#ef4444";
  if (kg < 40) return "#f59e0b";
  return "#b7791f";
}

/** Riempimento in percentuale della capienza (0-100). */
export function fillPercent(kg: number | null): number {
  return kg === null ? 0 : Math.round((kg / HOPPER.capacityKg) * 100);
}

/**
 * Consumo medio al giorno per l'autonomia, dai contatori della settimana e del mese (si azzerano il lunedi' e il primo del mese).
 * Si divide per i giorni trascorsi da quando il contatore e' ripartito, non per 7 o 30: a meta' settimana dividere per 7
 * dimezzava il consumo e prometteva il doppio dei giorni. Con troppo poco tempo trascorso si prova l'altro contatore, poi 6 kg/giorno.
 */
export function consumptionPerDay(week: number | null, month: number | null, now: Date, fallback = 6): number {
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const frac = (now.getTime() - dayStart.getTime()) / 86400000;
  const weekDays = ((now.getDay() + 6) % 7) + frac; // la settimana parte dal lunedi'
  const monthDays = now.getDate() - 1 + frac;
  if (week !== null && weekDays >= 2 && week / weekDays >= 0.5) return week / weekDays;
  if (month !== null && monthDays >= 3 && month / monthDays >= 0.5) return month / monthDays;
  return fallback;
}
