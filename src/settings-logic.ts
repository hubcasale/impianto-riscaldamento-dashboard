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

/** Gruppi in cui la finestra raccoglie i blocchi, nell'ordine in cui compaiono. */
export const SETTINGS_GROUPS: { id: string; title: string; note?: string }[] = [
  { id: "riscaldamento", title: "Caldaia e acqua calda" },
  { id: "pompe", title: "Pompe" },
  { id: "casa", title: "Quando esci di casa" },
  { id: "taratura", title: "Taratura", note: "Valori che si cambiano di rado: con quelli giusti non serve toccarli." },
];

export interface SectionDef {
  /** identificativo stabile del blocco */
  id: string;
  /** gruppo della finestra (vedi SETTINGS_GROUPS) */
  group: string;
  /** interruttore generale del blocco: sta nell'intestazione, senza aprire il blocco */
  master?: string;
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
    group: "riscaldamento",
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
    group: "riscaldamento",
    master: "input_boolean.caldaia_salvaguardia_attiva",
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
    group: "pompe",
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
    group: "casa",
    master: "input_boolean.caldaia_assenza_attiva",
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
    group: "taratura",
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
    group: "taratura",
    master: "input_boolean.centralina_pompe_misura_attiva",
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
  {
    id: "solare",
    group: "taratura",
    icon: "mdi:solar-power-variant",
    title: "Modello del collettore solare",
    advanced: true,
    help: H(
      "I valori con cui la scheda stima la temperatura del collettore e la resa del sole: posizione dei pannelli, quanto si scaldano e quanto ci mettono.",
      "Si ritarano confrontando la stima con il display del regolatore, a pompa ferma e con il sole pieno; altrimenti lasciali come sono.",
    ),
    fields: [
      {
        kind: "number",
        entity: "input_number.solare_termico_k",
        label: "Riscaldamento al sole",
        hint: "Di quanti gradi il collettore ferma supera l'aria per ogni W/m² di sole sul piano.",
        help: H("Quanto si scalda il collettore a pompa ferma per ogni W/m² di sole: più è alto, più la stima è calda.", "Alzalo se la stima è più fredda del display del regolatore a sole pieno, abbassalo nel caso opposto.", "0,078 (ritarato il 15/10/2026)."),
      },
      {
        kind: "number",
        entity: "input_number.solare_termico_tau",
        label: "Inerzia del collettore",
        hint: "Quanto tempo ci mette a scaldarsi e a raffreddarsi.",
        help: H("La costante di tempo con cui la stima segue la temperatura che il sole richiederebbe.", "Alzala se la stima sale e scende troppo in fretta rispetto al display, abbassala nel caso opposto.", "120 minuti (ritarato il 15/10/2026)."),
      },
      {
        kind: "number",
        entity: "input_number.solare_termico_inclinazione",
        label: "Inclinazione dei collettori",
        hint: "Rispetto all'orizzontale: 0° piatti, 90° verticali.",
        help: H("L'inclinazione reale dei pannelli, per calcolare quanto sole ricevono.", "Si cambia solo se si spostano i pannelli.", "22°."),
      },
      {
        kind: "number",
        entity: "input_number.solare_termico_orientamento",
        label: "Orientamento dei collettori",
        hint: "180° è sud, 270° è ovest.",
        help: H("La direzione verso cui guardano i pannelli.", "Si cambia solo se si spostano i pannelli.", "270° (ovest)."),
      },
      {
        kind: "number",
        entity: "input_number.solare_fattore_stazione",
        label: "Correzione del sensore di sole",
        hint: "Il sensore della stazione legge circa il 54 % del satellite: 1,6 lo porta a valori reali.",
        help: H("Moltiplica il sole misurato dalla stazione per ottenere i W/m² reali nei grafici di confronto con il satellite e l'allsky. Non cambia il sensore originale.", "Si ritara se il sensore viene spostato o sostituito.", "1,6."),
      },
      {
        kind: "number",
        entity: "input_number.solare_pannello_fattore_sereno",
        label: "Correzione del cielo sereno",
        hint: "Aggiusta la previsione della massima del pannello nelle giornate limpide.",
        help: H("Moltiplica il sole a cielo sereno usato per prevedere la massima del pannello.", "Si ritara dopo qualche giornata limpida, confrontando la massima prevista con quella raggiunta.", "1,00."),
      },
      {
        kind: "toggle",
        entity: "input_boolean.solare_orizzonte_attivo",
        label: "Considera colline e alberi",
        hint: "Toglie il sole diretto quando il terreno lo nasconde (profilo misurato con l'allsky).",
        help: H("Quando il sole è sotto il profilo del terreno, nelle previsioni conta solo la luce diffusa.", "Spegnilo solo per confrontare le previsioni senza il terreno.", "Acceso."),
      },
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
  group: string;
  icon: string;
  title: string;
  advanced: boolean;
  help: HelpDef;
  /** interruttore generale (sta nell'intestazione, non tra le righe) */
  master?: RowView;
  /** le altre impostazioni del blocco */
  rows: RowView[];
  /** riga sotto il titolo: i valori scelti, a parole */
  summary: string;
  /** frasi che spiegano che cosa succede con i valori scelti */
  notes: string[];
  /** barra delle soglie della pompa di integrazione */
  bar?: ThresholdBar;
  /** temperature di adesso di puffer e boiler (solo per il blocco della pompa di integrazione) */
  live?: { puffer: number | null; boiler: number | null };
}

function num(v: unknown, fallback: number): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/** Sensori per la differenza di temperatura "ora" mostrata nel blocco della pompa di integrazione. */
const LIVE_PUFFER = ["sensor.puffer_temperatura_effettiva", "sensor.casale_temperatura_boiler"];
const LIVE_BOILER = ["sensor.boiler_solare_alto_stimato"];

function firstNumber(states: Record<string, StateLike | undefined>, ids: string[]): number | null {
  for (const id of ids) {
    const st = states[id];
    if (st && st.state !== "unavailable" && st.state !== "unknown" && Number.isFinite(Number(st.state))) return Number(st.state);
  }
  return null;
}

/**
 * Costruisce la vista: le impostazioni la cui entità non esiste vengono nascoste (pacchetto non installato),
 * le sezioni senza righe spariscono. L'interruttore generale di un blocco esce dalle righe e va nell'intestazione.
 */
export function buildSettingsView(states: Record<string, StateLike | undefined>, sections: SectionDef[] = SETTINGS_SECTIONS): SectionView[] {
  const out: SectionView[] = [];
  for (const sec of sections) {
    const all: RowView[] = [];
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
      all.push({
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
    if (!all.length) continue;
    const master = sec.master ? all.find((r) => r.entity === sec.master) : undefined;
    const rows = master ? all.filter((r) => r !== master) : all;
    const view: SectionView = {
      id: sec.id,
      group: sec.group,
      icon: sec.icon,
      title: sec.title,
      advanced: !!sec.advanced,
      help: sec.help,
      master,
      rows,
      summary: "",
      notes: [],
    };
    if (sec.id === "integrazione") view.live = { puffer: firstNumber(states, LIVE_PUFFER), boiler: firstNumber(states, LIVE_BOILER) };
    out.push(describeSection(view));
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
  const out = sections.map((sec) => {
    let touched = false;
    const rows = sec.rows.map((row) => {
      const p = pending[row.entity];
      if (!p || row.kind === "toggle") return row;
      if (now >= p.until || row.value === p.value) {
        settled.push(row.entity);
        return row;
      }
      touched = true;
      return { ...row, value: p.value, saving: true };
    });
    return touched ? describeSection({ ...sec, rows }) : { ...sec, rows };
  });
  return { sections: out, settled };
}


// ---------------------------------------------------------------------------------------------------------------
// Riepiloghi e spiegazioni a parole

const byEntity = (rows: RowView[], entity: string): RowView | undefined => rows.find((r) => r.entity === entity);

/** Numero all'italiana (virgola decimale), con i decimali del passo, e l'unità. */
export function italianValue(row: RowView | undefined): string {
  if (!row || row.value === null) return "–";
  return valueText(row).replace(".", ",");
}

/** Il valore senza unità, per le frasi che l'hanno già nel testo. */
function bare(row: RowView | undefined): string {
  return row && row.value !== null ? valueText({ value: row.value, unit: "", step: row.step }).replace(".", ",") : "–";
}

/** Riga di riepilogo sotto il titolo di un blocco: i valori scelti, a parole. */
export function sectionSummaryText(sec: Pick<SectionView, "id" | "master">, rows: RowView[]): string {
  const g = (e: string) => byEntity(rows, e);
  if (sec.master?.unavailable) return "Non disponibile";
  switch (sec.id) {
    case "caldaia":
      return `Acqua ${italianValue(g("climate.casale_acqua"))} · puffer ${italianValue(g("number.casale_setpoint_boiler"))}`;
    case "partenze":
      return sec.master?.on
        ? `Attiva: non parte se il puffer è già sopra ${italianValue(g("input_number.caldaia_salvaguardia_t_puffer"))}`
        : "Disattivata: la caldaia parte sempre con il programma";
    case "integrazione": {
      const blocco = g("input_boolean.caldaia_integrazione_blocco_attivo");
      const forza = g("input_boolean.caldaia_integrazione_forzatura_attiva");
      const parts = [blocco ? (blocco.on ? "Blocco attivo" : "Blocco spento") : null, forza?.on ? "forzatura attiva" : null, `testa boiler max ${italianValue(g("input_number.caldaia_integrazione_temp_max"))}`];
      return parts.filter(Boolean).join(" · ");
    }
    case "assenza": {
      if (!sec.master?.on) return "Disattivato: la caldaia non si spegne da sola";
      const ospiti = g("input_boolean.caldaia_assenza_ospiti");
      return `Spegne dopo ${italianValue(g("input_number.caldaia_assenza_minuti"))} di casa vuota${ospiti?.on ? " · ospiti in casa" : ""}`;
    }
    case "pellet":
      return `${bare(g("input_number.caldaia_pellet_kg_h_min"))}–${italianValue(g("input_number.caldaia_pellet_kg_h_max"))} · fattore ${bare(g("input_number.caldaia_pellet_fattore"))}`;
    case "pompe":
      return sec.master?.on ? `Pompe ferme sotto ${italianValue(g("input_number.centralina_pompe_w_ferme"))}` : "Misura spenta: gli indicatori delle pompe non compaiono";
    case "solare":
      return `k ${bare(g("input_number.solare_termico_k"))} · inerzia ${italianValue(g("input_number.solare_termico_tau"))} · ${bare(g("input_number.solare_termico_inclinazione"))}° verso ${bare(g("input_number.solare_termico_orientamento"))}°`;
    default: {
      const n = rows.length;
      return `${n} ${n === 1 ? "impostazione" : "impostazioni"}`;
    }
  }
}

/** Frasi che dicono che cosa succede con i valori scelti (sotto la spiegazione del blocco). */
export function sectionNotes(sec: Pick<SectionView, "id" | "master">, rows: RowView[]): string[] {
  const g = (e: string) => byEntity(rows, e);
  if (sec.id === "integrazione") {
    const max = g("input_number.caldaia_integrazione_temp_max");
    const ist = g("input_number.caldaia_integrazione_isteresi_max");
    if (max?.value == null) return [];
    const riparte = ist?.value != null ? ` e riparte sotto ${bare({ ...max, value: max.value - ist.value } as RowView)} °C` : "";
    return [`La pompa smette di scaldare quando la testa del boiler arriva a ${bare(max)} °C${riparte}.`];
  }
  if (sec.id === "assenza") {
    const min = g("input_number.caldaia_assenza_minuti");
    const t = g("input_number.caldaia_assenza_t_esterna_min");
    if (!sec.master?.on || min?.value == null) return [];
    const freddo = t?.value != null ? ` Con meno di ${bare(t)} °C fuori non la spegne, per non far raffreddare la casa.` : "";
    return [`Se nessuno è in casa da ${bare(min)} minuti (iPhone e Wi-Fi) la caldaia si spegne; al rientro riparte solo se c'è un programma attivo.${freddo}`];
  }
  if (sec.id === "partenze") {
    const t = g("input_number.caldaia_salvaguardia_t_puffer");
    if (!sec.master?.on || t?.value == null) return [];
    return [`All'ora di un programma, se il puffer è già sopra ${bare(t)} °C e il termostato non chiede calore, la partenza viene annullata: si risparmia pellet.`];
  }
  return [];
}

// ---------------------------------------------------------------------------------------------------------------
// Barra delle soglie della pompa di integrazione

export interface ThresholdBar {
  /** scala della barra: differenza puffer meno boiler da 0 a max, in gradi */
  max: number;
  block: number;
  unblock: number;
  /** differenza attuale puffer - boiler (null se non si conosce) */
  delta: number | null;
  /** in quale zona cade la differenza attuale */
  zone: "ferma" | "attesa" | "gira" | null;
  /** posizione del segnaposto, in percentuale della barra */
  markerPct: number | null;
  blockPct: number;
  unblockPct: number;
  text: string;
}

/**
 * Le due soglie del blocco: sotto la prima la pompa si ferma, sopra la seconda può ripartire, in mezzo resta com'è
 * (isteresi). Il segnaposto è la differenza di temperatura di adesso tra puffer e boiler.
 */
export function integrazioneBar(rows: RowView[], live?: { puffer: number | null; boiler: number | null }): ThresholdBar | undefined {
  const block = byEntity(rows, "input_number.caldaia_integrazione_delta_blocco")?.value;
  const unblock = byEntity(rows, "input_number.caldaia_integrazione_delta_sblocco")?.value;
  if (block == null || unblock == null) return undefined;
  const max = Math.max(Math.ceil((Math.max(block, unblock) * 1.6) / 2) * 2, 10);
  const delta = live && live.puffer !== null && live.boiler !== null ? Number((live.puffer - live.boiler).toFixed(1)) : null;
  const zone = delta === null ? null : delta < block ? "ferma" : delta > unblock ? "gira" : "attesa";
  const pct = (v: number) => Math.min(100, Math.max(0, (v / max) * 100));
  const fmtD = (v: number) => String(v).replace(".", ",");
  let text = "";
  if (delta !== null && zone) {
    const quanto = delta >= 0 ? `${fmtD(delta)} °C più caldo del boiler` : `${fmtD(-delta)} °C più freddo del boiler`;
    const effetto =
      zone === "ferma" ? "la pompa resta ferma: il puffer non scalderebbe il boiler abbastanza."
      : zone === "gira" ? "la pompa può girare."
      : "zona di attesa: la pompa resta com'è (se gira continua, se è ferma resta ferma).";
    text = `Adesso il puffer è ${quanto}: ${effetto}`;
  }
  return { max, block, unblock, delta, zone, markerPct: delta === null ? null : pct(delta), blockPct: pct(block), unblockPct: pct(unblock), text };
}

/** Riepilogo, frasi e barra del blocco, calcolati dai valori che le righe mostrano adesso (anche quelli in attesa di conferma). */
export function describeSection(view: SectionView): SectionView {
  const all = view.master ? [view.master, ...view.rows] : view.rows;
  return {
    ...view,
    summary: sectionSummaryText(view, all),
    notes: sectionNotes(view, all),
    bar: view.id === "integrazione" ? integrazioneBar(all, view.live) : undefined,
  };
}
