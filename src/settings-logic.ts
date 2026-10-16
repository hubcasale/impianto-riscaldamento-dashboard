// Logica pura della finestra delle preferenze: quali impostazioni mostrare e come cambiarle.
// Nessuna dipendenza da Lit o da Home Assistant, così si prova con node:test.

/** number: input_number o number; climate: temperatura obiettivo di un termostato (climate.set_temperature) */
export type FieldKind = "toggle" | "number" | "climate";

/** Spiegazione che si apre toccando la "i": cosa fa, quando serve, valore consigliato (se c'è). */
export interface HelpDef {
  what: string;
  when: string;
  suggested?: string;
}

export interface FieldDef {
  kind: FieldKind;
  entity: string;
  label: string;
  hint?: string;
  help?: HelpDef;
}

export interface SectionDef {
  /** identificativo stabile del blocco */
  id: string;
  /** icona mdi del blocco */
  icon: string;
  title: string;
  /** blocco avanzato: sta sotto l'intestazione "Avanzate" */
  advanced?: boolean;
  /** spiegazione del blocco intero */
  help: HelpDef;
  fields: FieldDef[];
}

const H = (what: string, when: string, suggested?: string): HelpDef => ({ what, when, ...(suggested ? { suggested } : {}) });

export const SETTINGS_SECTIONS: SectionDef[] = [
  {
    id: "caldaia",
    icon: "mdi:fire",
    title: "Caldaia a pellet (Polygon)",
    help: H(
      "Le temperature che la Polygon deve raggiungere: l'acqua di riscaldamento e il puffer da 50 litri che serve l'acqua calda.",
      "Cambiale solo se vuoi una casa più calda o più acqua calda; i programmi della scheda di programmazione hanno i loro valori.",
    ),
    fields: [
      {
        kind: "climate",
        entity: "climate.casale_acqua",
        label: "Temperatura dell'acqua della caldaia",
        hint: "Setpoint dell'acqua di riscaldamento. I programmi della scheda di programmazione hanno i loro valori.",
        help: H("Il setpoint dell'acqua di riscaldamento della Polygon.", "Quando la casa è troppo fredda o troppo calda con i termosifoni.", "Quello che usi di solito nei programmi."),
      },
      {
        kind: "number",
        entity: "number.casale_setpoint_boiler",
        label: "Setpoint del puffer da 50 litri",
        hint: "Setpoint boiler della Polygon (consenso per l'acqua calda sanitaria).",
        help: H("Il setpoint boiler della Polygon: sotto questa temperatura il puffer chiede calore per l'acqua calda sanitaria.", "Alzalo se l'acqua calda finisce presto, abbassalo per consumare meno pellet."),
      },
    ],
  },
  {
    id: "partenze",
    icon: "mdi:shield-check",
    title: "Salvaguardia accensioni",
    help: H(
      "Evita che la caldaia parta quando non serve: il puffer e il boiler sono già caldi e nessuno chiede riscaldamento.",
      "Per non sprecare pellet nelle accensioni dei programmi quando l'acqua è già calda.",
    ),
    fields: [
      {
        kind: "toggle",
        entity: "input_boolean.caldaia_salvaguardia_attiva",
        label: "Evita partenze inutili",
        hint: "Annulla l'avvio della caldaia quando il puffer è già caldo.",
        help: H("Annulla la partenza di un programma se puffer e boiler sono già caldi e il termostato non chiede calore.", "Lascialo acceso: se serve, la caldaia riparte da sola quando il termostato chiede calore o l'acqua si raffredda.", "Acceso."),
      },
      {
        kind: "number",
        entity: "input_number.caldaia_salvaguardia_t_puffer",
        label: "Partenza inutile se il puffer è già sopra",
        help: H("La temperatura del puffer oltre la quale una partenza viene considerata inutile.", "Alzala se vuoi che la caldaia parta più spesso; abbassala per risparmiare."),
      },
    ],
  },
  {
    id: "integrazione",
    icon: "mdi:pump",
    title: "Pompa di integrazione",
    help: H(
      "La pompa che porta il calore del puffer alla serpentina del boiler. Qui si decide quando fermarla e quando forzarla.",
      "Per far lavorare bene insieme solare e caldaia, senza raffreddare il boiler con acqua meno calda.",
    ),
    fields: [
      {
        kind: "toggle",
        entity: "input_boolean.caldaia_integrazione_blocco_attivo",
        label: "Blocco automatico",
        hint: "Tiene ferma la pompa quando il puffer non è abbastanza più caldo del boiler.",
        help: H("Tiene ferma la pompa quando il puffer non è abbastanza più caldo del boiler.", "Evita di portare al boiler acqua meno calda di quella che ha già.", "Acceso."),
      },
      {
        kind: "toggle",
        entity: "input_boolean.caldaia_integrazione_forzatura_attiva",
        label: "Accensione forzata",
        hint: "Accende la pompa anche quando l'Elios non la chiama, finché il puffer ha calore da cedere.",
        help: H("Accende la pompa anche quando l'Elios non la chiama, finché il puffer ha calore da cedere.", "Per sfruttare il puffer caldo e fare meno ore di caldaia."),
      },
      {
        kind: "number",
        entity: "input_number.caldaia_integrazione_delta_blocco",
        label: "Blocca se il puffer supera il boiler di meno di",
        help: H("Se il puffer supera il boiler di meno di questi gradi la pompa si ferma.", "Alzalo se la pompa parte per differenze troppo piccole."),
      },
      {
        kind: "number",
        entity: "input_number.caldaia_integrazione_delta_sblocco",
        label: "Sblocca quando il puffer supera il boiler di",
        help: H("La differenza di temperatura oltre la quale la pompa può ripartire.", "Deve essere più alta della soglia di blocco, così la pompa non parte e si ferma di continuo."),
      },
      {
        kind: "number",
        entity: "input_number.caldaia_integrazione_temp_max",
        label: "Non scaldare la testa del boiler oltre",
        help: H("La temperatura massima della sonda alta del boiler: oltre questo valore la pompa non lo scalda più.", "Protegge dalle scottature e lascia spazio al solare.", "60 °C."),
      },
      {
        kind: "number",
        entity: "input_number.caldaia_integrazione_isteresi_max",
        label: "Isteresi su questa temperatura",
        help: H("Di quanti gradi deve scendere la testa del boiler sotto il massimo prima che la pompa possa ripartire.", "Evita accensioni e spegnimenti ravvicinati intorno al limite."),
      },
    ],
  },
  {
    id: "assenza",
    icon: "mdi:home-off",
    title: "Spegnimento se nessuno è in casa",
    help: H(
      "Spegne la caldaia quando tutti sono fuori casa (iPhone e Wi-Fi) e la riaccende al rientro solo se un programma è attivo.",
      "Per non scaldare una casa vuota quando ti dimentichi di spegnere.",
    ),
    fields: [
      {
        kind: "toggle",
        entity: "input_boolean.caldaia_assenza_attiva",
        label: "Spegni la caldaia con la casa vuota",
        hint: "Usa gli iPhone (iCloud3) e il Wi-Fi CASALE2G. Al rientro riaccende solo se un programma è attivo.",
        help: H("Spegne la caldaia dopo il tempo indicato di casa vuota, controllando gli iPhone (iCloud3) e il Wi-Fi CASALE2G.", "Se parti e ti dimentichi di spegnere o di premere Vacanza."),
      },
      {
        kind: "toggle",
        entity: "input_boolean.caldaia_assenza_ospiti",
        label: "Ospiti in casa (non spegnere)",
        hint: "Per chi non ha un telefono tracciato.",
        help: H("Con gli ospiti la casa non è considerata vuota e la caldaia non si spegne.", "Quando ci sono persone che non hanno un telefono tracciato."),
      },
      {
        kind: "number",
        entity: "input_number.caldaia_assenza_minuti",
        label: "Spegni dopo questi minuti di assenza",
        help: H("Quanto deve restare vuota la casa prima di spegnere.", "Allungalo se esci spesso per brevi commissioni."),
      },
      {
        kind: "number",
        entity: "input_number.caldaia_assenza_t_esterna_min",
        label: "Non spegnere se fuori fa meno di",
        help: H("Con più freddo di questa temperatura esterna la caldaia non viene spenta.", "Per non far raffreddare troppo la casa nelle giornate più fredde."),
      },
    ],
  },
  {
    id: "pellet",
    icon: "mdi:grain",
    title: "Consumo di pellet (stima)",
    advanced: true,
    help: H(
      "I valori con cui la scheda stima quanto pellet consuma la caldaia (non c'è un sensore del pellet).",
      "Si ritarano una volta, confrontando la stima con i sacchi realmente usati.",
    ),
    fields: [
      {
        kind: "number",
        entity: "input_number.caldaia_pellet_kg_h_min",
        label: "Consumo a potenza minima (30 %)",
        hint: "Chili all'ora quando la caldaia modula al minimo.",
        help: H("I chili di pellet all'ora quando la caldaia modula al minimo.", "Per la stima del consumo."),
      },
      {
        kind: "number",
        entity: "input_number.caldaia_pellet_kg_h_max",
        label: "Consumo a potenza 100 %",
        hint: "Chili all'ora quando la caldaia lavora al massimo.",
        help: H("I chili di pellet all'ora quando la caldaia lavora al massimo.", "Per la stima del consumo."),
      },
      {
        kind: "number",
        entity: "input_number.caldaia_pellet_kg_h_mantenimento",
        label: "Consumo in stand-by e spegnimento",
        help: H("I chili all'ora consumati durante lo stand-by e lo spegnimento.", "Per la stima del consumo."),
      },
      {
        kind: "number",
        entity: "input_number.caldaia_pellet_g_accensione",
        label: "Consumo per accensione",
        help: H("I grammi di pellet usati a ogni accensione.", "Per la stima del consumo."),
      },
      {
        kind: "number",
        entity: "input_number.caldaia_pellet_fattore",
        label: "Fattore di taratura",
        hint: "Pellet realmente consumato diviso la stima: 1,10 = la stima è bassa del 10 %.",
        help: H("Pellet realmente consumato diviso la stima: 1,10 significa che la stima è bassa del 10 %.", "Dopo aver finito un sacco o una scorta, per allineare la stima alla realtà.", "1,00 finché non hai un confronto."),
      },
    ],
  },
  {
    id: "pompe",
    icon: "mdi:flash-outline",
    title: "Misura delle pompe",
    advanced: true,
    help: H(
      "Le soglie in watt con cui la scheda capisce se le pompe del collettore e dell'integrazione sono ferme o accese.",
      "Servono solo se cambi le pompe o il misuratore: altrimenti lasciale come sono.",
    ),
    fields: [
      {
        kind: "toggle",
        entity: "input_boolean.centralina_pompe_misura_attiva",
        label: "Misura della potenza attiva",
        hint: "Spenta se il misuratore è scollegato: gli indicatori delle pompe spariscono.",
        help: H("Attiva la lettura della potenza delle pompe. Spenta, gli indicatori delle pompe spariscono.", "Spegnila se il misuratore è scollegato."),
      },
      { kind: "number", entity: "input_number.centralina_pompe_w_ferme", label: "Pompe ferme sotto", help: H("Sotto questa potenza le pompe sono considerate ferme.", "Alzala se il misuratore legge un po' anche a pompe ferme.") },
      { kind: "number", entity: "input_number.centralina_pompe_w_collettore_max", label: "Solo collettore fino a", help: H("Fino a questa potenza è accesa solo la pompa del collettore.", "Si ritara con le misure reali delle due pompe.") },
      { kind: "number", entity: "input_number.centralina_pompe_w_entrambe_min", label: "Entrambe le pompe da", help: H("Da questa potenza risultano accese entrambe le pompe.", "Si ritara con le misure reali delle due pompe.") },
      { kind: "number", entity: "input_number.centralina_pompa_integrazione_w_min", label: "Integrazione accesa sopra (Shelly 1PM)", help: H("Sopra questa potenza, misurata dallo Shelly 1PM, la pompa di integrazione è considerata accesa.", "Si ritara se cambi pompa.") },
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
  help?: HelpDef;
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
  id: string;
  icon: string;
  title: string;
  advanced: boolean;
  help: HelpDef;
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
        help: f.help,
        on: st.state === "on",
        value,
        unit: isClimate ? "°C" : String(st.attributes.unit_of_measurement ?? ""),
        min: isClimate ? num(st.attributes.min_temp, 30) : num(st.attributes.min, 0),
        max: isClimate ? num(st.attributes.max_temp, 90) : num(st.attributes.max, 100),
        step: (isClimate ? num(st.attributes.target_temp_step, 1) : num(st.attributes.step, 1)) || 1,
        unavailable,
      });
    }
    if (rows.length) out.push({ id: sec.id, icon: sec.icon, title: sec.title, advanced: !!sec.advanced, help: sec.help, rows });
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

/** Riga di riepilogo di un blocco (sotto il titolo): se ha un interruttore dice se è attivo, altrimenti quante impostazioni ha. */
export function sectionSummary(sec: Pick<SectionView, "rows">): string {
  const first = sec.rows.find((r) => r.kind === "toggle");
  const n = sec.rows.length;
  const count = `${n} ${n === 1 ? "impostazione" : "impostazioni"}`;
  if (!first) return count;
  if (first.unavailable) return "Non disponibile";
  return `${first.on ? "Attivo" : "Disattivato"} · ${count}`;
}
