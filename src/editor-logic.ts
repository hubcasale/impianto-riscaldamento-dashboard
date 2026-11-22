// Editor visuale della scheda dell'impianto: dalla configurazione ai valori del modulo e ritorno.
// Logica pura (nessuna dipendenza da Lit o da Home Assistant), si prova con node:test.
import { DEFAULT_ROOMS } from "./rooms-logic";
import { SECTION_KEYS, type SectionKey } from "./sections-logic";

/** La configurazione della scheda come la scrive Home Assistant (solo le chiavi che servono qui hanno un tipo). */
export type EditorConfig = { type: string } & Record<string, unknown>;

/** I valori del modulo: tutti presenti, con il comportamento normale dove la configurazione tace. */
export interface GeneralValues {
  title: string;
  layout: "classic" | "split";
  boiler: "full" | "short";
  show_boiler: boolean;
  show_caldaia: boolean;
  show_stufa: boolean;
  show_termostato: boolean;
  show_rooms: boolean;
  btn_settings: boolean;
  btn_summary: boolean;
  btn_charts: boolean;
  btn_schedule: boolean;
}

/** Una stanza in modifica: può essere incompleta (nome o sensori ancora da scegliere). */
export interface RoomDraft {
  id: string;
  name: string;
  short: string;
  temperature: string;
  humidity: string;
}

const SHOW_FIELD: Record<SectionKey, keyof GeneralValues> = {
  boiler: "show_boiler",
  caldaia: "show_caldaia",
  stufa: "show_stufa",
  termostato: "show_termostato",
};

function showList(config: EditorConfig): SectionKey[] | null {
  const raw = config.show;
  const list = Array.isArray(raw) ? raw.filter((k): k is SectionKey => SECTION_KEYS.includes(k as SectionKey)) : [];
  return list.length ? list : null;
}

export function generalValues(config: EditorConfig): GeneralValues {
  const show = showList(config);
  const inShow = (k: SectionKey) => !show || show.includes(k);
  return {
    title: typeof config.title === "string" ? config.title : "",
    layout: config.layout === "split" ? "split" : "classic",
    boiler: config.boiler === "short" ? "short" : "full",
    show_boiler: inShow("boiler"),
    show_caldaia: inShow("caldaia"),
    show_stufa: !!config.stufa && inShow("stufa"),
    show_termostato: config.thermostat !== false && inShow("termostato"),
    show_rooms: config.rooms !== false,
    btn_settings: config.settings !== false,
    btn_summary: config.summary !== false,
    btn_charts: config.charts !== false,
    btn_schedule: config.schedule !== false,
  };
}

/** Quante delle quattro sezioni resterebbero visibili (le stanze da sole non bastano: stanno accanto alle altre). */
export function visibleCount(v: GeneralValues): number {
  return [v.show_boiler, v.show_caldaia, v.show_stufa, v.show_termostato].filter(Boolean).length;
}

/**
 * Scrive i valori del modulo nella configurazione. Si scrive solo quello che è diverso dal comportamento normale,
 * così la configurazione resta corta; le chiavi che l'editor non gestisce restano come sono.
 * Se la modifica spegnerebbe tutte le sezioni, la configurazione non cambia (almeno una resta visibile).
 */
export function applyGeneral(config: EditorConfig, v: GeneralValues): EditorConfig {
  if (visibleCount(v) === 0) return config;
  const next: EditorConfig = { ...config };
  const title = v.title.trim();
  if (title) next.title = title;
  else delete next.title;
  if (v.layout === "split") next.layout = "split";
  else delete next.layout;
  if (v.boiler === "short") next.boiler = "short";
  else delete next.boiler;

  // stufa: accesa vuol dire configurata (resta l'oggetto con entry_id e titolo, se c'era) e nell'elenco show
  if (v.show_stufa && !next.stufa) next.stufa = true;
  // termostato: `thermostat: false` lo nascondeva; acceso dall'editor torna visibile
  if (v.show_termostato && next.thermostat === false) delete next.thermostat;
  const stufaAvailable = !!next.stufa;
  const on = SECTION_KEYS.filter((k) => v[SHOW_FIELD[k]] === true);
  const allOn = SECTION_KEYS.every((k) => (k === "stufa" && !stufaAvailable ? true : v[SHOW_FIELD[k]] === true));
  if (allOn) delete next.show;
  else next.show = on;

  if (!v.show_rooms) next.rooms = false;
  else if (next.rooms === false) delete next.rooms;

  const flag = (key: string, onValue: boolean) => {
    if (!onValue) next[key] = false;
    else if (next[key] === false) delete next[key];
  };
  flag("settings", v.btn_settings);
  flag("summary", v.btn_summary);
  flag("charts", v.btn_charts);
  flag("schedule", v.btn_schedule);
  return next;
}

// ---- stanze ---------------------------------------------------------------

function roomsObject(config: EditorConfig): Record<string, unknown> {
  const r = config.rooms;
  return r && typeof r === "object" ? (r as Record<string, unknown>) : {};
}

const str = (x: unknown) => (typeof x === "string" ? x : "");

