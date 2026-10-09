import { LitElement, html, css, svg, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import type { HomeAssistant } from "./types";
import type { ImpiantoSettingsDialog } from "./settings-dialog";
import "./settings-dialog";
import type { ImpiantoInfoDialog } from "./info-dialog";
import "./info-dialog";
import type { ImpiantoChartsDialog } from "./charts-dialog";
import "./charts-dialog";
import { summarize, type SummaryLine } from "./summary-logic";
import { DEFAULT_MODEL, boostButton, collectorPumpPill, etaText, fmt, integrationPumpPill, panelColor, panelModel, pelletStatus, showersEstimate, stoveLook, tempColor, toNumber, type BoilerModel, type PanelModel, type StoveLook } from "./plant-logic";

const CARD_TAG = "impianto-overview-card";

/** Entità lette dalla scheda. Tutte facoltative: i valori predefiniti sono quelli dell'impianto di casa. */
export interface PlantEntities {
  boiler_top: string;
  boiler_bottom: string;
  /** temperatura dell'acqua in uscita; se assente si usa la sonda alta */
  outlet?: string;
  solar_power: string;
  collector_temp: string;
  puffer: string;
  stove_state: string;
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
  /** temperatura misurata in ingresso alla serpentina solare del boiler (fluido caldo dal collettore) */
  coil_solar_in: string;
  /** temperatura misurata in uscita dalla serpentina solare (ritorno al collettore) */
  coil_solar_out: string;
  /** temperatura misurata in ingresso (mandata dal puffer) e in uscita (ritorno al puffer) della serpentina di integrazione */
  coil_integ_in: string;
  coil_integ_out: string;
  /** massima prevista del collettore oggi e massima gia' raggiunta */
  panel_max: string;
  panel_max_today: string;
  /** puffer: lettura della caldaia oppure, senza Internet, stima dalla sonda in ingresso alla serpentina */
  puffer_effective: string;
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
  collector_temp: "sensor.solare_termico_t_collettore_stimata",
  puffer: "sensor.casale_temperatura_boiler",
  stove_state: "sensor.casale_stato",
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
  coil_solar_in: "sensor.solare_termico_solare_serpentina_ingresso",
  coil_solar_out: "sensor.solare_termico_solare_serpentina_uscita",
  coil_integ_in: "sensor.solare_termico_integrazione_serpentina_ingresso",
  coil_integ_out: "sensor.solare_termico_integrazione_serpentina_uscita",
  panel_max: "sensor.solare_pannello_massima_prevista",
  panel_max_today: "sensor.solare_pannello_massima_oggi",
  puffer_effective: "sensor.puffer_temperatura_effettiva",
  crono_master: "switch.casale_cronotermostato_settimanale",
  program_active: "binary_sensor.caldaia_programma_attivo_ora",
  away: "binary_sensor.caldaia_nessuno_in_casa",
  away_enabled: "input_boolean.caldaia_assenza_attiva",
  away_flag: "input_boolean.caldaia_assenza_ha_spento",
  away_guests: "input_boolean.caldaia_assenza_ospiti",
  away_minutes: "input_number.caldaia_assenza_minuti",
};

/** Un numero oppure l'id di un'entità numerica. */
type NumOrEntity = number | string;

export interface PlantCardConfig {
  type: string;
  title?: string;
  /** false per nascondere il pulsante delle preferenze */
  settings?: boolean;
  /** false per nascondere il pulsante "Stato" */
  summary?: boolean;
  /** false per nascondere il pulsante "Grafici" */
  charts?: boolean;
  /** "auto" (predefinito): compatta sugli schermi bassi (tablet); true/false per forzare */
  compact?: boolean | "auto";
  entities?: Partial<PlantEntities>;
  model?: {
    /** litri del boiler solare (utili: 190 per un Bolly 2 da 200 L) */
    volume?: NumOrEntity;
    /** quota di volume rappresentata dalla sonda alta, in % (o 0..1) */
    top_share?: NumOrEntity;
    /** temperatura dell'acqua di rete, °C */
    mains_temp?: NumOrEntity;
    shower_volume?: NumOrEntity;
    shower_temp?: NumOrEntity;
  };
}

const DEFAULT_MODEL_ENTITIES = {
  volume: "input_number.boiler_solare_volume",
  top_share: "input_number.boiler_solare_peso_alto",
  mains_temp: "input_number.boiler_solare_t_rete",
};

const FLAME_PATH =
  "M0,-100 C10,-70 45,-50 45,-15 C45,12 25,25 0,25 C-25,25 -45,12 -45,-15 C-45,-32 -35,-45 -25,-58 C-22,-40 -12,-32 -6,-34 C-14,-60 -8,-82 0,-100 Z";

/** Percorsi delle due serpentine nel disegno del boiler (integrazione in alto, solare in basso). */
const COIL_INTEGRATION = "M238 200 H398 M398 200 q14 12 0 24 H238 q-14 12 0 24 H398 q14 12 0 24 H238";
const COIL_SOLAR = "M238 560 H398 M398 560 q14 12 0 24 H238 q-14 12 0 24 H398 q14 12 0 24 H238 q-14 12 0 24 H398";

const HOPPER_FILL: Record<string, string> = {
  ok: "#15803d",
  riserva: "#d97706",
  vuoto: "#dc2626",
  aperto: "#2563eb",
  nd: "#475569",
};

const LOOK_LABEL: Record<StoveLook, string> = {
  off: "spenta",
  wait: "in attesa",
  start: "accensione",
  work: "in lavoro",
  standby: "stand-by",
  stopping: "spegnimento",
};

export class ImpiantoOverviewCard extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @state() private _config!: PlantCardConfig;
  @state() private _narrow = false;
  @state() private _compact = false;
  @state() private _armed = false;
  private _width = 1000;
  private _onResize = () => this._updateCompact();
  private _armTimer?: number;
  private _ro?: ResizeObserver;
  private _dialog?: ImpiantoSettingsDialog;
  private _info?: ImpiantoInfoDialog;
  private _charts?: ImpiantoChartsDialog;

  connectedCallback(): void {
    super.connectedCallback();
    // su schermi stretti (telefono) lo schema del boiler perde il puffer per restare leggibile
    this._ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 1000;
      this._width = w;
      const narrow = w < 560;
      if (narrow !== this._narrow) this._narrow = narrow;
      this._updateCompact();
    });
    this._ro.observe(this);
    window.addEventListener("resize", this._onResize);
  }

  /** Compatta se richiesto, oppure (auto) quando c'è spazio in larghezza ma lo schermo è basso. */
  private _updateCompact(): void {
    const opt = this._config?.compact ?? "auto";
    const compact = opt === true || (opt === "auto" && this._width >= 900 && window.innerHeight < 850);
    if (compact !== this._compact) this._compact = compact;
  }

  /** Apre la finestra delle preferenze (si aggiunge alla pagina, non sta dentro la scheda). */
  private _openSettings(): void {
    if (this._dialog) return;
    const d = document.createElement("impianto-settings-dialog") as ImpiantoSettingsDialog;
    d.hass = this.hass;
    d.addEventListener("closed", () => {
      this._dialog = undefined;
    });
    document.body.appendChild(d);
    this._dialog = d;
  }

  protected updated(changed: Map<string, unknown>): void {
    // la finestra aperta segue gli stati di Home Assistant (interruttori e numeri si aggiornano subito)
    if (changed.has("hass") && this._dialog) this._dialog.hass = this.hass;
    if (changed.has("hass") && this._info) this._info.lines = this._summaryLines();
    if (changed.has("hass") && this._charts) this._charts.hass = this.hass;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._dialog?.remove();
    this._dialog = undefined;
    this._info?.remove();
    this._info = undefined;
    this._charts?.remove();
    this._charts = undefined;
    this._ro?.disconnect();
    window.removeEventListener("resize", this._onResize);
    if (this._armTimer) window.clearTimeout(this._armTimer);
  }

  /** Primo tocco = conferma richiesta (4 secondi), secondo tocco = esegue. */
  private _press(): void {
    const model = boostButton(this._s(this._e.boost_state), this._armed);
    if (model.action === "none") return;
    if (!this._armed) {
      this._armed = true;
      this._armTimer = window.setTimeout(() => (this._armed = false), 4000);
      return;
    }
    this._armed = false;
    if (this._armTimer) window.clearTimeout(this._armTimer);
    const script = model.action === "go" ? this._e.boost_start_script : this._e.boost_cancel_script;
    void this.hass.callService("script", "turn_on", { entity_id: script });
  }

  setConfig(config: PlantCardConfig): void {
    if (!config || typeof config !== "object") throw new Error("impianto-overview-card: configurazione non valida");
    this._config = config;
    this._updateCompact();
  }

  getCardSize(): number {
    return 12;
  }

  static getStubConfig(): PlantCardConfig {
    return { type: `custom:${CARD_TAG}` };
  }

  // ---- lettura -------------------------------------------------------------

  private get _e(): PlantEntities {
    return { ...DEFAULT_ENTITIES, ...(this._config.entities ?? {}) };
  }

  private _s(id: string | undefined): string | undefined {
    return id ? this.hass.states[id]?.state : undefined;
  }

  private _n(id: string | undefined): number | null {
    if (!id) return null;
    const st = this.hass.states[id];
    if (!st) return null;
    if (id.startsWith("climate.")) return toNumber(String(st.attributes.temperature ?? ""));
    return toNumber(st.state);
  }

  private _val(v: NumOrEntity | undefined, fallbackEntity?: string): number | null {
    if (typeof v === "number") return v;
    if (typeof v === "string") return this._n(v);
    return fallbackEntity ? this._n(fallbackEntity) : null;
  }

  private _model(): BoilerModel {
    const m = this._config.model ?? {};
    const vol = this._val(m.volume, DEFAULT_MODEL_ENTITIES.volume);
    let share = this._val(m.top_share, DEFAULT_MODEL_ENTITIES.top_share);
    if (share !== null && share > 1) share = share / 100;
    return {
      volume: vol ?? DEFAULT_MODEL.volume,
      topShare: share ?? DEFAULT_MODEL.topShare,
      mainsTemp: this._val(m.mains_temp, DEFAULT_MODEL_ENTITIES.mains_temp) ?? DEFAULT_MODEL.mainsTemp,
      showerVolume: this._val(m.shower_volume) ?? DEFAULT_MODEL.showerVolume,
      showerTemp: this._val(m.shower_temp) ?? DEFAULT_MODEL.showerTemp,
    };
  }

  private _yes(id: string): boolean | null {
    const s = this._s(id);
    return s === "on" ? true : s === "off" ? false : null;
  }

  // ---- boiler solare + puffer (SVG) ---------------------------------------

  private _renderBoiler() {
    const e = this._e;
    const m = this._model();
    const top = this._n(e.boiler_top);
    const bottom = this._n(e.boiler_bottom);
    const outlet = this._n(e.outlet) ?? top;
    const showers = showersEstimate(top, bottom, m);
    const pufferId = this.hass.states[e.puffer_effective] ? e.puffer_effective : e.puffer;
    const puffer = this._n(pufferId);
    const pufferEstimated = this.hass.states[pufferId]?.attributes?.fonte === "sonda ingresso";
    const solarKw = this._n(e.solar_power);
    const collector = this._n(e.collector_temp);
    const cTop = tempColor(top);
    const cBot = tempColor(bottom);
    const cMid = tempColor(top !== null && bottom !== null ? m.topShare * top + (1 - m.topShare) * bottom : top ?? bottom);
    const cPuf = tempColor(puffer);
    const midAt = `${Math.round(m.topShare * 100)}%`;
    const eta = this._n(e.eta);
    const integrationPill = integrationPumpPill(
      this._yes(e.integration_pump),
      this._yes(e.integration_call),
      this._yes(e.integration_block_enabled),
      this._yes(e.integration_block_wanted),
      this._n(e.integration_power),
    );
    const collectorPill = collectorPumpPill(this._yes(e.collector_pump), this._n(e.collector_power));
    const pumpOn = integrationPill.key === "running";
    const collectorOn = collectorPill.key === "running";
    const panel = panelModel(
      this._yes(e.collector_pump),
      this._n(e.coil_solar_in),
      collector,
      this._n(e.panel_max),
      this._n(e.panel_max_today),
    );
    const panelFill = panelColor(panel.value);
    const solarIn = this._n(e.coil_solar_in);
    const solarOut = this._n(e.coil_solar_out);
    const integIn = this._n(e.coil_integ_in);
    const integOut = this._n(e.coil_integ_out);
    const btn = boostButton(this._s(e.boost_state), this._armed);

    return html`
      <svg class=${this._narrow ? "boiler narrow" : "boiler"} viewBox=${this._narrow ? "0 0 640 840" : this._compact ? "0 66 700 762" : "0 0 700 840"} role="img" aria-label="Boiler solare">
        <defs>
          <linearGradient id="acqua" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color=${cTop} />
            <stop offset=${midAt} stop-color=${cMid} />
            <stop offset="1" stop-color=${cBot} />
          </linearGradient>
          <linearGradient id="puffer" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color=${cPuf} />
            <stop offset="1" stop-color=${tempColor(puffer !== null ? puffer - 12 : null)} />
          </linearGradient>
          <linearGradient id="iso" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" style="stop-color:var(--divider-color)" />
            <stop offset="0.5" style="stop-color:var(--secondary-background-color)" />
            <stop offset="1" style="stop-color:var(--divider-color)" />
          </linearGradient>
          <linearGradient id="lucido" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#fff" stop-opacity="0.28" />
            <stop offset="0.35" stop-color="#fff" stop-opacity="0" />
          </linearGradient>
        </defs>

        <!-- tubi -->
        <path d="M420 135 H520 V95" class="pipe hot" />
        <path d="M420 745 H520 V775" class="pipe cold" />
        <g class="pufgroup">
          <path d="M440 208 H575" class="pipe hot thin" />
          <path d="M440 268 H520 V315 H575" class="pipe warm thin" />
          <path d="M685 215 H700" class="pipe hot thin" />
          <path d="M685 300 H700" class="pipe warm thin" />
          <text x="452" y="198" class="tv">${integIn !== null ? `${fmt(integIn, 1)} °C` : ""}</text>
          <text x="452" y="260" class="tv">${integOut !== null ? `${fmt(integOut, 1)} °C` : ""}</text>
        </g>

        <!-- boiler -->
        <rect x="200" y="100" width="240" height="660" rx="52" fill="url(#iso)" class="outline" />
        <rect x="222" y="122" width="196" height="616" rx="38" fill="url(#acqua)" />
        <g class="coil">
          <path d=${COIL_INTEGRATION} stroke="#7c3aed" />
          <path d=${COIL_SOLAR} stroke="#15803d" />
        </g>
        ${pumpOn ? svg`<path d=${COIL_INTEGRATION} class="coilflow" />` : nothing}
        ${collectorOn ? svg`<path d=${COIL_SOLAR} class="coilflow" />` : nothing}
        <rect x="246" y="150" width="160" height="26" rx="13" class="pill" />
        <text x="326" y="168" class="s14 b" text-anchor="middle" fill="#a78bfa">Integrazione (caldaia)</text>
        ${integrationPill.key === "idle"
          ? nothing
          : svg`<rect x="244" y="284" width="164" height="22" rx="11" class="pill" /><circle cx="260" cy="295" r="4.5" fill=${integrationPill.key === "blocked" ? "#f59e0b" : "#22c55e"} class=${integrationPill.key === "blocked" ? "" : "pulse"} /><text x="336" y="299.5" class="s13 b" text-anchor="middle" fill=${integrationPill.key === "blocked" ? "#f59e0b" : "#22c55e"}>${integrationPill.label}</text>`}
        ${collectorOn
          ? svg`<rect x="250" y="676" width="152" height="22" rx="11" class="pill" /><circle cx="266" cy="687" r="4.5" fill="#22c55e" class="pulse" /><text x="334" y="691.5" class="s13 b" text-anchor="middle" fill="#22c55e">${collectorPill.label}</text>`
          : nothing}
        <rect x="266" y="522" width="120" height="26" rx="13" class="pill" />
        <text x="326" y="540" class="s14 b" text-anchor="middle" fill="#4ade80">Solare</text>
        <rect x="222" y="122" width="196" height="616" rx="38" fill="url(#lucido)" />

        <!-- scheda centrale -->
        <rect x="236" y="338" width="168" height="176" rx="22" class="pill big" />
        <text x="320" y="372" class="t2 s14" text-anchor="middle">Uscita acqua calda</text>
        <text x="320" y="434" class="t1 b" font-size="50" text-anchor="middle">${fmt(outlet, 1)}<tspan font-size="24" dy="-16"> °C</tspan></text>
        <line x1="262" y1="456" x2="378" y2="456" class="sep" />
        <text x="320" y="490" class="t1 b" font-size="22" text-anchor="middle">${showers === null ? "(–)" : `(≈ ${showers} ${showers === 1 ? "doccia" : "docce"})`}</text>

        <!-- sonde -->
        <circle cx="222" cy="168" r="8" class="probe" />
        <line x1="214" y1="168" x2="150" y2="168" class="lead" />
        <rect x="14" y="132" width="136" height="72" rx="14" class="card hi" />
        <text x="82" y="156" class="t2 s14" text-anchor="middle">Alto (S3)</text>
        <text x="82" y="190" class="b" font-size="27" text-anchor="middle" fill="#ef4444">${fmt(top, 1)} °C</text>

        <circle cx="222" cy="676" r="8" class="probe" />
        <line x1="214" y1="676" x2="150" y2="676" class="lead" />
        <rect x="14" y="640" width="136" height="72" rx="14" class="card lo" />
        <text x="82" y="664" class="t2 s14" text-anchor="middle">Basso (S2)</text>
        <text x="82" y="698" class="b" font-size="27" text-anchor="middle" fill="#3b82f6">${fmt(bottom, 1)} °C</text>

        <!-- stima e pulsante -->
        <rect x="14" y="224" width="136" height="104" rx="14" class="card eta" />
        <text x="82" y="248" class="t2 s14" text-anchor="middle">Acqua pronta in</text>
        <text x="82" y="292" class="t1 b" font-size="34" text-anchor="middle">${etaText(eta)}</text>
        <text x="82" y="314" class="t2 s13" text-anchor="middle">${eta === 0 ? "già a temperatura" : eta === null ? "" : "stima media"}</text>
        <g class=${btn.action === "none" ? "btn off" : this._armed ? "btn armed" : "btn"} role="button" tabindex=${btn.action === "none" ? "-1" : "0"}
          aria-label=${btn.label} @click=${() => this._press()} @keydown=${(ev: KeyboardEvent) => (ev.key === "Enter" || ev.key === " ") && this._press()}>
          <rect x="14" y="340" width="136" height="${btn.sub ? 78 : 64}" rx="14" class="btnbg" />
          <text x="82" y=${btn.sub ? 372 : 380} class="b" font-size="18" text-anchor="middle">${btn.label}</text>
          ${btn.sub ? svg`<text x="82" y="396" class="s13" text-anchor="middle" opacity="0.85">${btn.sub}</text>` : nothing}
        </g>
        ${this._config.summary === false
          ? nothing
          : svg`<g class="btn info" role="button" tabindex="0" aria-label="Stato dell'impianto" @click=${() => this._openInfo()}
              @keydown=${(ev: KeyboardEvent) => (ev.key === "Enter" || ev.key === " ") && this._openInfo()}>
              <rect x="14" y=${(btn.sub ? 340 + 78 : 340 + 64) + 12} width="136" height="44" rx="14" class="infobg" />
              <circle cx="40" cy=${(btn.sub ? 340 + 78 : 340 + 64) + 34} r="10" class="infoc" />
              <text x="40" y=${(btn.sub ? 340 + 78 : 340 + 64) + 39} class="b" font-size="14" text-anchor="middle">i</text>
              <text x="92" y=${(btn.sub ? 340 + 78 : 340 + 64) + 40} class="b" font-size="17" text-anchor="middle">Stato</text>
            </g>`}
        ${this._config.charts === false
          ? nothing
          : svg`<g class="btn info" role="button" tabindex="0" aria-label="Grafici" @click=${() => this._openCharts()}
              @keydown=${(ev: KeyboardEvent) => (ev.key === "Enter" || ev.key === " ") && this._openCharts()}>
              <rect x="14" y=${(btn.sub ? 340 + 78 : 340 + 64) + 66} width="136" height="44" rx="14" class="infobg" />
              <polyline points="28,${(btn.sub ? 340 + 78 : 340 + 64) + 98} 35,${(btn.sub ? 340 + 78 : 340 + 64) + 88} 41,${(btn.sub ? 340 + 78 : 340 + 64) + 94} 51,${(btn.sub ? 340 + 78 : 340 + 64) + 80}" class="infoc" />
              <text x="102" y=${(btn.sub ? 340 + 78 : 340 + 64) + 94} class="b" font-size="17" text-anchor="middle">Grafici</text>
            </g>`}

        <!-- solare -->
        <rect x="14" y="728" width="136" height="72" rx="14" class="card sun" />
        <text x="82" y="752" class="t2 s14" text-anchor="middle">Solare</text>
        <text x="82" y="786" class="b" font-size="24" text-anchor="middle" fill="#22c55e">${fmt(solarKw, 1)} kW</text>

        <text x="532" y="80" class="b s14" fill="#ef4444">Acqua calda</text>
        <text x="532" y="98" class="t2 s13">verso utenze</text>
        <text x="532" y="796" class="b s14" fill="#3b82f6">Acqua fredda</text>
        <text x="532" y="814" class="t2 s13">dalla rete</text>

        <g class="pufgroup">${this._pufferShape(puffer, pufferEstimated)}</g>

        <!-- pannello solare e circuito del collettore -->
        <g class="pufgroup pannello">
          <path d="M598 500 H520 V560 H440" class="pipe hot thin" />
          <path d="M440 656 H548 V552 H598" class="pipe cold thin" />
          ${collectorOn
            ? svg`<path d="M598 500 H520 V560 H440" class="coilflow" /><path d="M440 656 H548 V552 H598" class="coilflow" />`
            : nothing}
          <text x="448" y="548" class="tv">${solarIn !== null ? `${fmt(solarIn, 1)} °C` : ""}</text>
          <text x="448" y="644" class="tv">${solarOut !== null ? `${fmt(solarOut, 1)} °C` : ""}</text>
          ${this._panelShape(panel, panelFill)}
        </g>
      </svg>
      ${this._narrow
        ? svg`<svg class="boiler mini" viewBox="0 0 640 330" role="img" aria-label="Puffer e pannello solare">
            <g transform="translate(-480 -140)">${this._pufferShape(puffer, pufferEstimated)}</g>
            <text x="150" y="236" class="tv">${integIn !== null ? `→ ${fmt(integIn, 1)} °C` : ""}</text>
            <text x="150" y="266" class="tv">${integOut !== null ? `← ${fmt(integOut, 1)} °C` : ""}</text>
            <g transform="translate(-160 -420)">${this._panelShape(panel, panelFill)}</g>
            <text x="470" y="318" class="tv" text-anchor="middle">${solarIn !== null ? `→ ${fmt(solarIn, 1)} °C` : ""}   ${solarOut !== null ? `← ${fmt(solarOut, 1)} °C` : ""}</text>
          </svg>`
        : nothing}
    `;
  }

  /** Il puffer da 50 litri, con le coordinate del disegno largo (al centro x = 630). */
  private _pufferShape(puffer: number | null, estimated = false) {
    return svg`
      <text x="630" y="158" class="t1 b s15" text-anchor="middle">Puffer 50 L</text>
      <rect x="575" y="170" width="110" height="170" rx="26" fill="url(#puffer)" class="outline" />
      <rect x="587" y="224" width="86" height="64" rx="14" class="pill big" />
      <text x="630" y="${estimated ? 258 : 264}" class="t1 b val" text-anchor="middle">${fmt(puffer, 0)} °C</text>
      ${estimated ? svg`<text x="630" y="279" class="t2 s13" text-anchor="middle">stima sonda</text>` : nothing}`;
  }

  /** La sagoma del pannello con i suoi testi, con le coordinate del disegno largo (al centro x = 630). */
  private _panelShape(panel: PanelModel, fill: string) {
    return svg`
      <text x="630" y="440" class="t1 b s16" text-anchor="middle">Pannello solare</text>
      <polygon points="616,462 692,462 676,568 592,568" fill=${fill} class="outline panelbody" />
      <g class="panelgrid">
        <line x1="641" y1="462" x2="634" y2="568" /><line x1="667" y1="462" x2="655" y2="568" />
        <line x1="604" y1="515" x2="684" y2="515" /><line x1="610" y1="541" x2="680" y2="541" /><line x1="610" y1="489" x2="688" y2="489" />
      </g>
      <polygon points="616,462 640,462 612,568 592,568" fill="#fff" opacity="0.16" />
      <line x1="618" y1="568" x2="612" y2="586" class="panelleg" /><line x1="666" y1="568" x2="672" y2="586" class="panelleg" />
      <text x="630" y="618" class="t1 b val" text-anchor="middle">${panel.value === null ? "–" : `${fmt(panel.value, 0)} °C`}</text>
      <text x="630" y="640" class="t2 s15" text-anchor="middle">${panel.caption}</text>
      ${panel.maxPredicted !== null
        ? svg`<text x="630" y="668" class="b s15" text-anchor="middle" fill="#f59e0b">max prevista ${fmt(panel.maxPredicted, 0)} °C</text>`
        : nothing}
      ${panel.maxToday !== null
        ? svg`<text x="630" y="690" class="t2 s15" text-anchor="middle">raggiunta oggi ${fmt(panel.maxToday, 0)} °C</text>`
        : nothing}`;
  }

  // ---- caldaia -----------------------------------------------------------

  private _flame(cx: number, cy: number, k: number, opacity = 1) {
    return svg`<g transform="translate(${cx},${cy}) scale(${k})" opacity=${opacity}>
      <path d=${FLAME_PATH} fill="url(#fiamma)" />
      <path d=${FLAME_PATH} fill="#fde047" transform="translate(0,6) scale(0.52)" />
    </g>`;
  }

  private _renderStoveImage(look: StoveLook, pellet: ReturnType<typeof pelletStatus>) {
    const flame =
      look === "work"
        ? this._flame(90, 168, 1.0)
        : look === "start"
          ? this._flame(90, 168, 0.4)
          : look === "stopping"
            ? this._flame(90, 168, 0.22, 0.55)
            : nothing;
    const glow = look === "work" ? 0.55 : look === "start" ? 0.3 : 0;
    return html`
      <svg class="stoveimg ${look}" viewBox="0 0 180 250" role="img" aria-label="Caldaia a pellet">
        <defs>
          <linearGradient id="fiamma" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stop-color="#f59e0b" /><stop offset="0.55" stop-color="#f97316" /><stop offset="1" stop-color="#dc2626" />
          </linearGradient>
          <linearGradient id="vetro" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#05080f" /><stop offset="1" stop-color="#1e293b" /></linearGradient>
          <radialGradient id="bagliore" cx="0.5" cy="0.85" r="0.6">
            <stop offset="0" stop-color="#f97316" stop-opacity=${glow} /><stop offset="1" stop-color="#f97316" stop-opacity="0" />
          </radialGradient>
        </defs>
        <rect x="20" y="4" width="140" height="26" rx="6" fill=${HOPPER_FILL[pellet.key]} />
        <text x="90" y="22" font-size="12" font-weight="700" text-anchor="middle" fill="#ffffff">${pellet.key === "nd" ? "pellet" : `pellet ${pellet.label.toLowerCase()}`}</text>
        <rect x="0" y="30" width="180" height="214" rx="16" fill="#1f2937" stroke="#64748b" stroke-width="2" />
        <rect x="20" y="52" width="140" height="130" rx="12" fill="url(#vetro)" stroke="#94a3b8" stroke-width="3" />
        <rect x="20" y="52" width="140" height="130" rx="12" fill="url(#bagliore)" />
        <g class="flicker">${flame}</g>
        <rect x="20" y="190" width="140" height="8" rx="4" fill="#374151" />
        <circle cx="22" cy="222" r="5" fill="#64748b" /><circle cx="42" cy="222" r="5" fill="#64748b" />
      </svg>
    `;
  }

  private _legendFlame(k: number) {
    return html`<svg viewBox="-30 -40 60 60" class="lg"><g transform="scale(${k})"><path d=${FLAME_PATH} fill="url(#fiamma)" /><path d=${FLAME_PATH} fill="#fde047" transform="translate(0,6) scale(0.52)" /></g></svg>`;
  }

  private _tile(label: string, value: string, color?: string) {
    return html`<div class="tile"><span class="tl">${label}</span><span class="tv" style=${color ? `color:${color}` : ""}>${value}</span></div>`;
  }

  private _chip(label: string, v: boolean | null) {
    return html`<div class="chip ${v ? "yes" : ""}"><span>${label}</span><b>${v === null ? "–" : v ? "SÌ" : "NO"}</b></div>`;
  }

  private _toggleGuard(): void {
    void this.hass.callService("input_boolean", "toggle", { entity_id: this._e.guard });
  }

  private _renderGuard() {
    const e = this._e;
    if (!this.hass.states[e.guard]) return nothing;
    const on = this._s(e.guard) === "on";
    const flagged = this._s(e.guard_flag) === "on";
    return html`
      <button class="guard ${on ? "on" : "off"}" @click=${() => this._toggleGuard()} aria-pressed=${on}>
        <span class="gtxt">
          <b>Evita partenze inutili</b>
          <small>${on ? (flagged ? "ha annullato una partenza, resta in guardia" : "attiva: annulla le partenze con puffer e boiler già caldi") : "disattivata: i programmi partono sempre"}</small>
        </span>
        <span class="gsw"><i></i></span>
      </button>
    `;
  }

  /** Stima del consumo di pellet: oggi, settimana, mese. Non compare se i sensori non esistono. */
  private _renderPelletUse() {
    const e = this._e;
    const known = [e.pellet_today, e.pellet_week, e.pellet_month].some((id) => this.hass.states[id]);
    if (!known) return nothing;
    return html`
      <div class="counters" title="Stima dal modello di consumo: si tara con il fattore nelle preferenze">
        <span class="tl">Pellet (stima)</span>
        <div>
          <b>${fmt(this._n(e.pellet_today), 1)} kg oggi</b>
          <b>${fmt(this._n(e.pellet_week), 1)} kg settimana</b>
          <b>${fmt(this._n(e.pellet_month), 0)} kg mese</b>
        </div>
      </div>
    `;
  }

  private _renderStove() {
    const e = this._e;
    const stateRaw = this._s(e.stove_state);
    const look = stoveLook(stateRaw);
    const changed = this.hass.states[e.stove_state]?.last_changed;
    const since = changed ? new Date(changed).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }) : null;
    const alarmRaw = (this._s(e.alarm) ?? "").trim();
    const noAlarm = alarmRaw === "" || /^[_\-\s0]+$/.test(alarmRaw) || alarmRaw.toLowerCase() === "unknown";
    const pump = this._s(e.pump);
    const pumpOn = pump !== undefined && pump !== "OFF" && pump !== "unknown" && pump !== "unavailable";
    const work = this._n(e.work_hours_today);
    const pellet = pelletStatus(this._yes(e.pellet_reserve), this._yes(e.pellet_empty), this._yes(e.pellet_open));

    return html`
      <section class="stove">
        <h3>Caldaia a pellet (Polygon)</h3>
        <div class="top">
          ${this._renderStoveImage(look, pellet)}
          <div class="statecard">
            <span class="tl">Stato caldaia</span>
            <span class="statepill ${look}">${stateRaw ?? "–"}</span>
            <span class="tl">Acqua caldaia</span>
            <span class="water">${fmt(this._n(e.stove_water), 1)}<small> °C</small></span>
            <span class="tl">Ultimo cambio stato</span>
            <span class="since">${since ? `alle ${since}` : "–"}</span>
            <span class="tl">Pellet</span>
            <span class="pelletpill ${pellet.key}">${pellet.label}</span>
          </div>
        </div>
        <div class="legendbar">
          <div><span class="dot"></span><b>Senza fiamma</b><small>ECO STOP / OFF</small></div>
          <div>${this._legendFlame(0.38)}<b class="amber">Accensione</b><small>START</small></div>
          <div>${this._legendFlame(0.62)}<b class="red">In lavoro</b><small>WORK</small></div>
        </div>
        <div class="tiles">
          ${this._tile("Puffer 50 L", `${fmt(this._n(this.hass.states[e.puffer_effective] ? e.puffer_effective : e.puffer), 1)} °C${this.hass.states[e.puffer_effective]?.attributes?.fonte === "sonda ingresso" ? " (stima)" : ""}`, "#f59e0b")}
          ${this._tile("Set boiler", `${fmt(this._n(e.set_boiler), 0)} °C`)}
          ${this._tile("Set acqua", `${fmt(this._n(e.set_water), 0)} °C`)}
          ${this._tile("Fumi", `${fmt(this._n(e.smoke), 0)} °C`)}
          ${this._tile("Fiamma", `${fmt(this._n(e.flame), 0)} °C`)}
          ${this._tile("Potenza reale", `${fmt(this._n(e.power), 0)} %`)}
          ${this._tile("Pressione acqua", `${fmt(this._n(e.water_pressure), 1)} bar`)}
          ${this._tile("Pressione braciere", fmt(this._n(e.brazier_pressure), 1))}
          ${this._tile("Estrattore fumi", `${fmt(this._n(e.extractor), 0)} giri`)}
          ${this._tile("Circolatore", pump === undefined ? "–" : pumpOn ? "ON" : "OFF", pumpOn ? "#22c55e" : undefined)}
          ${this._tile("Accensioni ieri", fmt(this._n(e.starts_yesterday), 0))}
          ${this._tile("Allarme", noAlarm ? "nessuno" : alarmRaw, noAlarm ? "#22c55e" : "#ef4444")}
        </div>
        <div class="counters">
          <span class="tl">Oggi</span>
          <div>
            <b>${fmt(this._n(e.starts_today), 0)} accensioni</b>
            <b>${fmt(work, 1)} h in lavoro</b>
            <b>${fmt(this._n(e.standby_today), 0)} stand-by</b>
          </div>
        </div>
        ${this._renderPelletUse()}
        <div class="chips">
          ${this._chip("Richiesta ACS", this._yes(e.request_acs))} ${this._chip("Riscaldamento", this._yes(e.request_heating))}
          ${this._chip("Consenso suggerito", this._yes(e.consent))}
        </div>
        ${this._renderGuard()}
        <p class="look">${LOOK_LABEL[look]}</p>
      </section>
    `;
  }

  /** Le righe della finestra "Stato": poche frasi sul momento dell'impianto. */
  private _summaryLines(): SummaryLine[] {
    const e = this._e;
    const alarmRaw = (this._s(e.alarm) ?? "").trim();
    const noAlarm = alarmRaw === "" || /^[_\-\s0]+$/.test(alarmRaw) || alarmRaw.toLowerCase() === "unknown" || alarmRaw.toLowerCase() === "unavailable";
    const pufferId = this.hass.states[e.puffer_effective] ? e.puffer_effective : e.puffer;
    const awaySince = this.hass.states[e.away]?.last_changed;
    const pill = integrationPumpPill(
      this._yes(e.integration_pump),
      this._yes(e.integration_call),
      this._yes(e.integration_block_enabled),
      this._yes(e.integration_block_wanted),
      this._n(e.integration_power),
    );
    const eta = this.hass.states[e.eta] ? this._n(e.eta) : null;
    return summarize({
      stoveState: this._s(e.stove_state),
      alarm: noAlarm ? null : alarmRaw,
      power: this._n(e.power),
      setWater: this._n(e.set_water),
      setBoiler: this._n(e.set_boiler),
      puffer: this._n(pufferId),
      pufferEstimated: this.hass.states[pufferId]?.attributes?.fonte === "sonda ingresso",
      boilerTop: this._n(e.boiler_top),
      collector: this._n(e.collector_temp),
      integrationPump: pill.key,
      collectorPumpOn: this._yes(e.collector_pump),
      etaMinutes: eta,
      cronoOn: this._yes(e.crono_master),
      programActive: this._yes(e.program_active),
      guardFlag: this._yes(e.guard_flag),
      boostActive: this._s(e.boost_state) === "attiva",
      nobodyHome: this._yes(e.away),
      nobodyHomeMinutes: awaySince ? Math.max(0, (Date.now() - new Date(awaySince).getTime()) / 60000) : null,
      awayEnabled: this._yes(e.away_enabled),
      awayFlag: this._yes(e.away_flag),
      guests: this._yes(e.away_guests),
      awayMinutes: this._n(e.away_minutes),
      pelletEmpty: this._yes(e.pellet_empty),
      pelletReserve: this._yes(e.pellet_reserve),
    });
  }

  /** Apre la finestra "Grafici" (storico dei valori principali). */
  private _openCharts(): void {
    if (this._charts) return;
    const d = document.createElement("impianto-charts-dialog") as ImpiantoChartsDialog;
    d.hass = this.hass;
    d.entities = this._e;
    d.addEventListener("closed", () => {
      this._charts = undefined;
    });
    document.body.appendChild(d);
    this._charts = d;
  }

  /** Apre la finestra "Stato" (si aggiunge alla pagina, come quella delle preferenze). */
  private _openInfo(): void {
    if (this._info) return;
    const d = document.createElement("impianto-info-dialog") as ImpiantoInfoDialog;
    d.lines = this._summaryLines();
    d.addEventListener("closed", () => {
      this._info = undefined;
    });
    document.body.appendChild(d);
    this._info = d;
  }

  render() {
    if (!this._config || !this.hass) return nothing;
    return html`
      <ha-card>
        ${this._config.settings === false
          ? nothing
          : html`<button class="gear" title="Preferenze impianto" aria-label="Preferenze impianto" @click=${() => this._openSettings()}>
              <ha-icon icon="mdi:cog-outline"></ha-icon>
            </button>`}
        ${this._config.title ? html`<div class="ctitle">${this._config.title}</div>` : nothing}
        <div class=${this._compact ? "layout compact" : "layout"}>${this._renderBoiler()} ${this._renderStove()}</div>
      </ha-card>
    `;
  }

  static styles = css`
    :host {
      display: block;
      container-type: inline-size;
    }
    ha-card {
      padding: 12px;
      color: var(--primary-text-color);
      position: relative;
    }
    .gear {
      position: absolute;
      top: 8px;
      right: 8px;
      z-index: 2;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: transparent;
      color: var(--secondary-text-color);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .gear:hover {
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
    }
    .ctitle {
      font-size: 20px;
      font-weight: 700;
      margin: 4px 4px 8px;
    }
    .layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
      align-items: start;
    }
    @container (min-width: 900px) {
      .layout {
        grid-template-columns: 7fr 6fr;
      }
    }
    svg.boiler {
      width: 100%;
      height: auto;
      display: block;
      max-width: 700px;
      margin: 0 auto;
    }
    svg.narrow .pufgroup {
      display: none;
    }
    svg.narrow .s13 {
      font-size: 15px;
    }
    svg.narrow .s14 {
      font-size: 16px;
    }
    /* testi e forme dell'SVG, colori dal tema di Home Assistant */
    .t1 {
      fill: var(--primary-text-color);
    }
    .t2 {
      fill: var(--secondary-text-color);
    }
    .b {
      font-weight: 700;
    }
    .s13 {
      font-size: 13px;
    }
    .s14 {
      font-size: 14px;
    }
    .s15 {
      font-size: 15px;
    }
    .s16 {
      font-size: 17px;
    }
    .val {
      font-size: 26px;
    }
    .tv {
      font-size: 17px;
      font-weight: 600;
      fill: var(--secondary-text-color);
    }
    /* fascia sotto il boiler su telefono: puffer e pannello con scritte piu' grandi */
    svg.mini {
      margin-top: 4px;
    }
    svg.mini .s15 {
      font-size: 21px;
    }
    svg.mini .s16 {
      font-size: 23px;
    }
    svg.mini .val {
      font-size: 36px;
    }
    svg.mini .tv {
      font-size: 22px;
    }
    .sep {
      stroke: var(--divider-color);
      stroke-width: 2;
    }
    .outline {
      stroke: var(--divider-color);
      stroke-width: 3;
    }
    .pill {
      fill: var(--card-background-color);
      fill-opacity: 0.9;
    }
    .pill.big {
      fill-opacity: 0.94;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25));
    }
    .card {
      fill: var(--secondary-background-color);
      stroke-width: 2;
    }
    .card.hi {
      stroke: #ef4444;
    }
    .card.lo {
      stroke: #3b82f6;
    }
    .card.sun {
      stroke: #22c55e;
    }
    .card.eta {
      stroke: var(--divider-color);
    }
    .btn {
      cursor: pointer;
      outline: none;
    }
    .btn text {
      fill: var(--text-primary-color, #fff);
    }
    .btn .btnbg {
      fill: var(--primary-color, #03a9f4);
    }
    .btn.armed .btnbg {
      fill: #f59e0b;
    }
    .btn:focus-visible .btnbg {
      stroke: var(--primary-text-color);
      stroke-width: 3;
    }
    .btn.off {
      cursor: default;
    }
    .btn.off .btnbg {
      fill: var(--secondary-background-color);
      stroke: var(--divider-color);
      stroke-width: 2;
    }
    .btn.off text {
      fill: var(--secondary-text-color);
    }
    .btn.info .infobg {
      fill: var(--secondary-background-color);
      stroke: var(--divider-color);
      stroke-width: 2;
    }
    .btn.info:hover .infobg {
      stroke: var(--primary-color);
    }
    .btn.info text {
      fill: var(--primary-text-color);
    }
    .btn.info .infoc {
      fill: none;
      stroke: var(--primary-color);
      stroke-width: 2;
    }
    .btn.info text:nth-of-type(1) {
      fill: var(--primary-color);
    }
    .probe {
      fill: var(--card-background-color);
      stroke: var(--primary-text-color);
      stroke-width: 3;
    }
    .lead {
      stroke: var(--secondary-text-color);
      stroke-width: 2;
    }
    .pipe {
      fill: none;
      stroke-width: 10;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .pipe.thin {
      stroke-width: 8;
    }
    /* acqua che scorre dentro la serpentina: tratteggio chiaro che si muove */
    .panelbody {
      stroke-width: 3;
    }
    .panelgrid line {
      stroke: #ffffff;
      stroke-opacity: 0.5;
      stroke-width: 1.5;
    }
    .panelleg {
      stroke: #64748b;
      stroke-width: 4;
      stroke-linecap: round;
    }
    .coilflow {
      fill: none;
      stroke: #ffffff;
      stroke-opacity: 0.9;
      stroke-width: 2.5;
      stroke-linecap: round;
      stroke-dasharray: 5 11;
      animation: coilflow 0.8s linear infinite;
    }
    @keyframes coilflow {
      to {
        stroke-dashoffset: -16;
      }
    }
    .pulse {
      animation: pulse 1.4s ease-in-out infinite;
    }
    @keyframes pulse {
      50% {
        opacity: 0.35;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .coilflow,
      .pulse {
        animation: none;
      }
    }
    .pipe.hot {
      stroke: #dc2626;
    }
    .pipe.warm {
      stroke: #f97316;
    }
    .pipe.cold {
      stroke: #2563eb;
    }
    .coil {
      fill: none;
      stroke-width: 5;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-opacity: 0.9;
    }
    /* pannello caldaia */
    .stove {
      background: var(--secondary-background-color);
      border-radius: 20px;
      padding: 14px;
      border: 1px solid var(--divider-color);
    }
    .stove h3 {
      margin: 0 0 12px;
      text-align: center;
      font-size: 17px;
    }
    .top {
      display: grid;
      grid-template-columns: minmax(120px, 1fr) minmax(150px, 1fr);
      gap: 12px;
    }
    .stoveimg {
      width: 100%;
      max-width: 200px;
      height: auto;
      justify-self: center;
    }
    .flicker {
      transform-origin: 90px 168px;
    }
    .stoveimg.work .flicker,
    .stoveimg.start .flicker {
      animation: flicker 1.6s ease-in-out infinite;
    }
    @keyframes flicker {
      0%,
      100% {
        transform: scale(1, 1);
      }
      50% {
        transform: scale(1.03, 1.06);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .stoveimg .flicker {
        animation: none !important;
      }
    }
    .statecard {
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: center;
      justify-content: center;
      background: var(--card-background-color);
      border-radius: 16px;
      padding: 12px;
      text-align: center;
    }
    .tl {
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    .statepill {
      font-weight: 700;
      font-size: 20px;
      border-radius: 20px;
      padding: 4px 18px;
      margin-bottom: 8px;
      background: var(--divider-color);
    }
    .statepill.work {
      background: color-mix(in srgb, #22c55e 28%, transparent);
      color: #22c55e;
    }
    .statepill.start {
      background: color-mix(in srgb, #f59e0b 28%, transparent);
      color: #f59e0b;
    }
    .statepill.standby {
      background: color-mix(in srgb, #ef4444 28%, transparent);
      color: #ef4444;
    }
    .pelletpill {
      font-weight: 700;
      font-size: 15px;
      border-radius: 14px;
      padding: 2px 14px;
      background: var(--divider-color);
    }
    .pelletpill.ok {
      background: color-mix(in srgb, #22c55e 25%, transparent);
      color: #22c55e;
    }
    .pelletpill.riserva {
      background: color-mix(in srgb, #f59e0b 28%, transparent);
      color: #f59e0b;
    }
    .pelletpill.vuoto {
      background: color-mix(in srgb, #ef4444 28%, transparent);
      color: #ef4444;
    }
    .pelletpill.aperto {
      background: color-mix(in srgb, #3b82f6 28%, transparent);
      color: #3b82f6;
    }
    .water {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .water small {
      font-size: 16px;
    }
    .since {
      font-weight: 600;
    }
    .legendbar {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      margin-top: 12px;
      padding: 8px;
      background: var(--card-background-color);
      border-radius: 12px;
      font-size: 12px;
    }
    .legendbar > div {
      display: grid;
      grid-template-columns: 30px 1fr;
      grid-template-rows: auto auto;
      column-gap: 6px;
      align-items: center;
    }
    .legendbar .lg,
    .legendbar .dot {
      grid-row: 1 / span 2;
      width: 28px;
      height: 28px;
    }
    .legendbar .dot {
      border-radius: 50%;
      background: var(--divider-color);
      border: 2px solid var(--secondary-text-color);
      box-sizing: border-box;
    }
    .legendbar small {
      color: var(--secondary-text-color);
      font-size: 11px;
    }
    .legendbar .amber {
      color: #f59e0b;
    }
    .legendbar .red {
      color: #ef4444;
    }
    .tiles {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-top: 12px;
    }
    @container (max-width: 520px) {
      .tiles {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    .tile {
      background: var(--card-background-color);
      border-radius: 10px;
      padding: 8px 10px;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .tv {
      font-size: 18px;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .counters {
      margin-top: 12px;
      padding: 8px 12px;
      border-radius: 10px;
      background: color-mix(in srgb, #f59e0b 14%, transparent);
    }
    .counters > div {
      display: flex;
      flex-wrap: wrap;
      gap: 6px 18px;
      font-size: 15px;
    }
    .chips {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-top: 12px;
    }
    .chip {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 6px 4px;
      border-radius: 18px;
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      font-size: 11px;
      color: var(--secondary-text-color);
      text-align: center;
    }
    .chip b {
      font-size: 14px;
      color: var(--primary-text-color);
    }
    .chip.yes {
      border-color: #22c55e;
    }
    .chip.yes b {
      color: #22c55e;
    }
    .look {
      display: none;
    }
    /* modalità compatta: tutto in una schermata di tablet, senza togliere dati */
    .compact svg.boiler {
      max-height: calc(100vh - 150px);
    }
    .compact .stove {
      padding: 8px 10px;
      border-radius: 16px;
    }
    .compact .stove h3 {
      margin: 0 0 4px;
      font-size: 14px;
    }
    .compact .top {
      grid-template-columns: 92px 1fr;
      gap: 8px;
      align-items: center;
    }
    .compact .stoveimg {
      max-width: 92px;
    }
    /* stato, acqua e ultimo cambio su una riga: tre colonne, etichetta sopra e valore sotto */
    .compact .statecard {
      display: grid;
      grid-auto-flow: column;
      grid-template-rows: auto auto;
      justify-content: space-around;
      align-items: center;
      column-gap: 12px;
      row-gap: 2px;
      padding: 6px 8px;
    }
    .compact .pelletpill {
      font-size: 13px;
      padding: 1px 10px;
    }
    .compact .statecard .tl {
      font-size: 11px;
      text-align: center;
    }
    .compact .statecard > * {
      margin: 0;
      text-align: center;
      justify-self: center;
    }
    .compact .statepill {
      font-size: 15px;
      padding: 2px 12px;
    }
    .compact .water {
      font-size: 22px;
    }
    .compact .since {
      font-size: 13px;
    }
    .compact .legendbar {
      display: none;
    }
    .compact .tiles {
      grid-template-columns: repeat(4, 1fr);
      gap: 4px;
      margin-top: 6px;
    }
    .compact .tile {
      padding: 2px 7px;
      border-radius: 8px;
    }
    .compact .tile .tl {
      font-size: 10.5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .compact .tv {
      font-size: 14px;
    }
    .compact .counters {
      margin-top: 6px;
      padding: 3px 10px;
      display: flex;
      align-items: baseline;
      gap: 10px;
    }
    .compact .counters > div {
      font-size: 13px;
      gap: 2px 14px;
    }
    .compact .chips {
      margin-top: 6px;
      gap: 6px;
    }
    .compact .chip {
      flex-direction: row;
      justify-content: center;
      gap: 6px;
      padding: 2px 4px;
      border-radius: 14px;
    }
    .compact .chip b {
      font-size: 13px;
    }
    .compact .guard {
      margin-top: 6px;
      padding: 4px 12px;
      border-radius: 12px;
    }
    .compact .guard small {
      display: none;
    }
    .guard {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      width: 100%;
      margin-top: 12px;
      padding: 10px 14px;
      border-radius: 14px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font: inherit;
      text-align: left;
      cursor: pointer;
    }
    .guard .gtxt {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .guard small {
      color: var(--secondary-text-color);
      font-size: 12px;
    }
    .guard .gsw {
      flex: none;
      width: 44px;
      height: 24px;
      border-radius: 12px;
      background: var(--disabled-text-color, #9e9e9e);
      position: relative;
      transition: background 0.2s;
    }
    .guard .gsw i {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #fff;
      transition: left 0.2s;
    }
    .guard.on .gsw {
      background: #22c55e;
    }
    .guard.on .gsw i {
      left: 23px;
    }
  `;
}

customElements.define(CARD_TAG, ImpiantoOverviewCard);
