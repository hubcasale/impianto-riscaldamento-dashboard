// Le entità dell'impianto raggruppate e con un nome leggibile, per l'editor della scheda.
// Logica pura (nessuna dipendenza da Lit o da Home Assistant), si prova con node:test.
import { DEFAULT_ENTITIES, type PlantEntities } from "./plant-entities";

export type EntityKey = keyof PlantEntities;

export interface EntityGroup {
  id: string;
  title: string;
  icon: string;
  items: Array<{ key: EntityKey; label: string }>;
}

export const ENTITY_GROUPS: EntityGroup[] = [
  {
    id: "accumulo",
    title: "Boiler solare / puffer",
    icon: "mdi:water-boiler",
    items: [
      { key: "boiler_top", label: "Temperatura alta (S3)" },
      { key: "boiler_bottom", label: "Temperatura bassa (S2)" },
      { key: "outlet", label: "Acqua in uscita (facoltativa)" },
      { key: "puffer", label: "Puffer / S. BOILER della caldaia" },
      { key: "puffer_effective", label: "Puffer: temperatura effettiva" },
      { key: "coil_integ_in", label: "Puffer: pozzetto c (generatore)" },
      { key: "coil_integ_out", label: "Puffer: pozzetto b (minima riscaldamento)" },
      { key: "cless_mode", label: "Interruttore «accumulo CLESS»" },
      { key: "eta", label: "Acqua pronta tra (minuti)" },
    ],
  },
  {
    id: "solare",
    title: "Solare termico",
    icon: "mdi:solar-power-variant",
    items: [
      { key: "collector_temp", label: "Temperatura del collettore" },
      { key: "solar_power", label: "Potenza solare" },
      { key: "coil_solar_in", label: "Serpentina solare: ingresso" },
      { key: "coil_solar_out", label: "Serpentina solare: uscita" },
      { key: "collector_pump", label: "Pompa del collettore in funzione" },
      { key: "collector_power", label: "Potenza della centralina solare (W)" },
      { key: "panel_max", label: "Massima prevista del collettore oggi" },
      { key: "panel_max_today", label: "Massima raggiunta oggi" },
    ],
  },
  {
    id: "caldaia",
    title: "Caldaia a pellet",
    icon: "mdi:fire",
    items: [
      { key: "stove_state", label: "Stato" },
      { key: "alarm", label: "Allarme" },
      { key: "restore_pending", label: "Ripristino dopo allarme in attesa (interruttore)" },
      { key: "restore_script", label: "Script di ripristino dopo allarme" },
      { key: "season", label: "Stagione (Estate/Inverno)" },
      { key: "stove_water", label: "Temperatura dell'acqua" },
      { key: "smoke", label: "Temperatura dei fumi" },
      { key: "flame", label: "Temperatura della fiamma" },
      { key: "power", label: "Potenza reale" },
      { key: "water_pressure", label: "Pressione dell'acqua" },
      { key: "brazier_pressure", label: "Pressione del braciere" },
      { key: "extractor", label: "Estrattore dei fumi" },
      { key: "pump", label: "Pompa dell'acqua" },
      { key: "set_boiler", label: "Set boiler" },
      { key: "set_water", label: "Set acqua (climate)" },
      { key: "crono_master", label: "Cronotermostato settimanale" },
      { key: "program_active", label: "Programma attivo adesso" },
    ],
  },
  {
    id: "richieste",
    title: "Richieste, accensione rapida e conteggi",
    icon: "mdi:counter",
    items: [
      { key: "request_acs", label: "Richiesta acqua calda" },
      { key: "request_heating", label: "Richiesta riscaldamento" },
      { key: "consent", label: "Consenso suggerito" },
      { key: "thermo_mode", label: "Termostato: modalità" },
      { key: "heat_call", label: "Termostato: sta scaldando" },
      { key: "boost_state", label: "Accensione rapida: stato" },
      { key: "boost_start_script", label: "Accensione rapida: script di avvio" },
      { key: "boost_cancel_script", label: "Accensione rapida: script di annullamento" },
      { key: "starts_today", label: "Accensioni oggi" },
      { key: "starts_yesterday", label: "Accensioni ieri" },
      { key: "standby_today", label: "Stand-by oggi" },
      { key: "work_hours_today", label: "Ore in lavoro oggi" },
    ],
  },
  {
    id: "pellet",
    title: "Pellet",
    icon: "mdi:sack",
    items: [
      { key: "pellet_reserve", label: "Riserva (sta per finire)" },
      { key: "pellet_empty", label: "Pellet esaurito" },
      { key: "pellet_open", label: "Coperchio del serbatoio aperto" },
      { key: "pellet_today", label: "Consumo di oggi (kg)" },
      { key: "pellet_week", label: "Consumo della settimana (kg)" },
      { key: "pellet_month", label: "Consumo del mese (kg)" },
      { key: "pellet_total", label: "Totale stimato (kg)" },
      { key: "pellet_ref_kg", label: "Riferimento: chili nel serbatoio" },
      { key: "pellet_ref_total", label: "Riferimento: totale stimato" },
      { key: "pellet_bag", label: "Peso di un sacco (kg)" },
    ],
  },
  {
    id: "assenza",
    title: "Assenza",
    icon: "mdi:home-export-outline",
    items: [
      { key: "away", label: "Nessuno in casa" },
      { key: "away_enabled", label: "Spegnimento per assenza attivo" },
      { key: "away_flag", label: "L'assenza ha spento la caldaia" },
      { key: "away_guests", label: "Ospiti in casa" },
      { key: "away_minutes", label: "Minuti di attesa" },
    ],
  },
  {
    id: "meteo",
    title: "Sole e irraggiamento",
    icon: "mdi:weather-sunny",
    items: [
      { key: "gti_station", label: "Irraggiamento sul piano: stazione" },
      { key: "gti_forecast", label: "Irraggiamento sul piano: previsto" },
      { key: "gti_satellite", label: "Irraggiamento sul piano: satellite" },
      { key: "cloud_forecast", label: "Nuvolosità prevista" },
      { key: "irr_station_raw", label: "Irraggiamento stazione (originale)" },
      { key: "irr_station_corrected", label: "Irraggiamento stazione (corretto)" },
      { key: "allsky_irradiance", label: "AllSky: irraggiamento stimato" },
      { key: "allsky_cloud", label: "AllSky: copertura nuvolosa" },
      { key: "allsky_sun_free", label: "AllSky: sole libero" },
      { key: "allsky_analysis", label: "AllSky: analisi" },
      { key: "sun_above_horizon", label: "Sole sopra l'orizzonte del terreno" },
      { key: "horizon_elevation", label: "Elevazione dell'orizzonte" },
      { key: "sun", label: "Sole (sun.sun)" },
    ],
  },
  {
    id: "vecchio",
    title: "Vecchio impianto (prima del CLESS)",
    icon: "mdi:archive-outline",
    items: [
      { key: "integration_pump", label: "Pompa di integrazione in funzione" },
      { key: "integration_power", label: "Pompa di integrazione: potenza" },
      { key: "integration_call", label: "Pompa di integrazione: chiamata dell'Elios" },
      { key: "integration_block_enabled", label: "Blocco della pompa: interruttore" },
      { key: "integration_block_wanted", label: "Blocco della pompa: richiesto" },
      { key: "guard", label: "Salvaguardia: interruttore" },
      { key: "guard_flag", label: "Salvaguardia: ha spento" },
    ],
  },
];

