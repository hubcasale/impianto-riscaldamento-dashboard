// Scheda «Stanze»: temperatura e umidità delle stanze, con i colori e la sintesi.
// Logica pura (nessuna dipendenza da Lit o da Home Assistant), si prova con node:test.

export interface RoomDef {
  /** identificativo breve, senza spazi (serve alle chiavi delle serie dei grafici) */
  id: string;
  name: string;
  /** nome corto per la colonna, se quello intero non ci sta */
  short?: string;
  temperature: string;
  humidity: string;
}

/** Le stanze con i sensori MQTT di partenza. Il bagno verde non ha ancora il sensore (l'umidostato Sonoff va cambiato). */
export const DEFAULT_ROOMS: RoomDef[] = [
  { id: "soggiorno", name: "Soggiorno", temperature: "sensor.sensore_soggiorno_temperature", humidity: "sensor.sensore_soggiorno_humidity" },
  { id: "cucina", name: "Cucina", temperature: "sensor.sensore_cucina_temperature", humidity: "sensor.sensore_cucina_humidity" },
  {
    id: "matrimoniale",
    name: "Camera matrimoniale",
    short: "Matrimon.",
    temperature: "sensor.sensore_camera_matrimoniale_temperature",
    humidity: "sensor.sensore_camera_matrimoniale_humidity",
  },
  { id: "matilde", name: "Camera Matilde", short: "Matilde", temperature: "sensor.sensore_camera_matilde_temperature", humidity: "sensor.sensore_camera_matilde_humidity" },
  { id: "camilla", name: "Camera Camilla", short: "Camilla", temperature: "sensor.sensore_camera_camilla_temperature", humidity: "sensor.sensore_camera_camilla_humidity" },
  { id: "bagno_blu", name: "Bagno Blu", temperature: "sensor.sensore_bagno_blu_temperature", humidity: "sensor.sensore_bagno_blu_humidity" },
  { id: "bagno_verde", name: "Bagno Verde", temperature: "sensor.sensore_bagno_verde_temperature", humidity: "sensor.sensore_bagno_verde_humidity" },
];

/** Soglie di temperatura per il colore: da 22 °C in su «caldo», sotto 19 °C «freddo», in mezzo «bene». */
export const TEMP_WARM = 22;
export const TEMP_COOL = 19;
/** Soglie di umidità: da 60 % «alta», da 70 % «troppa», sotto 40 % «secca». */
export const HUM_HIGH = 60;
export const HUM_TOO_HIGH = 70;
export const HUM_DRY = 40;

/** Scala delle colonne (°C): la colonna più bassa e la più alta. */
export const BAR_MIN = 16;
export const BAR_MAX = 24;

export type TempClass = "warm" | "ok" | "cool";
export type HumClass = "bad" | "amber" | "ok" | "dry";

export const TEMP_COLOR: Record<TempClass, string> = { warm: "#fb923c", ok: "#4ade80", cool: "#60a5fa" };

/** Numero da uno stato di Home Assistant; `null` se manca o non è un numero. */
export function toNum(state: string | null | undefined): number | null {
  if (state === null || state === undefined || state === "" || state === "unknown" || state === "unavailable") return null;
  const n = Number(String(state).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export function tempClass(t: number): TempClass {
  return t >= TEMP_WARM ? "warm" : t < TEMP_COOL ? "cool" : "ok";
}

export function humClass(h: number): HumClass {
  if (h >= HUM_TOO_HIGH) return "bad";
  if (h >= HUM_HIGH) return "amber";
  if (h < HUM_DRY) return "dry";
  return "ok";
}

/** Altezza della colonna (0..1) per una temperatura, tra BAR_MIN e BAR_MAX. */
export function barFraction(t: number, min = BAR_MIN, max = BAR_MAX): number {
  if (max <= min) return 0;
  return Math.max(0, Math.min(1, (t - min) / (max - min)));
}

export interface RoomValue {
  room: RoomDef;
  t: number | null;
  h: number | null;
}

/** Valori correnti di ogni stanza, dai sensori. */
export function roomValues(rooms: RoomDef[], stateOf: (entityId: string) => string | null | undefined): RoomValue[] {
  return rooms.map((room) => ({ room, t: toNum(stateOf(room.temperature)), h: toNum(stateOf(room.humidity)) }));
}

/** La stanza è «presente» se almeno uno dei suoi sensori esiste in Home Assistant (anche non disponibile). */
export function roomExists(room: RoomDef, exists: (entityId: string) => boolean): boolean {
  return exists(room.temperature) || exists(room.humidity);
}

export interface Summary {
  warmest: RoomValue | null;
  coolest: RoomValue | null;
  /** stanze con umidità da `HUM_TOO_HIGH` in su, la più alta per prima */
  humid: RoomValue[];
  avgT: number | null;
  avgH: number | null;
}

export function summarize(values: RoomValue[]): Summary {
  const withT = values.filter((v): v is RoomValue & { t: number } => v.t !== null);
  const withH = values.filter((v): v is RoomValue & { h: number } => v.h !== null);
  const warmest = withT.length ? withT.reduce((a, b) => (b.t > a.t ? b : a)) : null;
  const coolest = withT.length ? withT.reduce((a, b) => (b.t < a.t ? b : a)) : null;
  const humid = withH.filter((v) => v.h >= HUM_TOO_HIGH).sort((a, b) => b.h - a.h);
  const avg = (xs: number[]) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : null);
  return { warmest, coolest, humid, avgT: avg(withT.map((v) => v.t)), avgH: avg(withH.map((v) => v.h)) };
}

/** 22,3 → «22,3»; `null` → «–». */
export function fmtNum(n: number | null, decimals = 1): string {
  return n === null ? "–" : n.toFixed(decimals).replace(".", ",");
}

/** Nome da mostrare sotto la colonna. */
export function shortName(room: RoomDef): string {
  return room.short ?? room.name;
}

/** Definizioni valide dalla configurazione YAML; una lista vuota o non valida lascia le stanze di partenza. */
export function normalizeRooms(raw: unknown): RoomDef[] {
  if (!Array.isArray(raw)) return DEFAULT_ROOMS;
  const out: RoomDef[] = [];
  raw.forEach((r, i) => {
    if (!r || typeof r !== "object") return;
    const o = r as Record<string, unknown>;
    const name = typeof o.name === "string" ? o.name.trim() : "";
    const temperature = typeof o.temperature === "string" ? o.temperature.trim() : "";
    const humidity = typeof o.humidity === "string" ? o.humidity.trim() : "";
    if (!name || (!temperature && !humidity)) return;
    const id = typeof o.id === "string" && o.id.trim() ? o.id.trim() : `stanza${i + 1}`;
    out.push({ id, name, ...(typeof o.short === "string" && o.short.trim() ? { short: o.short.trim() } : {}), temperature, humidity });
  });
  return out.length ? out : DEFAULT_ROOMS;
}