/** Le stanze da mostrare nell'editor: quelle della configurazione (anche incomplete) oppure quelle di partenza. */
export function roomDrafts(config: EditorConfig): RoomDraft[] {
  const raw = roomsObject(config).rooms;
  if (!Array.isArray(raw)) return DEFAULT_ROOMS.map((r) => ({ id: r.id, name: r.name, short: r.short ?? "", temperature: r.temperature, humidity: r.humidity }));
  const out: RoomDraft[] = [];
  raw.forEach((r, i) => {
    if (!r || typeof r !== "object") return;
    const o = r as Record<string, unknown>;
    out.push({ id: str(o.id).trim() || `stanza${i + 1}`, name: str(o.name), short: str(o.short), temperature: str(o.temperature), humidity: str(o.humidity) });
  });
  return out;
}

/** true se la stanza comparirà nella scheda: serve il nome e almeno un sensore. */
export function roomComplete(r: RoomDraft): boolean {
  return !!r.name.trim() && (!!r.temperature.trim() || !!r.humidity.trim());
}

/** Scrive l'elenco delle stanze nella configurazione (titolo e termostato dell'obiettivo restano). */
export function setRooms(config: EditorConfig, rooms: RoomDraft[]): EditorConfig {
  const list = rooms.map((r) => ({
    id: r.id,
    name: r.name.trim(),
    ...(r.short.trim() ? { short: r.short.trim() } : {}),
    temperature: r.temperature.trim(),
    humidity: r.humidity.trim(),
  }));
  return { ...config, rooms: { ...roomsObject(config), rooms: list } };
}

/** Identificativo nuovo e stabile per una stanza aggiunta (serve alle serie dei grafici). */
export function newRoomId(rooms: RoomDraft[]): string {
  const used = new Set(rooms.map((r) => r.id));
  let n = rooms.length + 1;
  while (used.has(`stanza${n}`)) n += 1;
  return `stanza${n}`;
}

export function addRoom(rooms: RoomDraft[]): RoomDraft[] {
  return [...rooms, { id: newRoomId(rooms), name: "", short: "", temperature: "", humidity: "" }];
}

export function removeRoom(rooms: RoomDraft[], index: number): RoomDraft[] {
  return rooms.filter((_, i) => i !== index);
}

/** Sposta una stanza di un posto (delta -1 = su, +1 = giù); ai bordi non cambia nulla. */
export function moveRoom(rooms: RoomDraft[], index: number, delta: number): RoomDraft[] {
  const to = index + delta;
  if (index < 0 || index >= rooms.length || to < 0 || to >= rooms.length) return rooms;
  const next = [...rooms];
  [next[index], next[to]] = [next[to], next[index]];
  return next;
}

export function updateRoom(rooms: RoomDraft[], index: number, patch: Partial<Omit<RoomDraft, "id">>): RoomDraft[] {
  return rooms.map((r, i) => (i === index ? { ...r, ...patch } : r));
}

/** Titolo e termostato dell'obiettivo della scheda «Stanze». */
export function roomsOptions(config: EditorConfig): { title: string; target_entity: string } {
  const o = roomsObject(config);
  return { title: str(o.title), target_entity: str(o.target_entity) };
}

export function setRoomsOptions(config: EditorConfig, opt: { title: string; target_entity: string }): EditorConfig {
  const o: Record<string, unknown> = { ...roomsObject(config) };
  if (opt.title.trim()) o.title = opt.title.trim();
  else delete o.title;
  if (opt.target_entity.trim()) o.target_entity = opt.target_entity.trim();
  else delete o.target_entity;
  const next: EditorConfig = { ...config };
  if (Object.keys(o).length) next.rooms = o;
  else if (next.rooms !== false) delete next.rooms;
  return next;
}

// ---- stufa e termostato ----------------------------------------------------

export interface PartsValues {
  stufa_title: string;
  stufa_entry: string;
  thermo_title: string;
  thermo_entry: string;
}

function partObject(x: unknown): Record<string, unknown> {
  return x && typeof x === "object" ? (x as Record<string, unknown>) : {};
}

/** Titolo e voce dell'integrazione di stufa e termostato (servono solo se ne hai più di uno o vuoi un altro titolo). */
export function partsValues(config: EditorConfig): PartsValues {
  const st = partObject(config.stufa);
  const th = partObject(config.thermostat);
  return { stufa_title: str(st.title), stufa_entry: str(st.entry_id), thermo_title: str(th.title), thermo_entry: str(th.entry_id) };
}

function partValue(title: string, entry: string): Record<string, string> | null {
  const o: Record<string, string> = {};
  if (entry.trim()) o.entry_id = entry.trim();
  if (title.trim()) o.title = title.trim();
  return Object.keys(o).length ? o : null;
}

/** Scrive titolo e voce; una stufa o un termostato spenti (assente / false) restano spenti finché non si compila qualcosa. */
export function applyParts(config: EditorConfig, v: PartsValues): EditorConfig {
  const next: EditorConfig = { ...config };
  const st = partValue(v.stufa_title, v.stufa_entry);
  if (st) next.stufa = st;
  else if (next.stufa) next.stufa = true;
  const th = partValue(v.thermo_title, v.thermo_entry);
  if (th) next.thermostat = th;
  else if (next.thermostat !== false) delete next.thermostat;
  return next;
}
