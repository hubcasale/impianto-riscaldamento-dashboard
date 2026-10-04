// Logica della programmazione settimanale (4 programmi, giorni, orari, set di temperatura).
// Nessuna dipendenza da Home Assistant né dal DOM, così si può provare con i test.
//
// Convenzioni della Polygon (integrazione aguaiot_hubcasale):
//  - gli orari sono a passi di 10 minuti;
//  - spegnimento 00:00 significa "fino a mezzanotte";
//  - se lo spegnimento è prima dell'accensione (e non è 00:00) il programma scavalca la mezzanotte.

export const STEP_MIN = 10;
export const DAY_SLUGS = ["lunedi", "martedi", "mercoledi", "giovedi", "venerdi", "sabato", "domenica"] as const;
export const DAY_SHORT = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"] as const;
export const DAY_LONG = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"] as const;
export const PROGRAMS = [1, 2, 3, 4] as const;

const DAY_ALIASES: Record<string, number> = {};
[
  ["lun", "mon", "lunedi", "monday"],
  ["mar", "tue", "martedi", "tuesday"],
  ["mer", "wed", "mercoledi", "wednesday"],
  ["gio", "thu", "giovedi", "thursday"],
  ["ven", "fri", "venerdi", "friday"],
  ["sab", "sat", "sabato", "saturday"],
  ["dom", "sun", "domenica", "sunday"],
].forEach((names, i) => names.forEach((n) => (DAY_ALIASES[n] = i)));

/** Indice del giorno (0 = lunedì) da un nome corto/lungo, italiano o inglese; null se non riconosciuto. */
export function dayIndex(name: string | number): number | null {
  if (typeof name === "number") return name >= 0 && name <= 6 ? name : null;
  const k = name.trim().toLowerCase().replace("ì", "i");
  return k in DAY_ALIASES ? DAY_ALIASES[k] : null;
}

/** "05:30:00" / "05:30" -> minuti dalla mezzanotte; null se non impostato. */
export function parseTimeState(state: string | undefined | null): number | null {
  if (!state) return null;
  const m = /^(\d{1,2}):(\d{2})/.exec(state);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 24 || min > 59) return null;
  return h * 60 + min;
}

/** Minuti -> "HH:MM" ("--:--" se nullo). 1440 si scrive 00:00. */
export function formatHM(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined || Number.isNaN(minutes)) return "--:--";
  const m = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

/** "HH:MM" -> minuti arrotondati al passo di 10 minuti (24:00 vale 1440). */
export function hmToMinutes(hm: string): number | null {
  const m = parseTimeState(hm);
  if (m === null) return null;
  return Math.min(1440, Math.round(m / STEP_MIN) * STEP_MIN);
}

/** Valore da passare al servizio time.set_value. */
export function toTimeValue(minutes: number): string {
  return `${formatHM(minutes)}:00`;
}

export interface ProgramState {
  n: number;
  on: number | null;
  off: number | null;
  /** giorni attivi, 0 = lunedì */
  days: boolean[];
  setBoiler: number | null;
  setWater: number | null;
}

export interface ProgramEntityIds {
  on: string;
  off: string;
  setBoiler: string;
  setWater: string;
  day: string[];
}

export function programEntityIds(prefix: string, n: number): ProgramEntityIds {
  return {
    on: `time.${prefix}_crono_p${n}_accensione`,
    off: `time.${prefix}_crono_p${n}_spegnimento`,
    setBoiler: `number.${prefix}_crono_p${n}_setpoint_boiler`,
    setWater: `number.${prefix}_crono_p${n}_setpoint_acqua`,
    day: DAY_SLUGS.map((d) => `switch.${prefix}_crono_p${n}_${d}`),
  };
}

export interface Segment {
  start: number;
  end: number;
}

/** Il programma è utilizzabile (ha accensione e spegnimento diversi)? */
function hasWindow(p: ProgramState): boolean {
  return p.on !== null && p.off !== null && p.on !== p.off;
}

/** Fasce occupate dal programma nel giorno `d`, compreso lo scavallamento dal giorno prima. */
export function segmentsOnDay(p: ProgramState, d: number): Segment[] {
  const out: Segment[] = [];
  if (!hasWindow(p)) return out;
  const on = p.on as number;
  const off = p.off as number;
  if (p.days[d]) {
    if (off === 0 || off > on) out.push({ start: on, end: off === 0 ? 1440 : off });
    else out.push({ start: on, end: 1440 });
  }
  const prev = (d + 6) % 7;
  if (p.days[prev] && off > 0 && off < on) out.push({ start: 0, end: off });
  return out;
}

export interface Overlap {
  day: number;
  a: number;
  b: number;
  start: number;
  end: number;
}

/** Sovrapposizioni tra programmi attivi nello stesso giorno (fasce che si toccano soltanto non contano). */
export function findOverlaps(programs: ProgramState[]): Overlap[] {
  const found: Overlap[] = [];
  for (let d = 0; d < 7; d++) {
    for (let i = 0; i < programs.length; i++) {
      for (let j = i + 1; j < programs.length; j++) {
        for (const sa of segmentsOnDay(programs[i], d)) {
          for (const sb of segmentsOnDay(programs[j], d)) {
            const start = Math.max(sa.start, sb.start);
            const end = Math.min(sa.end, sb.end);
            if (start < end) found.push({ day: d, a: programs[i].n, b: programs[j].n, start, end });
          }
        }
      }
    }
  }
  return found;
}