type Cfg = { type: string } & Record<string, unknown>;

function overrides(config: Cfg): Record<string, string> {
  const raw = config.entities;
  const out: Record<string, string> = {};
  if (raw && typeof raw === "object") for (const [k, v] of Object.entries(raw as Record<string, unknown>)) if (typeof v === "string" && v.trim()) out[k] = v.trim();
  return out;
}

/** L'entità in uso per ogni chiave del gruppo: quella della configurazione oppure quella di partenza. */
export function groupValues(config: Cfg, group: EntityGroup): Record<string, string> {
  const ov = overrides(config);
  const def = DEFAULT_ENTITIES as unknown as Record<string, string | undefined>;
  return Object.fromEntries(group.items.map((it) => [it.key, ov[it.key] ?? def[it.key] ?? ""]));
}

/** Quante entità del gruppo sono diverse da quelle di partenza. */
export function groupChanged(config: Cfg, group: EntityGroup): number {
  const ov = overrides(config);
  const def = DEFAULT_ENTITIES as unknown as Record<string, string | undefined>;
  return group.items.filter((it) => ov[it.key] !== undefined && ov[it.key] !== def[it.key]).length;
}

/** Quante entità del gruppo non esistono in Home Assistant (le facoltative vuote non contano). */
export function groupMissing(config: Cfg, group: EntityGroup, exists: (id: string) => boolean): number {
  return Object.values(groupValues(config, group)).filter((id) => id && !exists(id)).length;
}

/**
 * Scrive i valori di un gruppo: nella configurazione restano solo le entità diverse da quelle di partenza
 * (un campo svuotato torna a quella di partenza). Le chiavi degli altri gruppi non si toccano.
 */
export function applyGroup(config: Cfg, group: EntityGroup, values: Record<string, unknown>): Cfg {
  const ov = overrides(config);
  const def = DEFAULT_ENTITIES as unknown as Record<string, string | undefined>;
  for (const it of group.items) {
    const v = typeof values[it.key] === "string" ? (values[it.key] as string).trim() : "";
    if (!v || v === def[it.key]) delete ov[it.key];
    else ov[it.key] = v;
  }
  const next: Cfg = { ...config };
  if (Object.keys(ov).length) next.entities = ov;
  else delete next.entities;
  return next;
}

/** Dominio dell'entità di partenza, per filtrare il selettore (sensor, binary_sensor, input_boolean...). */
export function keyDomain(key: EntityKey): string | null {
  const def = (DEFAULT_ENTITIES as unknown as Record<string, string | undefined>)[key];
  return def ? def.split(".")[0] : null;
}
