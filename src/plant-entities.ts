// Le entità di Home Assistant che la scheda dell'impianto legge, con i nomi di partenza.
// Nessuna dipendenza da Lit: serve anche all'editor e alle prove.

/** Entità lette dalla scheda. Tutte facoltative: i valori predefiniti sono quelli dell'impianto di casa. */
export interface PlantEntities {
  boiler_top: string;
  boiler_bottom: string;
  /** temperatura dell'acqua in uscita; se assente si usa la sonda alta */
  outlet?: string;
  solar_power: string;
  /** acceso quando l'impianto usa l'accumulo CLESS al posto del boiler solare e del puffer da 50 L */
  cless_mode: string;
  collector_temp: string;
  puffer: string;
  stove_state: string;
  /** stagione impostata sulla caldaia (Estate/Inverno), facoltativa */
  season?: string;
  stove_water: string;
  smoke: string;
  flame: string;
  power: string;
  water_pressure: string;
  brazier_pressure: string;
  extractor: string;
  pump: string;
  alarm: string;
  set_boiler: string;
  set_water: string;
  starts_today: string;
  starts_yesterday: string;
  standby_today: string;
  work_hours_today: string;
  request_acs: string;
  request_heating: string;
  consent: string;
  /** minuti stimati per avere l'acqua a temperatura d'uso (0 = già calda) */
  eta: string;
  /** stato dell'accensione rapida (pronta, attiva, non_serve, ...) */
  boost_state: string;
  boost_start_script: string;
  boost_cancel_script: string;
  /** interruttore della salvaguardia contro le partenze inutili */
  guard: string;
  /** acceso quando la salvaguardia ha annullato una partenza e tiene d'occhio la caldaia */
  guard_flag: string;
  /** riserva di pellet (sta per finire) */
  pellet_reserve: string;
  /** pellet esaurito */
  pellet_empty: string;
  /** coperchio del serbatoio pellet aperto */
  pellet_open: string;
  /** acceso quando la pompa di integrazione (puffer - serpentina del boiler) è in funzione */
  integration_pump: string;
  /** acceso quando la pompa del collettore solare è in funzione */
  collector_pump: string;
  /** potenza (W) della pompa di integrazione, dallo Shelly 1PM */
  integration_power: string;
  /** ingresso dello Shelly 1PM: acceso quando l'Elios chiama la pompa di integrazione */
  integration_call: string;
  /** interruttore del blocco automatico della pompa di integrazione */
  integration_block_enabled: string;
  /** acceso quando la regola vuole la pompa ferma (puffer non abbastanza caldo) */
  integration_block_wanted: string;
  /** potenza (W) letta sull'alimentazione dell'Elios: con la pompa del collettore in marcia circa 32 W */
  collector_power: string;
  /** stima del consumo di pellet (kg) di oggi, della settimana e del mese */
  pellet_today: string;
  pellet_week: string;
  pellet_month: string;
  /** totale stimato del pellet consumato (kg) e riferimento del serbatoio: chili e totale stimato nel momento dell'ultimo carico o misura */
  pellet_total: string;
  pellet_ref_kg: string;
  pellet_ref_total: string;
  /** peso di un sacco (kg) */
  pellet_bag: string;
  /** temperatura misurata in ingresso alla serpentina solare del boiler (fluido caldo dal collettore) */
  coil_solar_in: string;
  /** temperatura misurata in uscita dalla serpentina solare (ritorno al collettore) */
  coil_solar_out: string;
  /** sonde ESP32 nei pozzetti del CLESS: coil_integ_in = pozzetto c di destra (generatore), coil_integ_out = pozzetto b di sinistra (minima per il riscaldamento) */
  coil_integ_in: string;
  coil_integ_out: string;
  /** massima prevista del collettore oggi e massima gia' raggiunta */
  panel_max: string;
  panel_max_today: string;
  /** puffer: lettura della caldaia oppure, senza Internet, stima dalla sonda in ingresso alla serpentina */
  puffer_effective: string;
  /** il termostato del riscaldamento (modalita', con soglia e attesa del puffer) e il suo "sta scaldando" */
  thermo_mode: string;
  heat_call: string;
  /** irraggiamento sul piano dei collettori: misurato dalla stazione, previsto da Open-Meteo, osservato dal satellite; nuvolosita' prevista */
  gti_station: string;
  gti_forecast: string;
  gti_satellite: string;
  cloud_forecast: string;
  /** irraggiamento orizzontale: stazione originale e corretta, stimato dall'allsky, e copertura nuvolosa dell'allsky */
  irr_station_raw: string;
  irr_station_corrected: string;
  allsky_irradiance: string;
  allsky_cloud: string;
  /** sole: libero dalle nuvole (allsky), analisi dell'allsky, sopra il terreno, elevazione del terreno e posizione del sole */
  allsky_sun_free: string;
  allsky_analysis: string;
  sun_above_horizon: string;
  horizon_elevation: string;
  sun: string;
  /** cronotermostato settimanale acceso e programma attivo adesso */
  crono_master: string;
  program_active: string;
  /** nessuno in casa (iCloud3 + Wi-Fi), spegnimento per assenza: attivo, fatto, ospiti, minuti */
  away: string;
  away_enabled: string;
  away_flag: string;
  away_guests: string;
  away_minutes: string;
}

