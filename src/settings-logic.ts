// Logica pura della finestra delle preferenze: quali impostazioni mostrare e come cambiarle.
// Nessuna dipendenza da Lit o da Home Assistant, così si prova con node:test.

import { SEASON_LABEL, seasonKey } from "./plant-logic";

/** number: input_number o number; climate: temperatura obiettivo di un termostato (climate.set_temperature); select: scelta tra poche voci (select.select_option) */
export type FieldKind = "toggle" | "number" | "climate" | "select";

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
  /** testi diversi col modo CLESS acceso (quelli non indicati restano gli stessi) */
  cless?: { label?: string; hint?: string; help?: HelpDef };
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
  /** blocco che esiste solo col modo CLESS acceso */
  onlyCless?: boolean;
  /** titolo e spiegazione diversi col modo CLESS acceso */
  cless?: { title?: string; help?: HelpDef };
}

/** Interruttore del modo CLESS: da lui dipende quali blocchi e quali testi compaiono. */
export const CLESS_MODE_ENTITY = "input_boolean.impianto_modo_cless";

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
    cless: {
      help: H(
        "Le temperature che la Polygon deve raggiungere: il target dell'acqua della caldaia e la soglia della sonda S. BOILER dell'accumulo.",
        "Cambiale solo se vuoi più calore a ogni accensione o più acqua calda; i programmi della scheda di programmazione hanno i loro valori.",
      ),
    },
    fields: [
      {
        kind: "climate",
        entity: "climate.casale_acqua",
        label: "Temperatura dell'acqua della caldaia",
        hint: "Setpoint dell'acqua di riscaldamento. I programmi della scheda di programmazione hanno i loro valori.",
        help: H("Il setpoint dell'acqua di riscaldamento della Polygon.", "Quando la casa è troppo fredda o troppo calda con i termosifoni.", "Quello che usi di solito nei programmi."),
        cless: {
          hint: "Target dell'acqua della caldaia: si ferma in ECO STOP a target + 5 °C e riparte da sola a target − isteresi (l'isteresi si imposta sulla caldaia).",
          help: H(
            "Il target dell'acqua della Polygon. In ECO STOP la caldaia si ferma quando l'acqua arriva a circa 5 °C sopra il target e riparte da sola quando scende a target meno l'isteresi, che si imposta sulla caldaia.",
            "Per scaldare di più l'accumulo a ogni accensione (target più alto) o per accendere meno spesso. Le ripartenze con l'accumulo caldo le governa il blocco «Gestione dall'accumulo».",
            "60 °C con isteresi 20 °C: riparte da sola a circa 40 °C.",
          ),
        },
      },
      {
        kind: "number",
        entity: "number.casale_setpoint_boiler",
        label: "Setpoint del puffer da 50 litri",
        hint: "Setpoint boiler della Polygon (consenso per l'acqua calda sanitaria).",
        help: H("Il setpoint boiler della Polygon: sotto questa temperatura il puffer chiede calore per l'acqua calda sanitaria.", "Alzalo se l'acqua calda finisce presto, abbassalo per consumare meno pellet."),
        cless: {
          label: "Set boiler (sonda S. BOILER)",
          hint: "Soglia della sonda S. BOILER sull'accumulo, impostata sulla caldaia. La gestione dall'accumulo ha le sue soglie.",
          help: H(
            "Il «setpoint boiler» della Polygon: la soglia della sonda S. BOILER, quella dell'acqua calda sanitaria nell'accumulo. Non è la soglia con cui la gestione dall'accumulo ferma o riaccende la caldaia.",
            "Come rete di sicurezza: sotto questa temperatura (meno un margine) la caldaia chiede calore da sola.",
            "45–50 °C.",
          ),
        },
      },
      {
        kind: "select",
        entity: "select.garage_casale_stagione",
        label: "Stagione della caldaia",
        hint: "Come sul display della caldaia: in Estate la valvola a tre vie resta sull'acqua calda sanitaria, in Inverno serve anche il riscaldamento.",
        help: H(
          "La stagione impostata sulla Polygon, la stessa del display. In Estate la valvola a tre vie resta sull'accumulo dell'acqua calda e la caldaia si ferma in ECO STOP quando la sonda S. BOILER raggiunge il Set boiler; in Inverno alterna acqua calda e riscaldamento.",
          "A inizio e a fine stagione di riscaldamento. Ogni cambio scrive nella memoria della caldaia (EEPROM), che ha un limite di scritture: non serve cambiarla spesso.",
        ),
      },
    ],
  },
  {
    id: "cless",
    group: "riscaldamento",
    master: "input_boolean.impianto_modo_cless",
    icon: "mdi:water-boiler",
    title: "Accumulo CLESS",
    help: H(
      "Si accende quando l'accumulo REQ.A CLESS ha preso il posto del boiler solare da 200 L e del puffer da 50 L. La scheda disegna l'accumulo senza puffer né pompa di integrazione, il modello del serbatoio passa a 510 L e le regole del vecchio boiler (salvaguardia delle partenze, blocco della pompa di integrazione, tempo per l'acqua pronta) si fermano: la caldaia resta accesa per produrre l'acqua calda.",
      "Accendilo il giorno in cui il CLESS è installato; spegnendolo torna tutto com'era.",
    ),
    fields: [
      {
        kind: "toggle",
        entity: "input_boolean.impianto_modo_cless",
        label: "Modo CLESS",
        hint: "Acceso: accumulo CLESS, senza puffer né pompa di integrazione. Spento: boiler solare e puffer di prima.",
        help: H("Interruttore generale: passa l'impianto dal boiler solare con il puffer all'accumulo CLESS.", "Il giorno della posa del CLESS."),
      },
      {
        kind: "number",
        entity: "input_number.boiler_solare_delta_alto",
        label: "Correzione della sonda alta",
        hint: "Si somma alla sonda ESP32 in cima: confrontala con la S. BOILER della caldaia.",
        help: H("Gradi che si sommano alla lettura della sonda ESP32 in cima al serbatoio.", "Dopo la posa: con la caldaia ferma da un po', confronta la sonda alta con la S. BOILER della Polygon e correggi la differenza."),
      },
      {
        kind: "number",
        entity: "input_number.boiler_solare_delta_basso",
        label: "Correzione della sonda bassa",
        help: H("Gradi che si sommano alla lettura della sonda ESP32 in fondo al serbatoio.", "Dopo la posa, con il serbatoio fermo da ore: le due sonde dovrebbero segnare quasi lo stesso valore in fondo."),
      },
      {
        kind: "number",
        entity: "input_number.boiler_solare_t_minima_zona",
        label: "Temperatura minima di una zona per contare le docce",
        help: H("Le docce si contano su quattro zone dell'accumulo (una per sonda): di ogni zona conta il calore sopra questa temperatura, perché sotto la serpentina sanitaria non riesce più a prelevarlo.", "Alzala se le docce stimate sono più di quelle vere, abbassala nel caso opposto.", "43 °C"),
      },
      {
        kind: "toggle",
        entity: "input_boolean.impianto_cless_avviso_spenta",
        label: "Avvisa se la caldaia si spegne",
        hint: "Avviso sul telefono se resta spenta senza programma settimanale e con qualcuno in casa. Non la riaccende.",
        help: H("Manda un avviso sul telefono se la caldaia resta spenta più dei minuti indicati, senza programma settimanale e con qualcuno in casa.", "Con la caldaia sempre accesa per l'acqua calda: segnala un allarme o una mancanza di corrente.", "Acceso."),
      },
      {
        kind: "number",
        entity: "input_number.impianto_cless_spenta_minuti",
        label: "Minuti di caldaia spenta prima dell'avviso",
        help: H("Quanto deve restare spenta la caldaia prima di avvisarti.", "Allungalo se la caldaia si ferma spesso per brevi pulizie.", "20 minuti."),
      },
    ],
  },
  {
    id: "accumulo",
    group: "riscaldamento",
    master: "input_boolean.caldaia_accumulo_attivo",
    icon: "mdi:water-boiler-auto",
    title: "Gestione dall'accumulo",
    onlyCless: true,
    help: H(
      "Decide le ripartenze della caldaia dalla sonda S. BOILER dell'accumulo e non dall'acqua della caldaia: se la caldaia riparte da sola con l'accumulo ancora caldo la partenza si annulla; spenta così, si riaccende quando l'accumulo si raffredda.",
      "Per far accendere la caldaia meno spesso, solo quando l'accumulo ha davvero bisogno di calore. Disattivalo per lasciare le ripartenze alla caldaia.",
      "Non lasciar ripartire da 55 °C, riaccendi sotto 53 °C.",
    ),
    fields: [
      {
        kind: "toggle",
        entity: "input_boolean.caldaia_accumulo_attivo",
        label: "Gestione dall'accumulo",
        hint: "Acceso: la caldaia riparte solo quando S. BOILER lo chiede. Spento: decide la caldaia.",
        help: H("Interruttore generale della gestione delle ripartenze dall'accumulo.", "Spegnilo se vuoi che la caldaia riparta da sola come prima."),
      },
      {
        kind: "number",
        entity: "input_number.caldaia_accumulo_t_spegni",
        label: "Non farla ripartire se S. BOILER è almeno",
        help: H(
          "Se la caldaia prova a ripartire da sola e la sonda S. BOILER è già a questa temperatura o più, la partenza si annulla.",
          "Alzala se vuoi che l'accumulo si scaldi di più prima di una ripartenza, abbassala per accendere più spesso. Deve restare sopra la soglia di riaccensione.",
          "55 °C.",
        ),
      },
      {
        kind: "number",
        entity: "input_number.caldaia_accumulo_t_accendi",
        label: "Riaccendila se S. BOILER scende sotto",
        help: H(
          "Con la caldaia spenta dalla gestione, si riaccende quando S. BOILER scende sotto questa temperatura.",
          "Alzala se l'acqua calda finisce presto, abbassala per accendere meno. L'acqua calda sanitaria vuole almeno 50–55 °C in cima (S3, circa 6 K sopra S. BOILER).",
          "53 °C.",
        ),
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
  /** select: le voci (value = testo da inviare a select.select_option) e quella attuale */
  choices?: { value: string; label: string }[];
  choice?: string | null;
}

export interface SectionView {
  id: string;
  /** modo CLESS acceso (cambia i testi di alcuni blocchi) */
  cless?: boolean;
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
}

function num(v: unknown, fallback: number): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Costruisce la vista: le impostazioni la cui entità non esiste vengono nascoste (pacchetto non installato),
 * le sezioni senza righe spariscono. L'interruttore generale di un blocco esce dalle righe e va nell'intestazione.
 */
export function buildSettingsView(states: Record<string, StateLike | undefined>, sections: SectionDef[] = SETTINGS_SECTIONS): SectionView[] {
  const out: SectionView[] = [];
  const cless = states[CLESS_MODE_ENTITY]?.state === "on";
  for (const sec of sections) {
    // il blocco della gestione dall'accumulo esiste solo col modo CLESS acceso
    if (!cless && sec.onlyCless) continue;
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
      const options = f.kind === "select" && Array.isArray(st.attributes.options) ? (st.attributes.options as unknown[]).map(String) : [];
      const choices = f.kind === "select" ? options.map((o) => ({ value: o, label: seasonKey(o) ? SEASON_LABEL[seasonKey(o)!] : o })) : undefined;
      all.push({
        kind: f.kind,
        entity: f.entity,
        ...(choices ? { choices, choice: unavailable ? null : options.includes(st.state) ? st.state : null } : {}),
        domain: f.entity.split(".")[0],
        label: (cless && f.cless?.label) || f.label,
        hint: cless && f.cless?.hint !== undefined ? f.cless.hint : f.hint,
        help: (cless && f.cless?.help) || f.help,
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
      title: (cless && sec.cless?.title) || sec.title,
      advanced: !!sec.advanced,
      help: (cless && sec.cless?.help) || sec.help,
      cless,
      master,
      rows,
      summary: "",
      notes: [],
    };
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

/** Servizio che sceglie una voce di un select (la stagione della caldaia). */
export function selectService(row: Pick<RowView, "entity">, option: string): { domain: string; service: string; data: Record<string, unknown> } {
  return { domain: "select", service: "select_option", data: { entity_id: row.entity, option } };
}

/** Voce attuale di un select a parole («Estate»), o «–». */
export function choiceLabel(row: RowView | undefined): string {
  return row?.choices?.find((c) => c.value === row.choice)?.label ?? "–";
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
      if (!p || row.kind === "toggle" || row.kind === "select") return row;
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
export function sectionSummaryText(sec: Pick<SectionView, "id" | "master" | "cless">, rows: RowView[]): string {
  const g = (e: string) => byEntity(rows, e);
  if (sec.master?.unavailable) return "Non disponibile";
  switch (sec.id) {
    case "caldaia":
      return `Acqua ${italianValue(g("climate.casale_acqua"))} · ${sec.cless ? "set boiler" : "puffer"} ${italianValue(g("number.casale_setpoint_boiler"))}${g("select.garage_casale_stagione")?.choice ? ` · ${choiceLabel(g("select.garage_casale_stagione"))}` : ""}`;
    case "accumulo":
      return sec.master?.on
        ? `Attiva: non riparte da ${italianValue(g("input_number.caldaia_accumulo_t_spegni"))}, riaccende sotto ${italianValue(g("input_number.caldaia_accumulo_t_accendi"))}`
        : "Disattivata: la caldaia riparte quando decide lei";
    case "cless":
      return sec.master?.on ? "Acceso: accumulo CLESS, senza puffer né integrazione" : "Spento: boiler solare da 200 L e puffer";
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
export function sectionNotes(sec: Pick<SectionView, "id" | "master" | "cless">, rows: RowView[]): string[] {
  const g = (e: string) => byEntity(rows, e);
  if (sec.id === "cless") {
    return [
      sec.master?.on
        ? "La scheda mostra l'accumulo CLESS. La salvaguardia delle partenze, il blocco della pompa di integrazione e il tempo per l'acqua pronta sono fermi e nascosti da queste preferenze: le ripartenze della caldaia le decide il blocco «Gestione dall'accumulo», oppure la caldaia da sola."
        : "Sono attive le regole del boiler solare e del puffer da 50 litri.",
    ];
  }
  if (sec.id === "accumulo") {
    const spegni = g("input_number.caldaia_accumulo_t_spegni");
    const accendi = g("input_number.caldaia_accumulo_t_accendi");
    if (!sec.master?.on || spegni?.value == null || accendi?.value == null) return [];
    const out = [
      `Se la caldaia riparte da sola con S. BOILER a ${bare(spegni)} °C o più la partenza si annulla; spenta così, si riaccende sotto ${bare(accendi)} °C, o se serve riscaldamento con S. BOILER sotto ${bare(spegni)} °C.`,
    ];
    if (accendi.value >= spegni.value) out.push("Attenzione: la soglia di riaccensione dovrebbe essere più bassa di quella di non-ripartenza.");
    return out;
  }
  if (sec.id === "assenza") {
    const min = g("input_number.caldaia_assenza_minuti");
    const t = g("input_number.caldaia_assenza_t_esterna_min");
    if (!sec.master?.on || min?.value == null) return [];
    const freddo = t?.value != null ? ` Con meno di ${bare(t)} °C fuori non la spegne, per non far raffreddare la casa.` : "";
    return [`Se nessuno è in casa da ${bare(min)} minuti (iPhone e Wi-Fi) la caldaia si spegne; al rientro riparte solo se c'è un programma attivo.${freddo}`];
  }
  return [];
}

// ---------------------------------------------------------------------------------------------------------------
// Riepilogo e frasi di un blocco

/** Riepilogo e frasi del blocco, calcolati dai valori che le righe mostrano adesso (anche quelli in attesa di conferma). */
export function describeSection(view: SectionView): SectionView {
  const all = view.master ? [view.master, ...view.rows] : view.rows;
  return {
    ...view,
    summary: sectionSummaryText(view, all),
    notes: sectionNotes(view, all),
  };
}
