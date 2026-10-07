// Logica pura della finestra delle preferenze: quali impostazioni mostrare e come cambiarle.
// Nessuna dipendenza da Lit o da Home Assistant, così si prova con node:test.

/** number: input_number o number; climate: temperatura obiettivo di un termostato (climate.set_temperature) */
export type FieldKind = "toggle" | "number" | "climate";

export interface FieldDef {
  kind: FieldKind;
  entity: string;
  label: string;
  hint?: string;
}

export interface SectionDef {
  title: string;
  /** sezione ripiegata di partenza */
  advanced?: boolean;
  fields: FieldDef[];
}

export const SETTINGS_SECTIONS: SectionDef[] = [
  {
    title: "Pompa di integrazione",
    fields: [
      {
        kind: "toggle",
        entity: "input_boolean.caldaia_integrazione_blocco_attivo",
        label: "Blocco automatico",
        hint: "Tiene ferma la pompa quando il puffer non è abbastanza più caldo del boiler.",
      },
      {
        kind: "toggle",
        entity: "input_boolean.caldaia_integrazione_forzatura_attiva",
        label: "Accensione forzata",
        hint: "Accende la pompa anche quando l'Elios non la chiama, finché il puffer ha calore da cedere.",
      },
      {
        kind: "number",
        entity: "input_number.caldaia_integrazione_delta_blocco",
        label: "Blocca se il puffer supera il boiler di meno di",
      },
      {
        kind: "number",
        entity: "input_number.caldaia_integrazione_delta_sblocco",
        label: "Sblocca quando il puffer supera il boiler di",
      },
      {
        kind: "number",
        entity: "input_number.caldaia_integrazione_temp_max",
        label: "Non scaldare la testa del boiler oltre",
      },
      {
        kind: "number",
        entity: "input_number.caldaia_integrazione_isteresi_max",
        label: "Isteresi su questa temperatura",
      },
    ],
  },
  {
    title: "Caldaia a pellet (Polygon)",
    fields: [
      {
        kind: "climate",
        entity: "climate.casale_acqua",
        label: "Temperatura dell'acqua della caldaia",
        hint: "Setpoint dell'acqua di riscaldamento. I programmi della scheda di programmazione hanno i loro valori.",
      },
      {
        kind: "number",
        entity: "number.casale_setpoint_boiler",
        label: "Setpoint del puffer da 50 litri",
        hint: "Setpoint boiler della Polygon (consenso per l'acqua calda sanitaria).",
      },
    ],
  },
  {
    title: "Salvaguardia accensioni",
    fields: [
      {
        kind: "toggle",
        entity: "input_boolean.caldaia_salvaguardia_attiva",
        label: "Evita partenze inutili",
        hint: "Annulla l'avvio della caldaia quando il puffer è già caldo.",
      },
      {
        kind: "number",
        entity: "input_number.caldaia_salvaguardia_t_puffer",
        label: "Partenza inutile se il puffer è già sopra",
      },
    ],
  },
  {
    title: "Consumo di pellet (stima)",
    advanced: true,
    fields: [
      {
        kind: "number",
        entity: "input_number.caldaia_pellet_kg_h_min",
        label: "Consumo a potenza minima (30 %)",
        hint: "Chili all'ora quando la caldaia modula al minimo.",
      },
      {
        kind: "number",
        entity: "input_number.caldaia_pellet_kg_h_max",
        label: "Consumo a potenza 100 %",
        hint: "Chili all'ora quando la caldaia lavora al massimo.",
      },
      {
        kind: "number",
        entity: "input_number.caldaia_pellet_kg_h_mantenimento",
        label: "Consumo in stand-by e spegnimento",
      },
      { kind: "number", entity: "input_number.caldaia_pellet_g_accensione", label: "Consumo per accensione" },
      {
        kind: "number",
        entity: "input_number.caldaia_pellet_fattore",
        label: "Fattore di taratura",
        hint: "Pellet realmente consumato diviso la stima: 1,10 = la stima è bassa del 10 %.",
      },
    ],
  },
  {
    title: "Misura delle pompe",
    advanced: true,
    fields: [
      {
        kind: "toggle",
        entity: "input_boolean.centralina_pompe_misura_attiva",
        label: "Misura della potenza attiva",
        hint: "Spenta se il misuratore è scollegato: gli indicatori delle pompe spariscono.",
      },
      { kind: "number", entity: "input_number.centralina_pompe_w_ferme", label: "Pompe ferme sotto" },
      { kind: "number", entity: "input_number.centralina_pompe_w_collettore_max", label: "Solo collettore fino a" },
      { kind: "number", entity: "input_number.centralina_pompe_w_entrambe_min", label: "Entrambe le pompe da" },
      { kind: "number", entity: "input_number.centralina_pompa_integrazione_w_min", label: "Integrazione accesa sopra (Shelly 1PM)" },
    ],
  },
];

export interface StateLike {
  state: string;
  attributes: Record<string, unknown>;
}