export const DEFAULT_ENTITIES: PlantEntities = {
  boiler_top: "sensor.boiler_solare_alto_stimato",
  boiler_bottom: "sensor.boiler_solare_basso_stimato",
  solar_power: "sensor.solare_termico_potenza",
  cless_mode: "input_boolean.impianto_modo_cless",
  collector_temp: "sensor.solare_termico_t_collettore_stimata",
  puffer: "sensor.casale_temperatura_boiler",
  stove_state: "sensor.casale_stato",
  season: "sensor.garage_casale_stagione",
  stove_water: "sensor.casale_temperatura_acqua",
  smoke: "sensor.casale_temperatura_fumi",
  flame: "sensor.casale_temperatura_fiamma",
  power: "sensor.casale_potenza_reale",
  water_pressure: "sensor.casale_pressione_acqua",
  brazier_pressure: "sensor.casale_pressione_braciere",
  extractor: "sensor.casale_estrattore_fumi",
  pump: "sensor.casale_pompa_acqua",
  alarm: "sensor.casale_allarme",
  set_boiler: "number.casale_setpoint_boiler",
  set_water: "climate.casale_acqua",
  starts_today: "sensor.caldaia_accensioni_oggi",
  starts_yesterday: "sensor.caldaia_accensioni_ieri",
  standby_today: "sensor.caldaia_stand_by_oggi",
  work_hours_today: "sensor.caldaia_ore_in_lavoro_oggi",
  request_acs: "binary_sensor.caldaia_richiesta_acs",
  request_heating: "binary_sensor.caldaia_richiesta_riscaldamento",
  consent: "binary_sensor.caldaia_consenso_suggerito",
  eta: "sensor.caldaia_acqua_pronta_tra",
  boost_state: "sensor.caldaia_accensione_rapida_stato",
  boost_start_script: "script.caldaia_accensione_rapida",
  boost_cancel_script: "script.caldaia_accensione_rapida_annulla",
  guard: "input_boolean.caldaia_salvaguardia_attiva",
  guard_flag: "input_boolean.caldaia_salvaguardia_ha_spento",
  pellet_reserve: "binary_sensor.casale_riserva_legna",
  pellet_empty: "binary_sensor.casale_pellet_empty",
  pellet_open: "binary_sensor.casale_pellet_hopper_open",
  integration_pump: "binary_sensor.caldaia_pompa_integrazione_attiva",
  collector_pump: "binary_sensor.caldaia_pompa_collettore_attiva",
  integration_power: "sensor.garage_bs_pompa_integrazione_potenza",
  integration_call: "binary_sensor.garage_bs_pompa_integrazione_ingresso_0",
  integration_block_enabled: "input_boolean.caldaia_integrazione_blocco_attivo",
  integration_block_wanted: "binary_sensor.caldaia_integrazione_inutile",
  collector_power: "sensor.garage_centralina_solare_pompe_potenza",
  pellet_today: "sensor.caldaia_pellet_oggi",
  pellet_week: "sensor.caldaia_pellet_settimana",
  pellet_month: "sensor.caldaia_pellet_mese",
  pellet_total: "sensor.caldaia_pellet_stimato_totale",
  pellet_ref_kg: "input_number.caldaia_pellet_kg_riferimento",
  pellet_ref_total: "input_number.caldaia_pellet_totale_riferimento",
  pellet_bag: "input_number.caldaia_pellet_sacco_kg",
  coil_solar_in: "sensor.solare_termico_solare_serpentina_ingresso",
  coil_solar_out: "sensor.solare_termico_solare_serpentina_uscita",
  coil_integ_in: "sensor.locale_caldaia_solare_termico_puffer_generatore",
  coil_integ_out: "sensor.locale_caldaia_solare_termico_puffer_minima_riscaldamento",
  panel_max: "sensor.solare_pannello_massima_prevista",
  panel_max_today: "sensor.solare_pannello_massima_oggi",
  puffer_effective: "sensor.puffer_temperatura_effettiva",
  thermo_mode: "sensor.termostato_riscaldamento_modalita",
  heat_call: "binary_sensor.termostato_riscaldamento_sta_scaldando",
  gti_station: "sensor.solare_termico_irraggiamento_sul_piano",
  gti_forecast: "sensor.open_meteo_irraggiamento_previsto_sul_piano",
  gti_satellite: "sensor.open_meteo_irraggiamento_osservato_dal_satellite",
  cloud_forecast: "sensor.open_meteo_nuvolosita",
  irr_station_raw: "sensor.esterno_e_garage_stazione_meteo_sqm_irraggiamento_solare_stimato",
  irr_station_corrected: "sensor.irraggiamento_stazione_corretto",
  allsky_irradiance: "sensor.allsky_irraggiamento_stimato",
  allsky_cloud: "sensor.allsky_copertura_equivalente",
  allsky_sun_free: "binary_sensor.allsky_sole_libero",
  allsky_analysis: "sensor.allsky_analisi",
  sun_above_horizon: "binary_sensor.sole_sopra_l_orizzonte",
  horizon_elevation: "sensor.sole_elevazione_orizzonte",
  sun: "sun.sun",
  crono_master: "switch.casale_cronotermostato_settimanale",
  program_active: "binary_sensor.caldaia_programma_attivo_ora",
  away: "binary_sensor.caldaia_nessuno_in_casa",
  away_enabled: "input_boolean.caldaia_assenza_attiva",
  away_flag: "input_boolean.caldaia_assenza_ha_spento",
  away_guests: "input_boolean.caldaia_assenza_ospiti",
  away_minutes: "input_number.caldaia_assenza_minuti",
};