/** Sovrapposizioni raggruppate per coppia di programmi, in forma leggibile. */
export function describeOverlaps(overlaps: Overlap[]): string[] {
  const byPair = new Map<string, Overlap[]>();
  for (const o of overlaps) {
    const key = `${o.a}-${o.b}`;
    byPair.set(key, [...(byPair.get(key) ?? []), o]);
  }
  const lines: string[] = [];
  for (const [key, list] of byPair) {
    const [a, b] = key.split("-");
    const days = [...new Set(list.map((o) => DAY_SHORT[o.day]))].join(", ");
    const first = list[0];
    lines.push(`P${a} e P${b} si sovrappongono (${days}) dalle ${formatHM(first.start)} alle ${formatHM(first.end)}`);
  }
  return lines;
}

// ---------------------------------------------------------------------------
// Preset
// ---------------------------------------------------------------------------

export interface PresetProgram {
  on?: string;
  off?: string;
  /** giorni attivi (nomi corti o lunghi, italiano o inglese); lista vuota = programma disattivato */
  days?: string[];
  set_boiler?: number;
  set_water?: number;
}

export interface Preset {
  name: string;
  icon?: string;
  description?: string;
  /** true/false = attiva o disattiva il cronotermostato generale; assente = non toccarlo */
  crono?: boolean;
  /** programmi da impostare; quelli non elencati restano com'erano; null = disattivato */
  programs?: Record<string, PresetProgram | null>;
}

export const DEFAULT_PRESETS: Preset[] = [
  {
    name: "Settimana tipo",
    icon: "mdi:calendar-week",
    description: "Feriale mattina e sera, weekend tutto il giorno",
    crono: true,
    programs: {
      "1": { on: "05:30", off: "08:00", days: ["lun", "mar", "mer", "gio", "ven"] },
      "2": { on: "17:00", off: "22:30", days: ["lun", "mar", "mer", "gio", "ven"] },
      "3": { on: "07:30", off: "23:00", days: ["sab", "dom"] },
      "4": null,
    },
  },
  {
    name: "Feriale",
    icon: "mdi:briefcase-outline",
    description: "Mattina e sera, tutti i giorni",
    crono: true,
    programs: {
      "1": { on: "05:30", off: "08:00", days: ["lun", "mar", "mer", "gio", "ven", "sab", "dom"] },
      "2": { on: "17:00", off: "22:30", days: ["lun", "mar", "mer", "gio", "ven", "sab", "dom"] },
      "3": null,
      "4": null,
    },
  },
  {
    name: "Weekend",
    icon: "mdi:home-heart",
    description: "Sempre acceso dalle 7 alle 23, tutti i giorni",
    crono: true,
    programs: {
      "1": { on: "07:00", off: "23:00", days: ["lun", "mar", "mer", "gio", "ven", "sab", "dom"] },
      "2": null,
      "3": null,
      "4": null,
    },
  },
  {
    name: "Vacanza",
    icon: "mdi:palm-tree",
    description: "Cronotermostato disattivato, i programmi restano salvati",
    crono: false,
  },
];

export interface ServiceAction {
  domain: string;
  service: string;
  entity_id: string;
  data: Record<string, unknown>;
  label: string;
}

export interface PlanInput {
  prefix: string;
  master: string;
  programs: ProgramState[];
  cronoOn: boolean | null;
}

/** Operazioni necessarie per portare la caldaia nello stato del preset: solo ciò che è diverso. */
export function planPreset(input: PlanInput, preset: Preset): ServiceAction[] {
  const actions: ServiceAction[] = [];
  for (const n of PROGRAMS) {
    const raw = preset.programs?.[String(n)];
    if (raw === undefined) continue;
    const pp: PresetProgram = raw === null ? { days: [] } : raw;
    const cur = input.programs.find((p) => p.n === n);
    if (!cur) continue;
    const ids = programEntityIds(input.prefix, n);
    const tag = `P${n}`;

    if (pp.on !== undefined) {
      const m = hmToMinutes(pp.on);
      if (m !== null && m !== cur.on)
        actions.push({ domain: "time", service: "set_value", entity_id: ids.on, data: { time: toTimeValue(m) }, label: `${tag} accensione ${formatHM(m)}` });
    }
    if (pp.off !== undefined) {
      const m = hmToMinutes(pp.off);
      if (m !== null && m !== cur.off)
        actions.push({ domain: "time", service: "set_value", entity_id: ids.off, data: { time: toTimeValue(m) }, label: `${tag} spegnimento ${formatHM(m)}` });
    }
    if (pp.set_boiler !== undefined && pp.set_boiler !== cur.setBoiler)
      actions.push({ domain: "number", service: "set_value", entity_id: ids.setBoiler, data: { value: pp.set_boiler }, label: `${tag} set boiler ${pp.set_boiler} °C` });
    if (pp.set_water !== undefined && pp.set_water !== cur.setWater)
      actions.push({ domain: "number", service: "set_value", entity_id: ids.setWater, data: { value: pp.set_water }, label: `${tag} set acqua ${pp.set_water} °C` });

    if (pp.days !== undefined) {
      const wanted = new Set(pp.days.map((d) => dayIndex(d)).filter((d): d is number => d !== null));
      for (let d = 0; d < 7; d++) {
        const want = wanted.has(d);
        if (cur.days[d] !== want)
          actions.push({
            domain: "switch",
            service: want ? "turn_on" : "turn_off",
            entity_id: ids.day[d],
            data: {},
            label: `${tag} ${DAY_SHORT[d]} ${want ? "attivo" : "spento"}`,
          });
      }
    }
  }
  if (preset.crono !== undefined && input.cronoOn !== preset.crono)
    actions.push({
      domain: "switch",
      service: preset.crono ? "turn_on" : "turn_off",
      entity_id: input.master,
      data: {},
      label: `Cronotermostato ${preset.crono ? "attivo" : "disattivato"}`,
    });
  return actions;
}