export interface RowView {
  kind: FieldKind;
  entity: string;
  /** dominio dell'entità (input_number, number, climate, input_boolean) */
  domain: string;
  label: string;
  hint?: string;
  /** toggle: acceso */
  on: boolean;
  /** number: valore corrente (null se non numerico) */
  value: number | null;
  unit: string;
  min: number;
  max: number;
  step: number;
  /** l'entità c'è ma non risponde */
  unavailable: boolean;
  /** il valore mostrato è quello appena scelto, la caldaia non l'ha ancora confermato */
  saving?: boolean;
}

export interface SectionView {
  title: string;
  advanced: boolean;
  rows: RowView[];
}

function num(v: unknown, fallback: number): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Costruisce la vista: le impostazioni la cui entità non esiste vengono nascoste (pacchetto non installato),
 * le sezioni senza righe spariscono.
 */
export function buildSettingsView(states: Record<string, StateLike | undefined>, sections: SectionDef[] = SETTINGS_SECTIONS): SectionView[] {
  const out: SectionView[] = [];
  for (const sec of sections) {
    const rows: RowView[] = [];
    for (const f of sec.fields) {
      const st = states[f.entity];
      if (!st) continue;
      const unavailable = st.state === "unavailable" || st.state === "unknown";
      const isClimate = f.kind === "climate";
      let value: number | null = null;
      if (f.kind === "number" && !unavailable && Number.isFinite(Number(st.state))) value = Number(st.state);
      if (isClimate && !unavailable && st.attributes.temperature !== null && st.attributes.temperature !== undefined && Number.isFinite(Number(st.attributes.temperature))) {
        value = Number(st.attributes.temperature);
      }
      rows.push({
        kind: f.kind,
        entity: f.entity,
        domain: f.entity.split(".")[0],
        label: f.label,
        hint: f.hint,
        on: st.state === "on",
        value,
        unit: isClimate ? "°C" : String(st.attributes.unit_of_measurement ?? ""),
        min: isClimate ? num(st.attributes.min_temp, 30) : num(st.attributes.min, 0),
        max: isClimate ? num(st.attributes.max_temp, 90) : num(st.attributes.max, 100),
        step: (isClimate ? num(st.attributes.target_temp_step, 1) : num(st.attributes.step, 1)) || 1,
        unavailable,
      });
    }
    if (rows.length) out.push({ title: sec.title, advanced: !!sec.advanced, rows });
  }
  return out;
}

function decimals(step: number): number {
  const s = String(step);
  const i = s.indexOf(".");
  return i < 0 ? 0 : s.length - i - 1;
}

/** Porta il valore sulla griglia del passo (a partire da min), dentro min..max, senza errori di arrotondamento. */
export function clampValue(v: number, min: number, max: number, step: number): number {
  const snapped = min + Math.round((v - min) / step) * step;
  const c = Math.min(max, Math.max(min, snapped));
  return Number(c.toFixed(decimals(step)));
}

/** Un passo avanti (+1) o indietro (-1), restando nei limiti. */
export function stepValue(value: number | null, dir: 1 | -1, min: number, max: number, step: number): number {
  const base = value ?? min;
  return clampValue(base + dir * step, min, max, step);
}

/** Testo del valore con unità, per la riga. */
export function valueText(row: Pick<RowView, "value" | "unit" | "step">): string {
  if (row.value === null) return "–";
  const d = decimals(row.step);
  return `${row.value.toFixed(d)}${row.unit ? ` ${row.unit}` : ""}`;
}

/** Servizio di Home Assistant che scrive un valore nell'entità della riga. */
export function writeService(row: Pick<RowView, "domain" | "entity">, value: number): { domain: string; service: string; data: Record<string, unknown> } {
  if (row.domain === "climate") return { domain: "climate", service: "set_temperature", data: { entity_id: row.entity, temperature: value } };
  if (row.domain === "number") return { domain: "number", service: "set_value", data: { entity_id: row.entity, value } };
  return { domain: "input_number", service: "set_value", data: { entity_id: row.entity, value } };
}

/** Valori appena scelti e non ancora confermati dall'impianto (la caldaia risponde via cloud dopo parecchi secondi). */
export type PendingMap = Record<string, { value: number; until: number }>;

/** Dopo quanto un valore non confermato viene scartato e si torna a mostrare quello reale. */
export const PENDING_MS = 30000;

/**
 * Sovrappone alle righe i valori in attesa di conferma, così l'interfaccia risponde subito e premendo
 * più volte + si parte dal valore già scelto. `settled` elenca le entità da togliere dall'attesa
 * (confermate o scadute).
 */
export function applyPending(sections: SectionView[], pending: PendingMap, now: number): { sections: SectionView[]; settled: string[] } {
  const settled: string[] = [];
  const out = sections.map((sec) => ({
    ...sec,
    rows: sec.rows.map((row) => {
      const p = pending[row.entity];
      if (!p || row.kind === "toggle") return row;
      if (now >= p.until || row.value === p.value) {
        settled.push(row.entity);
        return row;
      }
      return { ...row, value: p.value, saving: true };
    }),
  }));
  return { sections: out, settled };
}
