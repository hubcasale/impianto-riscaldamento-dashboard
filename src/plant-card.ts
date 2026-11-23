import { LitElement, html, css, svg, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import type { HomeAssistant } from "./types";
import type { ImpiantoSettingsDialog } from "./settings-dialog";
import "./settings-dialog";
import type { ImpiantoInfoDialog } from "./info-dialog";
import "./info-dialog";
import type { DetailGroup, ImpiantoDetailsDialog } from "./details-dialog";
import "./details-dialog";
import type { ImpiantoChartsDialog } from "./charts-dialog";
import "./charts-dialog";
import "./rooms-card";
import { DEFAULT_ROOMS, normalizeRooms, roomExists } from "./rooms-logic";
import { HOPPER, afterBags, consumptionPerDay, daysLeft, kgAtDepth, remainingKg } from "./hopper-logic";
import { hopperShape } from "./hopper-svg";
import type { ImpiantoPelletDialog, PelletInfo } from "./pellet-dialog";
import "./pellet-dialog";
import type { ImpiantoPelletChartsDialog } from "./pellet-charts-dialog";
import "./pellet-charts-dialog";
import type { ImpiantoCardDialog } from "./card-dialog";
import "./card-dialog";
import type { ImpiantoConfirmDialog } from "./confirm-dialog";
import "./confirm-dialog";
import { SECTION_KEYS, defaultSections, visibleKeys, type SectionKey, type Sections } from "./sections-logic";
import "./card-editor";
import { DEFAULT_ENTITIES, type PlantEntities } from "./plant-entities";
import { summarize, type SummaryLine } from "./summary-logic";
import { tintColor } from "./color-logic";
import { CLESS_MASK, CLESS_RENDER } from "./cless-render";
import { DEFAULT_MODEL, SEASON_LABEL, seasonKey, boostButton, collectorPumpPill, etaText, fmt, integrationPumpPill, panelColor, panelModel, pelletStatus, showersEstimate, showersFromZones, sinceText, stoveLook, stovePumpRunning, stufaButton, stufaKey, STUFA_LABEL, STUFA_MODE_LABEL, tempColor, toNumber, type BoilerModel, type PanelModel, type StoveLook } from "./plant-logic";

const CARD_TAG = "impianto-overview-card";

/** Quello che serve dell'integrazione stufa_pellet (risposta di stufa_pellet/info). */
interface StufaInfoLite {
  title: string;
  entities: Record<string, string>;
  sources: { power_sensor: string; switch: string | null };
}

export { DEFAULT_ENTITIES, type PlantEntities } from "./plant-entities";

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
  /**
   * "classic" (predefinito): boiler a sinistra, caldaia e termostato a destra.
   * "split" (prova): boiler piu' piccolo a sinistra, caldaia e stufa a pellet affiancate della stessa larghezza a destra,
   * termostato in basso a tutta larghezza e, nella caldaia, il disegno del serbatoio con il pellet rimasto.
   */
  layout?: "classic" | "split";
  /** "short" (prova): boiler con un solo giro per serpentina (nel layout split a schede larghe); predefinito: boiler intero */
  boiler?: "full" | "short";
  /**
   * Colore proprio della scheda: lo sfondo ne prende una tinta e il bordo lo segue, come un blocco colorato della plancia;
   * i pannelli interni restano come sono. Un nome della tavolozza di Home Assistant ("deep-orange", "blue"…) o un colore CSS.
   */
  color?: string;
  /** false per nascondere il pulsante «Programmazione» della scheda della caldaia; un oggetto passa le opzioni alla scheda della programmazione (prefix, master, status, presets) */
  schedule?: boolean | Record<string, unknown>;
  /**
   * Prova: sintesi della stufa a pellet (integrazione stufa_pellet) accanto al termostato, con l'accensione manuale e un
   * pulsante che apre la scheda completa in un popup. `true`, oppure `{ entry_id, title }` se hai più stufe.
   */
  stufa?: boolean | { entry_id?: string; title?: string };
  /**
   * Quali sezioni mostrare (si sceglie dall'editor della scheda): elenco di
   * "boiler", "caldaia", "stufa", "termostato". Se manca, sono tutte visibili.
   */
  show?: SectionKey[];
  /** false per nascondere il termostato ambiente (compare se è installata l'integrazione termostato_riscaldamento); entry_id se hai più termostati */
  thermostat?: boolean | { entry_id?: string; title?: string };
  /**
   * Scheda «Stanze» (temperatura e umidità) accanto al termostato; false per nasconderla.
   * `rooms`: elenco di { name, temperature, humidity, short?, id? } al posto delle stanze di partenza.
   */
  rooms?: boolean | { title?: string; rooms?: unknown; target_entity?: string };
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
  zone_min: "input_number.boiler_solare_t_minima_zona",
};

const FLAME_PATH =
  "M0,-100 C10,-70 45,-50 45,-15 C45,12 25,25 0,25 C-25,25 -45,12 -45,-15 C-45,-32 -35,-45 -25,-58 C-22,-40 -12,-32 -6,-34 C-14,-60 -8,-82 0,-100 Z";

/** Percorsi delle due serpentine nel disegno del boiler (integrazione in alto, solare in basso). */
const COIL_INTEGRATION = "M238 200 H398 M398 200 q14 12 0 24 H238 q-14 12 0 24 H398 q14 12 0 24 H238";
const COIL_SOLAR = "M238 560 H398 M398 560 q14 12 0 24 H238 q-14 12 0 24 H398 q14 12 0 24 H238 q-14 12 0 24 H398";
/** versione corta (layout split): un solo giro per serpentina; la solare parte piu' in alto della differenza di altezza tolta sopra */
const COIL_INTEGRATION_SHORT = "M238 200 H398 M398 200 q14 12 0 24 H238";
const COIL_SOLAR_SHORT = "M238 512 H398 M398 512 q14 12 0 24 H238";
/** quanto si accorcia il boiler: sopra (integrazione 2 corse in meno) e sotto (solare 3 corse in meno) */
const SHORT_D1 = 48;
const SHORT_D2 = 72;

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
  /** scheda larga almeno 1150 px (layout split a colonne) */
  @state() private _wide = false;
  private _confirm?: ImpiantoConfirmDialog;
  private _ro?: ResizeObserver;
  private _dialog?: ImpiantoSettingsDialog;
  private _info?: ImpiantoInfoDialog;
  private _charts?: ImpiantoChartsDialog;
  private _details?: ImpiantoDetailsDialog;
  private _stufaDlg?: ImpiantoCardDialog;
  private _scheduleDlg?: ImpiantoCardDialog;
  private _pelletDlg?: ImpiantoPelletDialog;
  private _pelletChartsDlg?: ImpiantoPelletChartsDialog;
  private _stufaCard?: HTMLElement & { hass: HomeAssistant; setConfig(c: Record<string, unknown>): void };
  private _stufaCardKey = "";
  private _fit = 1;
  private _fitRO?: ResizeObserver;
  private _fitTargets: Element[] = [];
  @state() private _sections: Sections = defaultSections();
  @state() private _stufa: StufaInfoLite | null = null;
  private _stufaLoadedAt = 0;
  private _stufaLoading = false;
  private _thermo?: HTMLElement & { hass: HomeAssistant; setConfig(c: Record<string, unknown>): void };
  private _thermoKey = "";
  private _roomsEl?: HTMLElement & { hass: HomeAssistant; setConfig(c: Record<string, unknown>): void };
  private _roomsKey = "";
  /** passati alcuni secondi dall'avvio: se una scheda collegata non si e' ancora caricata lo si dice (sul tablet non c'e' la console) */
  @state() private _waited = false;
  private _waitTimer?: number;
  private _importTimer?: number;
  /** esito del caricamento diretto dei file delle schede collegate (elemento -> messaggio), mostrato nel segnaposto */
  @state() private _loadInfo: Record<string, string> = {};

  connectedCallback(): void {
    super.connectedCallback();
    // su schermi stretti (telefono) lo schema del boiler perde il puffer per restare leggibile
    this._ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 1000;
      const narrow = w < 560;
      if (narrow !== this._narrow) this._narrow = narrow;
      const wide = w >= 1150;
      if (wide !== this._wide) this._wide = wide;
    });
    this._ro.observe(this);
    // il termostato arriva da un'altra integrazione: se il suo file si carica dopo la scheda, ridisegna
    this._waitTimer = window.setTimeout(() => (this._waited = true), 4000);
    this._importTimer = window.setTimeout(() => void this._loadLinkedCards(), 1500);
    void customElements.whenDefined("termostato-card").then(() => this.requestUpdate());
    // la scheda della stufa arriva anch'essa da un'altra integrazione e puo' caricarsi dopo questa: senza questo la stufa
    // restava assente finche' non si ricaricava la pagina
    void customElements.whenDefined("stufa-pellet-card").then(() => this.requestUpdate());
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

  /** Le sezioni che questa scheda puo' mostrare (la stufa e il termostato dipendono dalla configurazione). */
  private _availableSections(): SectionKey[] {
    return SECTION_KEYS.filter((k) => (k === "stufa" ? !!this._config.stufa : k === "termostato" ? this._config.thermostat !== false : true));
  }

  /** Sezioni della configurazione limitate a quelle disponibili; ne resta sempre almeno una. */
  private _effectiveSections(): Sections {
    const av = this._availableSections();
    const eff = { ...this._sections };
    for (const k of SECTION_KEYS) if (!av.includes(k)) eff[k] = false;
    if (!visibleKeys(eff).length) eff.boiler = true;
    return eff;
  }

  protected updated(changed: Map<string, unknown>): void {
    // la finestra aperta segue gli stati di Home Assistant (interruttori e numeri si aggiornano subito)
    if (changed.has("hass") && this._dialog) this._dialog.hass = this.hass;
    if (changed.has("hass") && this._info) this._info.lines = this._summaryLines();
    if (changed.has("hass") && this._charts) this._charts.hass = this.hass;
    if (changed.has("hass") && this._details) this._details.groups = this._detailGroups();
    if (changed.has("hass") && this._thermo) this._thermo.hass = this.hass;
    if (changed.has("hass") && this._roomsEl) this._roomsEl.hass = this.hass;
    if (changed.has("hass") && this._stufaDlg) this._stufaDlg.hass = this.hass;
    if (changed.has("hass") && this._scheduleDlg) this._scheduleDlg.hass = this.hass;
    if (changed.has("hass") && this._pelletDlg) this._pelletDlg.info = this._pelletInfo();
    if (changed.has("hass") && this._pelletChartsDlg) {
      this._pelletChartsDlg.hass = this.hass;
      this._pelletChartsDlg.perDay = this._pelletPerDay();
    }
    if (this._config?.layout === "split") this._observeFit();
    if (this._config?.stufa && this._sections.stufa && this.hass && !this._stufaLoading && Date.now() - this._stufaLoadedAt > 5 * 60000) void this._loadStufa();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._waitTimer) window.clearTimeout(this._waitTimer);
    if (this._importTimer) window.clearTimeout(this._importTimer);
    this._dialog?.remove();
    this._dialog = undefined;
    this._info?.remove();
    this._info = undefined;
    this._charts?.remove();
    this._charts = undefined;
    this._details?.remove();
    this._details = undefined;
    this._stufaDlg?.remove();
    this._stufaDlg = undefined;
    this._scheduleDlg?.remove();
    this._scheduleDlg = undefined;
    this._pelletDlg?.remove();
    this._pelletChartsDlg?.remove();
    this._pelletChartsDlg = undefined;
    this._pelletDlg = undefined;
    this._fitRO?.disconnect();
    this._fitTargets = [];
    this._confirm?.remove();
    this._confirm = undefined;
    this._ro?.disconnect();
  }

  /** Finestra di conferma: il comando parte solo se la si conferma (un tocco inavvertito non accende niente). */
  private _ask(heading: string, lines: string[], confirmLabel: string, danger: boolean, onYes: () => void): void {
    if (this._confirm) return;
    const d = document.createElement("impianto-confirm-dialog") as ImpiantoConfirmDialog;
    d.heading = heading;
    d.lines = lines;
    d.confirmLabel = confirmLabel;
    d.danger = danger;
    d.addEventListener("confirmed", onYes);
    d.addEventListener("closed", () => {
      this._confirm = undefined;
    });
    document.body.appendChild(d);
    this._confirm = d;
  }

  /** Accensione rapida (o suo annullamento): chiede conferma in una finestra. */
  private _press(): void {
    const model = boostButton(this._s(this._e.boost_state), false);
    if (model.action === "none") return;
    const script = model.action === "go" ? this._e.boost_start_script : this._e.boost_cancel_script;
    const run = () => void this.hass.callService("script", "turn_on", { entity_id: script });
    if (model.action === "go") {
      const eta = this.hass.states[this._e.eta] ? this._n(this._e.eta) : null;
      const lines = ["La caldaia si accende subito, anche fuori programma, e si spegne da sola quando l'acqua è calda."];
      if (eta !== null && eta > 0) lines.push(`Acqua calda stimata tra circa ${etaText(eta)}.`);
      this._ask("Avviare la caldaia?", lines, "Avvia", false, run);
    } else {
      this._ask("Spegnere la caldaia?", ["Annulla l'accensione rapida e spegne la caldaia."], "Spegni", true, run);
    }
  }

  setConfig(config: PlantCardConfig): void {
    if (!config || typeof config !== "object") throw new Error("impianto-overview-card: configurazione non valida");
    this._config = config;
    this._sections = defaultSections(config.show);
    // il colore sta sull'elemento della scheda: vale per tutte le disposizioni senza toccare i modelli
    const tint = tintColor(config.color);
    this.toggleAttribute("tinted", tint !== undefined);
    if (tint !== undefined) this.style.setProperty("--ir-tint", tint);
    else this.style.removeProperty("--ir-tint");
  }

  getCardSize(): number {
    return 12;
  }

  static getStubConfig(): PlantCardConfig {
    return { type: `custom:${CARD_TAG}` };
  }

  /** Editor visuale: cosa mostrare, disposizione e stanze si scelgono da «Modifica scheda». */
  static getConfigElement(): HTMLElement {
    return document.createElement("impianto-overview-card-editor");
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
      // col CLESS le docce si contano sopra la temperatura minima della zona (la serpentina non scende sotto)
      coilMin: this._cless() ? this._val(undefined, DEFAULT_MODEL_ENTITIES.zone_min) ?? 43 : null,
    };
  }

  private _yes(id: string): boolean | null {
    const s = this._s(id);
    return s === "on" ? true : s === "off" ? false : null;
  }

  // ---- boiler solare + puffer (SVG) ---------------------------------------

  private _renderBoiler() {
    const e = this._e;
    const cless = this._cless();
    const m = this._model();
    const top = this._n(e.boiler_top);
    const bottom = this._n(e.boiler_bottom);
    const outlet = this._n(e.outlet) ?? top;
    // col CLESS le docce si contano su quattro zone, una per sonda: la doccia raffredda soprattutto le zone basse (b e c)
    const showers = cless
      ? showersFromZones([top, this._n(e.puffer), this._n(e.coil_integ_out), this._n(e.coil_integ_in)], m)
      : showersEstimate(top, bottom, m);
    const pufferId = this.hass.states[e.puffer_effective] ? e.puffer_effective : e.puffer;
    const puffer = this._n(pufferId);
    const pufferEstimated = this.hass.states[pufferId]?.attributes?.fonte === "sonda pozzetto";
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
    const thermo = (this.hass.states[e.thermo_mode]?.attributes ?? {}) as Record<string, unknown>;
    const btn = boostButton(this._s(e.boost_state), false);
    // altezza del pulsante di accensione rapida: col CLESS la caldaia resta accesa e il pulsante non c'e'
    const btnH = cless ? 0 : btn.sub ? 78 : 64;
    // layout split a schede larghe: boiler piu' corto, con un solo giro per serpentina
    const short = this._config.layout === "split" && this._config.boiler === "short" && this._wide && !this._narrow;
    // layout split a schede larghe: dati a sinistra piu' grandi (la grafica resta com'e')
    const fs = this._config.layout === "split" && this._wide && !this._narrow ? 1.22 : 1;
    const d1 = short ? SHORT_D1 : 0;
    const d12 = short ? SHORT_D1 + SHORT_D2 : 0;
    const coilI = short ? COIL_INTEGRATION_SHORT : COIL_INTEGRATION;
    const coilS = short ? COIL_SOLAR_SHORT : COIL_SOLAR;
    const vh = cless ? 772 : 840;      // col CLESS sotto il serbatoio non resta niente: la scheda e' piu' bassa
    const viewBox = this._narrow ? `0 0 640 ${vh}` : `0 0 700 ${vh - d12}`;
    // col CLESS la potenza solare sta sopra S2 e S2 e' all'altezza della sonda nel pozzetto d
    const s2y = cless ? 614 : short ? 536 : 640;
    const kwy = cless ? 530 : short ? 616 : 728;
    const panIn = short ? "M598 440 H520 V512 H440" : cless ? "M536 548 H456" : "M598 500 H520 V560 H440";
    const panOut = short ? "M440 536 H548 V492 H598" : cless ? "M456 636 H578 V614" : "M440 656 H548 V552 H598";

    return html`
      <svg class=${this._narrow ? "boiler narrow" : "boiler"} viewBox=${viewBox} role="img" aria-label=${cless ? "Accumulo CLESS" : "Boiler solare"}>
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
        <path d=${cless ? "M305 108 V50 H540" : "M420 135 H520 V95"} class="pipe hot" />
        <path d=${cless ? "M335 108 V72 H540" : `M420 ${745 - d12} H520 V${775 - d12}`} class="pipe cold" />
        ${cless ? nothing : svg`<g class="pufgroup">
          <path d="M440 208 H575" class="pipe hot thin" />
          <path d="M440 ${short ? 236 : 268} H520 V315 H575" class="pipe warm thin" />
          <path d="M685 215 H700" class="pipe hot thin" />
          <path d="M685 300 H700" class="pipe warm thin" />
          <text x="452" y="198" class="tv">${integIn !== null ? `${fmt(integIn, 1)} °C` : ""}</text>
          <text x="452" y=${short ? 228 : 260} class="tv">${integOut !== null ? `${fmt(integOut, 1)} °C` : ""}</text>
        </g>`}

        <!-- boiler -->
        ${cless
          ? this._clessSection({
              cTop, cMid, cBot, solarOn: collectorOn, boilerOn: stovePumpRunning(this._s(e.pump)) === true,
              heatingOn: this._yes(e.heat_call) === true,
              minProbe: integOut, genProbe: integIn, boilerProbe: this._n(e.puffer),
              threshold: toNumber(thermo.puffer_soglia as string | null | undefined), waiting: thermo.puffer_in_attesa === true, showers,
            })
          : svg`
        <rect x="200" y="100" width="240" height=${660 - d12} rx="52" fill="url(#iso)" class="outline" />
        <rect x="222" y="122" width="196" height=${616 - d12} rx="38" fill="url(#acqua)" />
        <g class="coil">
          ${cless ? nothing : svg`<path d=${coilI} stroke="#7c3aed" />`}
          <path d=${coilS} stroke="#15803d" />
        </g>
        ${pumpOn && !cless ? svg`<path d=${coilI} class="coilflow" />` : nothing}
        ${collectorOn ? svg`<path d=${coilS} class="coilflow" />` : nothing}
        <rect x="246" y="150" width="160" height="26" rx="13" class="pill" />
        <text x="326" y="168" class="s14 b" text-anchor="middle" fill=${cless ? "#fb923c" : "#a78bfa"}>${cless ? "Caldaia (ACS)" : "Integrazione (caldaia)"}</text>
        ${integrationPill.key === "idle" || cless
          ? nothing
          : svg`<rect x="244" y=${284 - d1} width="164" height="22" rx="11" class="pill" /><circle cx="260" cy=${295 - d1} r="4.5" fill=${integrationPill.key === "blocked" ? "#f59e0b" : "#22c55e"} class=${integrationPill.key === "blocked" ? "" : "pulse"} /><text x="336" y=${299.5 - d1} class="s13 b" text-anchor="middle" fill=${integrationPill.key === "blocked" ? "#f59e0b" : "#22c55e"}>${integrationPill.label}</text>`}
        ${collectorOn
          ? svg`<rect x="250" y=${676 - d12} width="152" height="22" rx="11" class="pill" /><circle cx="266" cy=${687 - d12} r="4.5" fill="#22c55e" class="pulse" /><text x="334" y=${691.5 - d12} class="s13 b" text-anchor="middle" fill="#22c55e">${collectorPill.label}</text>`
          : nothing}
        <rect x="266" y=${522 - d1} width="120" height="26" rx="13" class="pill" />
        <text x="326" y=${540 - d1} class="s14 b" text-anchor="middle" fill="#4ade80">Solare</text>
        <rect x="222" y="122" width="196" height=${616 - d12} rx="38" fill="url(#lucido)" />

        <!-- scheda centrale -->
        <rect x="236" y=${338 - d1} width="168" height="176" rx="22" class="pill big" />
        <text x="320" y=${372 - d1} class="t2 s14" text-anchor="middle">Uscita acqua calda</text>
        <text x="320" y=${434 - d1} class="t1 b" font-size="50" text-anchor="middle">${fmt(outlet, 1)}<tspan font-size="24" dy="-16"> °C</tspan></text>
        <line x1="262" y1=${456 - d1} x2="378" y2=${456 - d1} class="sep" />
        <text x="320" y=${490 - d1} class="t1 b" font-size="22" text-anchor="middle">${showers === null ? "(–)" : `(≈ ${showers} ${showers === 1 ? "doccia" : "docce"})`}</text>
        `}

        <!-- sonde -->
        <circle cx="222" cy="168" r="8" class="probe" />
        <line x1="214" y1="168" x2="150" y2="168" class="lead" />
        <rect x="14" y="132" width="136" height="72" rx="14" class="card hi" />
        <text x="82" y="154" class="t2" font-size=${Math.round(14 * fs)} text-anchor="middle">Alto (S3)</text>
        <text x="82" y="190" class="b" font-size=${Math.round(27 * fs)} text-anchor="middle" fill="#ef4444">${fmt(top, 1)} °C</text>

        <circle cx="222" cy=${(cless ? 650 : 676) - d12} r="8" class="probe" />
        <line x1="214" y1=${(cless ? 650 : 676) - d12} x2="150" y2=${(cless ? 650 : 676) - d12} class="lead" />
        <rect x="14" y=${s2y} width="136" height="72" rx="14" class="card lo" />
        <text x="82" y=${s2y + 24} class="t2" font-size=${Math.round(14 * fs)} text-anchor="middle">Basso (S2)</text>
        <text x="82" y=${s2y + 58} class="b" font-size=${Math.round(27 * fs)} text-anchor="middle" fill="#3b82f6">${fmt(bottom, 1)} °C</text>

        <!-- stima e pulsante -->
        ${cless
          ? svg`<rect x="14" y="216" width="136" height="68" rx="14" class="card eta" />
        <text x="82" y="235" class="t2" font-size=${Math.round(13 * fs)} text-anchor="middle">Caldaia imposta a</text>
        <text x="82" y="264" class="t1 b" font-size=${Math.round(28 * fs)} text-anchor="middle">${this._n(e.set_boiler) === null ? "–" : `${fmt(this._n(e.set_boiler), 0)} °C`}</text>
        <text x="82" y="278" class="t2" font-size="11" text-anchor="middle">sonda S. BOILER</text>
        ${this._config.summary === false
          ? nothing
          : svg`<g class="btn info" role="button" tabindex="0" aria-label="Stato dell'impianto" @click=${() => this._openInfo()}
              @keydown=${(ev: KeyboardEvent) => (ev.key === "Enter" || ev.key === " ") && this._openInfo()}>
              <rect x="14" y="292" width="66" height="44" rx="14" class="infobg" />
              <circle cx="28" cy="314" r="7" class="infoc" />
              <text x="28" y="317.5" class="b" font-size="10" text-anchor="middle">i</text>
              <text x="40" y="319" class="b" font-size="12">Stato</text>
            </g>`}
        ${this._config.charts === false
          ? nothing
          : svg`<g class="btn info" role="button" tabindex="0" aria-label="Grafici" @click=${() => this._openCharts()}
              @keydown=${(ev: KeyboardEvent) => (ev.key === "Enter" || ev.key === " ") && this._openCharts()}>
              <rect x="84" y="292" width="66" height="44" rx="14" class="infobg" />
              <polyline points="90,320 95,311 99,316 105,306" class="infoc" />
              <text x="108" y="319" class="b" font-size="11">Grafici</text>
            </g>`}`
          : svg`        <rect x="14" y="224" width="136" height="104" rx="14" class="card eta" />
        <text x="82" y="248" class="t2" font-size=${Math.round(14 * fs)} text-anchor="middle">${cless ? "Caldaia imposta a" : "Acqua pronta in"}</text>
        <text x="82" y="292" class="t1 b" font-size=${Math.round(34 * fs)} text-anchor="middle">${cless ? (this._n(e.set_boiler) === null ? "–" : `${fmt(this._n(e.set_boiler), 0)} °C`) : etaText(eta)}</text>
        <text x="82" y="314" class="t2" font-size=${Math.round(13 * fs)} text-anchor="middle">${cless ? "sonda S. BOILER" : eta === 0 ? "già a temperatura" : eta === null ? "" : "stima media"}</text>
        ${cless ? nothing : svg`<g class=${btn.action === "none" ? "btn off" : "btn"} role="button" tabindex=${btn.action === "none" ? "-1" : "0"}
          aria-label=${btn.label} @click=${() => this._press()} @keydown=${(ev: KeyboardEvent) => (ev.key === "Enter" || ev.key === " ") && this._press()}>
          <rect x="14" y="340" width="136" height="${btn.sub ? 78 : 64}" rx="14" class="btnbg" />
          <text x="82" y=${btn.sub ? 372 : 380} class="b" font-size=${Math.round(18 * fs)} text-anchor="middle">${btn.label}</text>
          ${btn.sub ? svg`<text x="82" y="396" class="s13" text-anchor="middle" opacity="0.85">${btn.sub}</text>` : nothing}
        </g>`}
        ${this._config.summary === false
          ? nothing
          : svg`<g class="btn info" role="button" tabindex="0" aria-label="Stato dell'impianto" @click=${() => this._openInfo()}
              @keydown=${(ev: KeyboardEvent) => (ev.key === "Enter" || ev.key === " ") && this._openInfo()}>
              <rect x="14" y=${(340 + btnH) + 12} width="136" height="44" rx="14" class="infobg" />
              <circle cx="40" cy=${(340 + btnH) + 34} r="10" class="infoc" />
              <text x="40" y=${(340 + btnH) + 39} class="b" font-size=${Math.round(14 * fs)} text-anchor="middle">i</text>
              <text x="92" y=${(340 + btnH) + 40} class="b" font-size=${Math.round(17 * fs)} text-anchor="middle">Stato</text>
            </g>`}
        ${this._config.charts === false
          ? nothing
          : svg`<g class="btn info" role="button" tabindex="0" aria-label="Grafici" @click=${() => this._openCharts()}
              @keydown=${(ev: KeyboardEvent) => (ev.key === "Enter" || ev.key === " ") && this._openCharts()}>
              <rect x="14" y=${(340 + btnH) + 66} width="136" height="44" rx="14" class="infobg" />
              <polyline points="28,${(340 + btnH) + 98} 35,${(340 + btnH) + 88} 41,${(340 + btnH) + 94} 51,${(340 + btnH) + 80}" class="infoc" />
              <text x="102" y=${(340 + btnH) + 94} class="b" font-size=${Math.round(17 * fs)} text-anchor="middle">Grafici</text>
            </g>`}`}

        <!-- solare -->
        <rect x="14" y=${kwy} width="136" height="72" rx="14" class="card sun" />
        <text x="82" y=${kwy + 24} class="t2" font-size=${Math.round(14 * fs)} text-anchor="middle">Solare</text>
        <text x="82" y=${kwy + 58} class="b" font-size=${Math.round(24 * fs)} text-anchor="middle" fill="#22c55e">${fmt(solarKw, 1)} kW</text>

        <text x=${cless ? 548 : 532} y=${cless ? 46 : 80} class="b s14" fill="#ef4444">Acqua calda</text>
        <text x=${cless ? 548 : 532} y=${cless ? 62 : 98} class="t2 s13">verso utenze</text>
        ${cless ? svg`<text x="548" y="78" class="b s14" fill="#3b82f6">Acqua fredda</text><text x="548" y="94" class="t2 s13">dalla rete</text>` : nothing}
        ${cless ? nothing : svg`<text x="532" y=${796 - d12} class="b s14" fill="#3b82f6">Acqua fredda</text>
        <text x="532" y=${814 - d12} class="t2 s13">dalla rete</text>`}

        ${cless ? nothing : svg`<g class="pufgroup">${this._pufferShape(puffer, pufferEstimated)}</g>`}

        <!-- pannello solare e circuito del collettore -->
        <g class="pufgroup pannello">
          <path d=${panIn} class="pipe hot thin" />
          <path d=${panOut} class="pipe cold thin" />
          ${collectorOn ? svg`<path d=${panIn} class="coilflow" /><path d=${panOut} class="coilflow" />` : nothing}
          <text x="462" y=${short ? 504 : cless ? 540 : 548} class="tv">${solarIn !== null ? `${fmt(solarIn, 1)} °C` : ""}</text>
          <text x="462" y=${short ? 528 : cless ? 656 : 644} class="tv">${solarOut !== null ? `${fmt(solarOut, 1)} °C` : ""}</text>
          <g transform=${short ? "translate(0 -60)" : "translate(0 0)"}>${this._panelShape(panel, panelFill, cless)}</g>
        </g>
      </svg>
      ${this._narrow
        ? svg`<svg class="boiler mini" viewBox="0 0 640 330" role="img" aria-label="Puffer e pannello solare">
            ${cless ? nothing : svg`<g transform="translate(-480 -140)">${this._pufferShape(puffer, pufferEstimated)}</g>
            <text x="150" y="236" class="tv">${integIn !== null ? `→ ${fmt(integIn, 1)} °C` : ""}</text>
            <text x="150" y="266" class="tv">${integOut !== null ? `← ${fmt(integOut, 1)} °C` : ""}</text>`}
            <g transform="translate(-160 -420)">${this._panelShape(panel, panelFill)}</g>
            <text x="470" y="318" class="tv" text-anchor="middle">${solarIn !== null ? `→ ${fmt(solarIn, 1)} °C` : ""}   ${solarOut !== null ? `← ${fmt(solarOut, 1)} °C` : ""}</text>
          </svg>`
        : nothing}
    `;
  }

  /**
   * Percorso lungo le spire della serpentina (elica vista di lato, coordinate del render): parte a destra in alto
   * e gira verso sinistra passando davanti, poi dietro. `front` = solo i tratti davanti, altrimenti solo quelli dietro.
   */
  private _coilPath(cx: number, r: number, ry: number, y0: number, pitch: number, turns: number, front: boolean): string {
    const parts: string[] = [];
    const n = 24;
    for (let k = 0; k < turns; k++) {
      for (let half = 0; half < 2; half++) {
        if ((half === 0) !== front) continue;
        const pts: string[] = [];
        for (let i = 0; i <= n; i++) {
          const t = (k + (half * 0.5 + (i / n) * 0.5)) * 2 * Math.PI;
          const x = cx + r * Math.cos(t);
          const y = y0 + (t / (2 * Math.PI)) * pitch + ry * Math.sin(t);
          pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`);
        }
        parts.push(pts.join(" "));
      }
    }
    return parts.join(" ");
  }

  /**
   * Il CLESS in sezione: un render fisso come sfondo e, sopra, un SVG che lo colora con le temperature delle sonde
   * e anima i flussi. Le coordinate del gruppo sono quelle del render (730 x 1710), poi ridotte nel disegno.
   */
  private _clessSection(o: {
    cTop: string;
    cMid: string;
    cBot: string;
    solarOn: boolean;
    boilerOn: boolean;
    /** la pompa del riscaldamento gira (il termostato ambiente chiama calore) */
    heatingOn: boolean;
    /** sonde nei pozzetti: b sinistra (minima per il riscaldamento), c destra (generatore), b destra (S. BOILER della caldaia) */
    minProbe: number | null;
    genProbe: number | null;
    boilerProbe: number | null;
    /** temperatura minima del puffer perche' il riscaldamento parta, e se il termostato sta aspettando */
    threshold: number | null;
    waiting: boolean;
    /** stima delle docce disponibili */
    showers: number | null;
  }) {
    const water = "M195 112 H477 A95 95 0 0 1 572 207 V1395 A95 95 0 0 1 477 1490 H195 A95 95 0 0 1 100 1395 V207 A95 95 0 0 1 195 112 Z";
    const silhouette =
      "M25 110 Q25 20 130 20 H540 Q645 20 645 110 V1470 Q645 1495 600 1502 V1640 Q600 1662 560 1662 H110 Q70 1662 70 1640 V1502 Q25 1495 25 1470 Z";
    const stubs = "M640 146 h36 v46 h-36 Z M640 372 h36 v26 h-36 Z M640 590 h36 v45 h-36 Z M640 700 h36 v200 h-36 Z";
    const minTxt = o.minProbe === null ? "–" : `${fmt(o.minProbe, 1)} °C`;
    const tooCold = o.waiting || (o.threshold !== null && o.minProbe !== null && o.minProbe < o.threshold);
    const tag = tooCold ? "#f59e0b" : "#22c55e";
    return svg`
      <g transform="translate(190.3 100) scale(0.387)">
        <defs>
          <clipPath id="clessSil"><path d=${silhouette} /><path d=${stubs} /></clipPath>
          <clipPath id="clessWater"><path d=${water} /></clipPath>
          <clipPath id="clessSides"><rect x="100" y="1080" width="130" height="380" /><rect x="440" y="1080" width="132" height="380" /></clipPath>
          <mask id="clessMask" maskUnits="userSpaceOnUse" x="0" y="0" width="730" height="1710">
            <image href=${CLESS_MASK} x="0" y="0" width="730" height="1710" />
          </mask>
          <linearGradient id="clessTint" gradientUnits="userSpaceOnUse" x1="0" y1="112" x2="0" y2="1490">
            <stop offset="0" stop-color=${o.cTop} />
            <stop offset="0.43" stop-color=${o.cTop} />
            <stop offset="0.52" stop-color=${o.cMid} />
            <stop offset="0.65" stop-color=${o.cMid} />
            <stop offset="0.70" stop-color=${o.cBot} />
            <stop offset="1" stop-color=${o.cBot} />
          </linearGradient>
        </defs>
        <image href=${CLESS_RENDER} x="0" y="0" width="730" height="1710" clip-path="url(#clessSil)" />
        <rect x="100" y="112" width="472" height="1378" fill="url(#clessTint)" class="clesstint" clip-path="url(#clessWater)" mask="url(#clessMask)" />
        ${o.solarOn
          ? svg`<path d=${this._coilPath(335, 200, 35, 1150, 40, 6, true)} class="clessflow" />
              <path d=${this._coilPath(335, 200, 35, 1150, 40, 6, false)} class="clessflow" clip-path="url(#clessSides)" />`
          : nothing}
      </g>

      <!-- attacchi del solare: mandata dal pannello in alto sulla serpentina, ritorno in basso -->
      <rect x="436" y="542" width="20" height="12" rx="2" class="stub" />
      <rect x="436" y="630" width="20" height="12" rx="2" class="stub" />

      <!-- acqua sanitaria: i due tubi escono dalla flangia in alto -->
      <rect x="298" y="98" width="14" height="12" rx="2" class="stub" />
      <rect x="328" y="98" width="14" height="12" rx="2" class="stub" />

      <!-- attacchi della caldaia, a destra: mandata (entra) e ritorno (esce); il tratteggio segue il verso dell'acqua: la mandata va dalla caldaia verso l'accumulo -->
      <path d="M456 396 H500" class="pipe hot thin" />
      <path d="M456 426 H500" class="pipe cold thin" />
      <polygon points="486,389 470,396 486,403" fill="#ef4444" />
      <polygon points="470,419 486,426 470,433" fill="#3b82f6" />
      ${o.boilerOn
        ? svg`<path d="M500 396 H456" class="coilflow" /><path d="M456 426 H500" class="coilflow" />`
        : nothing}
      <text x="506" y="274" class="b" font-size="13" fill="#fb923c">Caldaia</text>
      <rect x="506" y="282" width="136" height="90" rx="14" class="card eta" />
      <text x="574" y="304" class="t2" font-size="13" text-anchor="middle">Puffer acqua calda</text>
      <text x="574" y="334" class="t1 b" font-size="27" text-anchor="middle">${o.boilerProbe === null ? "–" : `${fmt(o.boilerProbe, 1)} °C`}</text>
      <text x="574" y="358" class="t1 b" font-size="14" text-anchor="middle">${o.showers === null ? "(–)" : `≈ ${o.showers} ${o.showers === 1 ? "doccia" : "docce"}`}</text>
      <text x="506" y="401" class="t1 b" font-size="17">${o.minProbe === null ? "–" : `${fmt(o.minProbe, 1)} °C`}</text>
      <text x="506" y="431" class="t1 b" font-size="17">${o.genProbe === null ? "–" : `${fmt(o.genProbe, 1)} °C`}</text>

      <!-- impianto di riscaldamento, a sinistra: la pompa spinge l'acqua nella mandata (esce), il ritorno entra -->
      <rect x="188" y="390" width="16" height="12" rx="2" class="stub" />
      <rect x="188" y="420" width="16" height="12" rx="2" class="stub" />
      <path d="M188 396 H64" class="pipe hot thin" />
      <path d="M64 426 H188" class="pipe cold thin" />
      ${o.heatingOn
        ? svg`<path d="M188 396 H64" class="coilflow" /><path d="M64 426 H188" class="coilflow" />`
        : nothing}
      <polygon points="112,389 96,396 112,403" fill="#ef4444" />
      <polygon points="104,419 120,426 104,433" fill="#3b82f6" />
      ${this._pumpIcon(152, 396, 11, o.heatingOn)}
      <g class="radiator">
        <rect x="22" y="380" width="42" height="62" rx="7" class="radbody" />
        ${[32, 41, 50, 59].map((x) => svg`<line x1=${x} y1="386" x2=${x} y2="436" class="radfin" />`)}
      </g>
      <text x="43" y="372" class="t2" font-size="11" text-anchor="middle">Impianto</text>
      <text x="14" y="462" class="t2" font-size="11">Minima (b): ${minTxt}</text>
      <text x="14" y="477" class="b" font-size="12" fill=${tag}>${o.threshold === null ? "blocco riscaldamento spento" : o.waiting ? `attende ${fmt(o.threshold, 0)} °C` : `parte sopra ${fmt(o.threshold, 0)} °C`}</text>
    `;
  }

  /** Modo CLESS acceso: accumulo al posto del boiler solare e del puffer, senza pompa di integrazione ne' pulsante di accensione rapida. */
  private _cless(): boolean {
    return this._yes(this._e.cless_mode) === true;
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
  /** `near`: il pannello accanto al puffer (CLESS), con le scritte sotto il ritorno del collettore. */
  private _panelShape(panel: PanelModel, fill: string, near = false) {
    const body = svg`
      <text x="630" y="440" class="t1 b s16" text-anchor="middle">Pannello solare</text>
      <polygon points="616,462 692,462 676,568 592,568" fill=${fill} class="outline panelbody" />
      <g class="panelgrid">
        <line x1="641" y1="462" x2="634" y2="568" /><line x1="667" y1="462" x2="655" y2="568" />
        <line x1="604" y1="515" x2="684" y2="515" /><line x1="610" y1="541" x2="680" y2="541" /><line x1="610" y1="489" x2="688" y2="489" />
      </g>
      <polygon points="616,462 640,462 612,568 592,568" fill="#fff" opacity="0.16" />
      <line x1="618" y1="568" x2="612" y2="586" class="panelleg" /><line x1="666" y1="568" x2="672" y2="586" class="panelleg" />`;
    // sotto il pannello (layout normale: y 618..690; vicino al puffer: sotto il tubo di ritorno)
    const x = near ? 578 : 630;
    const y = (normal: number, closer: number) => (near ? closer : normal);
    return svg`
      ${near ? svg`<g transform="translate(-70 40)">${body}</g>` : body}
      <text x=${x} y=${y(618, 668)} class="t1 b val" text-anchor="middle">${panel.value === null ? "–" : `${fmt(panel.value, 0)} °C`}</text>
      <text x=${x} y=${y(640, 690)} class="t2 s15" text-anchor="middle">${panel.caption}</text>
      ${panel.maxPredicted !== null
        ? svg`<text x=${x} y=${y(668, 716)} class="b s15" text-anchor="middle" fill="#f59e0b">max prevista ${fmt(panel.maxPredicted, 0)} °C</text>`
        : nothing}
      ${panel.maxToday !== null
        ? svg`<text x=${x} y=${y(690, 738)} class="t2 s15" text-anchor="middle">raggiunta oggi ${fmt(panel.maxToday, 0)} °C</text>`
        : nothing}`;
  }

  // ---- caldaia -----------------------------------------------------------

  private _flame(cx: number, cy: number, k: number, opacity = 1) {
    return svg`<g transform="translate(${cx},${cy}) scale(${k})" opacity=${opacity}>
      <path d=${FLAME_PATH} fill="url(#fiamma)" />
      <path d=${FLAME_PATH} fill="#fde047" transform="translate(0,6) scale(0.52)" />
    </g>`;
  }

  /**
   * Circolatore della caldaia: un girante a tre palette dentro un cerchio. In marcia e' verde e gira; fermo e' grigio e
   * sbiadito (cosi' si vede sempre dove sta); con il sensore che non risponde non compare.
   */
  private _pumpIcon(cx: number, cy: number, r: number, running: boolean | null) {
    if (running === null) return nothing;
    const vane = (a: number) => svg`<path d="M0,0 Q${r * 0.55},${-r * 0.1} ${r * 0.78},${-r * 0.72}" transform="rotate(${a})" />`;
    return svg`<g class=${running ? "pump on" : "pump"} transform="translate(${cx},${cy})">
      <title>${running ? "Circolatore acceso" : "Circolatore fermo"}</title>
      <circle class="pumpring" r=${r} />
      <g class="pumprotor">${vane(0)}${vane(120)}${vane(240)}</g>
      <circle class="pumphub" r="1.4" />
    </g>`;
  }

  private _renderStoveImage(look: StoveLook, pellet: ReturnType<typeof pelletStatus>, pump: boolean | null = null) {
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
        ${this._pumpIcon(152, 220, 8, pump)}
      </svg>
    `;
  }

  private _tile(label: string, value: string, color?: string) {
    return html`<div class="tile"><span class="tl">${label}</span><span class="tv" style=${color ? `color:${color}` : ""}>${value}</span></div>`;
  }

  private _chip(label: string, v: boolean | null) {
    return html`<div class="chip ${v ? "yes" : ""}"><span>${label}</span><b>${v === null ? "–" : v ? "SÌ" : "NO"}</b></div>`;
  }

  /** Stagione impostata sulla caldaia («Estate»/«Inverno»); non compare se il sensore non c'è. */
  private _seasonChip() {
    const id = this._e.season;
    if (!id || !this.hass.states[id]) return nothing;
    const key = seasonKey(this._s(id));
    return html`<div class="chip season ${key ?? ""}"><span>Stagione</span><b>${key ? SEASON_LABEL[key] : "–"}</b></div>`;
  }

  private _renderStove() {
    const e = this._e;
    const stateRaw = this._s(e.stove_state);
    const look = stoveLook(stateRaw);
    const changed = this.hass.states[e.stove_state]?.last_changed;
    const since = changed ? new Date(changed).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }) : null;
    const alarmRaw = (this._s(e.alarm) ?? "").trim();
    const noAlarm = alarmRaw === "" || /^[_\-\s0]+$/.test(alarmRaw) || alarmRaw.toLowerCase() === "unknown";
    const work = this._n(e.work_hours_today);
    const pellet = pelletStatus(this._yes(e.pellet_reserve), this._yes(e.pellet_empty), this._yes(e.pellet_open));
    // layout split con il conteggio del pellet: stato e acqua nella figura, ultimo cambio in alto, pellet sul serbatoio
    const inline = this._config.layout === "split" && this._pelletEnabled();

    return html`
      <section class="stove">
        <div class="shead">
          <h3>Caldaia a pellet (Polygon)</h3>
          ${this._config.schedule === false && this._config.settings === false
            ? nothing
            : html`<div class="hbtns">
                ${this._config.schedule === false
                  ? nothing
                  : html`<button class="progbtn" @click=${() => this._openSchedule()} aria-label="Programmazione settimanale della caldaia">
                      <ha-icon icon="mdi:calendar-clock"></ha-icon><span>Programma</span>
                    </button>`}
                ${this._config.settings === false
                  ? nothing
                  : html`<button class="gearbtn" title="Preferenze impianto" aria-label="Preferenze impianto" @click=${() => this._openSettings()}>
                      <ha-icon icon="mdi:cog-outline"></ha-icon>
                    </button>`}
              </div>`}
        </div>
        <div class=${inline ? "top figure" : "top"}>
          ${inline
            ? this._renderPolygonFigure(look, pellet, { state: stateRaw ?? "–", water: this._n(e.stove_water), since, pump: stovePumpRunning(this._s(e.pump)) })
            : html`${this._renderStoveImage(look, pellet, stovePumpRunning(this._s(e.pump)))}
                <div class="statecard">
                  <span class="scp"><span class="tl">Stato caldaia</span><span class="statepill ${look}">${stateRaw ?? "–"}</span></span>
                  <span class="scp"><span class="tl">Acqua caldaia</span><span class="water">${fmt(this._n(e.stove_water), 1)}<small> °C</small></span></span>
                  <span class="scp"><span class="tl">Ultimo cambio stato</span><span class="since">${since ? `alle ${since}` : "–"}</span></span>
                  <span class="scp"><span class="tl">Pellet</span><span class="pelletpill ${pellet.key}">${pellet.label}</span></span>
                </div>`}
        </div>
        ${noAlarm ? nothing : html`<div class="alarmbar" role="alert"><b>Allarme</b><span>${alarmRaw}</span></div>`}
        <div class="tiles">
          ${this._tile(this._cless() ? "Sonda S. BOILER" : "Puffer 50 L", `${fmt(this._n(this.hass.states[e.puffer_effective] ? e.puffer_effective : e.puffer), 1)} °C${this.hass.states[e.puffer_effective]?.attributes?.fonte === "sonda pozzetto" ? " (stima)" : ""}`, "#f59e0b")}
          ${this._tile("Set boiler", `${fmt(this._n(e.set_boiler), 0)} °C`)}
          ${this._tile("Set acqua", `${fmt(this._n(e.set_water), 0)} °C`)}
          ${this._tile("Potenza reale", `${fmt(this._n(e.power), 0)} %`)}
        </div>
        <div class="counters">
          <span class="tl">Oggi</span>
          <div>
            <b>${fmt(this._n(e.starts_today), 0)} accensioni</b>
            <b>${fmt(work, 1)} h in lavoro</b>
            <b>${fmt(this._n(e.standby_today), 0)} stand-by</b>
          </div>
          <button class="more" @click=${() => this._openDetails()} aria-label="Altri dati della caldaia">Altri dati ▸</button>
        </div>
        <div class="chips">
          ${this._chip("Richiesta ACS", this._yes(e.request_acs))} ${this._chip("Riscaldamento", this._yes(e.request_heating))}
          ${this._chip("Consenso suggerito", this._yes(e.consent))}
          ${this._seasonChip()}
        </div>
        <p class="look">${LOOK_LABEL[look]}</p>
      </section>
    `;
  }

  /** Tutti i valori che non stanno nella colonna principale della caldaia. */
  private _detailGroups(): DetailGroup[] {
    const e = this._e;
    const pump = this._s(e.pump);
    const pumpOn = pump !== undefined && pump !== "OFF" && pump !== "unknown" && pump !== "unavailable";
    const alarmRaw = (this._s(e.alarm) ?? "").trim();
    const noAlarm = alarmRaw === "" || /^[_\-\s0]+$/.test(alarmRaw) || alarmRaw.toLowerCase() === "unknown";
    const groups: DetailGroup[] = [
      {
        title: "Combustione",
        tiles: [
          { label: "Fumi", value: `${fmt(this._n(e.smoke), 0)} °C` },
          { label: "Fiamma", value: `${fmt(this._n(e.flame), 0)} °C` },
          { label: "Estrattore fumi", value: `${fmt(this._n(e.extractor), 0)} giri` },
          { label: "Pressione braciere", value: fmt(this._n(e.brazier_pressure), 1) },
        ],
      },
      {
        title: "Acqua e circolatore",
        tiles: [
          { label: "Pressione acqua", value: `${fmt(this._n(e.water_pressure), 1)} bar` },
          { label: "Circolatore", value: pump === undefined ? "–" : pumpOn ? "ON" : "OFF", color: pumpOn ? "#22c55e" : undefined },
          { label: "Accensioni ieri", value: fmt(this._n(e.starts_yesterday), 0) },
          { label: "Allarme", value: noAlarm ? "nessuno" : alarmRaw, color: noAlarm ? "#22c55e" : "#ef4444" },
        ],
      },
    ];
    if ([e.pellet_today, e.pellet_week, e.pellet_month].some((id) => this.hass.states[id])) {
      groups.push({
        title: "Pellet (stima dal modello di consumo)",
        tiles: [
          { label: "Oggi", value: `${fmt(this._n(e.pellet_today), 1)} kg` },
          { label: "Settimana", value: `${fmt(this._n(e.pellet_week), 1)} kg` },
          { label: "Mese", value: `${fmt(this._n(e.pellet_month), 0)} kg` },
        ],
      });
    }
    return groups;
  }

  /** Apre la finestra "Altri dati" (si aggiunge alla pagina, come le altre). */
  private _openDetails(): void {
    if (this._details) return;
    const d = document.createElement("impianto-details-dialog") as ImpiantoDetailsDialog;
    d.groups = this._detailGroups();
    d.addEventListener("closed", () => {
      this._details = undefined;
    });
    document.body.appendChild(d);
    this._details = d;
  }

  /**
   * Se il browser non ha registrato una scheda collegata, ne importa il file a mano: se l'importazione riesce la scheda compare,
   * se fallisce l'errore (che sul tablet non si puo' leggere dalla console) finisce nel segnaposto.
   */
  private async _loadLinkedCards(): Promise<void> {
    const cards: Array<[string, string]> = [
      ["stufa-pellet-card", "/impianto_riscaldamento_static/stufa-pellet-card.js"],
      ["termostato-card", "/impianto_riscaldamento_static/termostato-card.js"],
    ];
    for (const [element, url] of cards) {
      if (customElements.get(element)) continue;
      try {
        await import(/* @vite-ignore */ `${url}?r=${Date.now()}`);
        this._loadInfo = {
          ...this._loadInfo,
          [element]: customElements.get(element) ? "caricata a mano" : "file importato ma la scheda non si registra",
        };
      } catch (err) {
        const e = err as Error;
        this._loadInfo = { ...this._loadInfo, [element]: `${e?.name ?? "Errore"}: ${e?.message ?? String(err)}` };
      }
      this.requestUpdate();
    }
  }

  /** Segnaposto quando una scheda collegata non si e' caricata: dice cosa manca e permette di ricaricare con un tocco. */
  private _missingBox(title: string, element: string) {
    return html`<div class="missingbox" role="alert">
      <b>${title}: scheda non caricata</b>
      <span>Il browser non ha ancora caricato «${element}». Ricarica la pagina; se resta così svuota la cache del browser.</span>
      <span class="missingdiag">${this._loadInfo[element] ?? "provo a caricarla…"} · ${(navigator.userAgent.match(/Chrome\/[\d.]+/) ?? ["?"])[0]}</span>
      <button @click=${() => location.reload()}>Ricarica la pagina</button>
    </div>`;
  }

  /** Il termostato ambiente (integrazione termostato_riscaldamento): sotto la caldaia, solo se è installato. */
  private _renderThermostat() {
    const opt = this._config.thermostat;
    if (opt === false) return nothing;
    if (!customElements.get("termostato-card")) {
      const comps = (this.hass as unknown as { config?: { components?: string[] } }).config?.components ?? [];
      const installed = comps.includes("impianto_riscaldamento") || comps.includes("termostato_riscaldamento");
      return this._waited && installed ? this._missingBox("Termostato", "termostato-card") : nothing;
    }
    const cfg = typeof opt === "object" && opt !== null ? opt : {};
    const key = JSON.stringify(cfg);
    if (!this._thermo || this._thermoKey !== key) {
      const el = document.createElement("termostato-card") as HTMLElement & { hass: HomeAssistant; setConfig(c: Record<string, unknown>): void };
      el.setConfig({ type: "custom:termostato-card", embedded: true, ...(cfg.entry_id ? { entry_id: cfg.entry_id } : {}), ...(cfg.title ? { title: cfg.title } : {}) });
      this._thermo = el;
      this._thermoKey = key;
    }
    this._thermo.hass = this.hass;
    return html`<div class="thermo">${this._thermo}</div>`;
  }

  /** La scheda «Stanze» accanto al termostato: compare se almeno un sensore delle stanze esiste. */
  private _renderRooms() {
    const opt = this._config.rooms;
    if (opt === false) return nothing;
    const cfg = typeof opt === "object" && opt !== null ? opt : {};
    const rooms = cfg.rooms === undefined ? DEFAULT_ROOMS : normalizeRooms(cfg.rooms);
    const exists = (id: string) => !!id && this.hass.states[id] !== undefined;
    if (!rooms.some((r) => roomExists(r, exists))) return nothing;
    const key = JSON.stringify(cfg);
    if (!this._roomsEl || this._roomsKey !== key) {
      const el = document.createElement("impianto-rooms-card") as HTMLElement & { hass: HomeAssistant; setConfig(c: Record<string, unknown>): void };
      el.setConfig({ type: "custom:impianto-rooms-card", embedded: true, stove_state: this._e.stove_state, ...cfg });
      this._roomsEl = el;
      this._roomsKey = key;
    }
    this._roomsEl.hass = this.hass;
    return html`<div class="roomsbox">${this._roomsEl}</div>`;
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
      pufferEstimated: this.hass.states[pufferId]?.attributes?.fonte === "sonda pozzetto",
      boilerTop: this._n(e.boiler_top),
      collector: this._n(e.collector_temp),
      integrationPump: pill.key,
      cless: this._cless(),
      collectorPumpOn: this._yes(e.collector_pump),
      etaMinutes: this._cless() ? null : eta,
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
      allskyOk: this.hass.states[e.allsky_analysis]?.attributes?.ok === true ? true : this.hass.states[e.allsky_analysis] ? false : null,
      sunFree: this._yes(e.allsky_sun_free),
      allskyCloud: this._n(e.allsky_cloud),
      sunAboveHorizon: this._yes(e.sun_above_horizon),
      horizonElev: this._n(e.horizon_elevation),
      sunElevation: toNumber(String(this.hass.states[e.sun]?.attributes?.elevation ?? "")),
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

  // ---- pellet nel serbatoio: chili del riferimento meno il consumo stimato da allora --------------------------------

  /** Il conteggio del serbatoio c'e' solo con i due valori di riferimento e il totale stimato. */
  private _pelletEnabled(): boolean {
    const e = this._e;
    return !!(this.hass.states[e.pellet_ref_kg] && this.hass.states[e.pellet_ref_total] && this.hass.states[e.pellet_total]);
  }

  private _pelletKg(): number | null {
    const e = this._e;
    if (!this._pelletEnabled()) return null;
    return remainingKg(this._n(e.pellet_ref_kg), this._n(e.pellet_total), this._n(e.pellet_ref_total));
  }

  /** Consumo medio al giorno: dai contatori della settimana e del mese, diviso per i giorni trascorsi (vedi consumptionPerDay). */
  private _pelletPerDay(): number {
    return consumptionPerDay(this._n(this._e.pellet_week), this._n(this._e.pellet_month), new Date());
  }

  private _pelletInfo(): PelletInfo {
    return { kg: this._pelletKg(), perDay: this._pelletPerDay(), bagKg: this._n(this._e.pellet_bag) ?? HOPPER.bagKg };
  }

  /** Scrive il nuovo riferimento: i chili che ci sono adesso e il totale stimato di adesso. */
  private async _pelletSetReference(kg: number): Promise<void> {
    const e = this._e;
    const total = this._n(e.pellet_total);
    if (total === null) return;
    const refMax = Number(this.hass.states[e.pellet_ref_kg]?.attributes?.max ?? 130);
    await Promise.all([
      this.hass.callService("input_number", "set_value", { entity_id: e.pellet_ref_kg, value: Math.round(Math.min(refMax, kg) * 10) / 10 }),
      this.hass.callService("input_number", "set_value", { entity_id: e.pellet_ref_total, value: Math.round(total * 100) / 100 }),
    ]);
  }

  /** Popup con i grafici del pellet: chili rimasti, caricamenti, letture del livello, consumo per giorno. */
  private _openPelletCharts(): void {
    if (this._pelletChartsDlg || !this._pelletEnabled()) return;
    const d = document.createElement("impianto-pellet-charts-dialog") as ImpiantoPelletChartsDialog;
    d.hass = this.hass;
    d.ids = { remaining: "sensor.caldaia_pellet_serbatoio", total: this._e.pellet_total, factor: "input_number.caldaia_pellet_fattore" };
    d.bagKg = this._pelletInfo().bagKg;
    d.perDay = this._pelletPerDay();
    d.addEventListener("closed", () => {
      this._pelletChartsDlg = undefined;
    });
    document.body.appendChild(d);
    this._pelletChartsDlg = d;
  }

  private _openPellet(): void {
    if (this._pelletDlg || !this._pelletEnabled()) return;
    const d = document.createElement("impianto-pellet-dialog") as ImpiantoPelletDialog;
    d.info = this._pelletInfo();
    d.addEventListener("bags", (ev) => {
      const kg = this._pelletKg();
      const bag = this._pelletInfo().bagKg;
      if (kg !== null) void this._pelletSetReference(afterBags(kg, (ev as CustomEvent<number>).detail, bag));
    });
    d.addEventListener("level", (ev) => void this._pelletSetReference(kgAtDepth((ev as CustomEvent<number>).detail)));
    d.addEventListener("closed", () => {
      this._pelletDlg = undefined;
    });
    document.body.appendChild(d);
    this._pelletDlg = d;
  }

  /**
   * Layout split: la caldaia Polygon come nella foto (armadio del serbatoio a sinistra, corpo della caldaia a destra).
   * Nell'armadio il serbatoio del pellet riempito fino ai chili rimasti (si tocca per aggiornare il conteggio); nel corpo la
   * finestra con la fiamma, in alto l'ultimo cambio di stato, in basso lo stato e la temperatura dell'acqua.
   */
  private _renderPolygonFigure(look: StoveLook, pellet: ReturnType<typeof pelletStatus>, d: { state: string; water: number | null; since: string | null; pump: boolean | null }) {
    const kg = this._pelletKg();
    const days = daysLeft(kg, this._pelletPerDay());
    // quanto durerebbe un carico completo (120 kg) al consumo medio attuale
    const fullDays = daysLeft(HOPPER.capacityKg, this._pelletPerDay());
    const dayText = (n: number) => `${n < 10 ? fmt(n, 1) : fmt(n, 0)} giorni`;
    const glow = look === "work" ? 0.55 : look === "start" ? 0.3 : 0;
    const flame =
      look === "work"
        ? this._flame(272, 156, 0.82)
        : look === "start"
          ? this._flame(272, 156, 0.32)
          : look === "stopping"
            ? this._flame(272, 156, 0.18, 0.55)
            : nothing;
    const pelletFill = HOPPER_FILL[pellet.key];
    const stateFont = d.state.length > 5 ? 10.5 : 14;
    return html`
      <svg class="polyfig ${look}" viewBox="0 0 360 262" role="img" aria-label="Caldaia a pellet Polygon">
        <defs>
          <linearGradient id="pf-corpo" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2b2b31" /><stop offset="0.6" stop-color="#1c1c21" /><stop offset="1" stop-color="#141418" /></linearGradient>
          <linearGradient id="pf-armadio" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#26262b" /><stop offset="1" stop-color="#1a1a1f" /></linearGradient>
          <linearGradient id="pf-vetro" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#05080f" /><stop offset="1" stop-color="#1e293b" /></linearGradient>
          <radialGradient id="pf-bagliore" cx="0.5" cy="0.9" r="0.7"><stop offset="0" stop-color="#f97316" stop-opacity=${glow} /><stop offset="1" stop-color="#f97316" stop-opacity="0" /></radialGradient>
          <linearGradient id="fiamma" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#f59e0b" /><stop offset="0.55" stop-color="#f97316" /><stop offset="1" stop-color="#dc2626" /></linearGradient>
        </defs>
        <!-- corpo della caldaia (a destra, piu' alto) -->
        <rect x="196" y="6" width="152" height="224" rx="5" fill="url(#pf-corpo)" stroke="#3b3b44" stroke-width="1.5" />
        <rect x="206" y="14" width="132" height="22" rx="11" fill="#334155" />
        <text x="272" y="29.5" font-size="11.5" font-weight="700" text-anchor="middle" fill="#e2e8f0">${d.since ? `ultimo cambio ${d.since}` : "ultimo cambio –"}</text>
        <rect x="212" y="48" width="120" height="126" rx="10" fill="url(#pf-vetro)" stroke="#94a3b8" stroke-width="2.5" />
        <rect x="212" y="48" width="120" height="126" rx="10" fill="url(#pf-bagliore)" />
        <g class="flicker">${flame}</g>
        <rect class="sp ${look}" x="206" y="188" width="62" height="28" rx="14" />
        <text class="spt ${look}" x="237" y="207" font-size=${stateFont} font-weight="700" text-anchor="middle">${d.state}</text>
        <text x="342" y="208" font-size="19" font-weight="700" text-anchor="end" fill="#f1f5f9">${fmt(d.water, 1)}<tspan font-size="11" font-weight="500" fill="#94a3b8"> °C</tspan></text>
        ${d.pump === null ? nothing : svg`${this._pumpIcon(215, 223, 6, d.pump)}<text class=${d.pump ? "pumplab on" : "pumplab"} x="225" y="226.3" font-size="9.5">circolatore</text>`}
        <!-- armadio del serbatoio (a sinistra) -->
        <g class="cabinet" role="button" tabindex="0" aria-label="Pellet nel serbatoio: aggiorna il conteggio" @click=${() => this._openPellet()} @keydown=${(ev: KeyboardEvent) => (ev.key === "Enter" || ev.key === " ") && this._openPellet()}>
          <rect x="10" y="56" width="178" height="174" rx="4" fill="url(#pf-armadio)" stroke="#3b3b44" stroke-width="1.5" />
          <rect x="10" y="56" width="178" height="9" rx="3" fill="#0f0f13" />
          <polygon points="22,72 96,72 60,120" fill="rgba(148,163,184,0.07)" /><polygon points="96,72 176,72 140,128 60,120" fill="rgba(148,163,184,0.04)" />
          <polygon points="22,72 60,120 28,176" fill="rgba(148,163,184,0.05)" /><polygon points="60,120 140,128 100,190 28,176" fill="rgba(148,163,184,0.08)" />
          <polygon points="140,128 176,72 176,180 100,190" fill="rgba(148,163,184,0.05)" /><polygon points="28,176 100,190 70,222 24,222" fill="rgba(148,163,184,0.06)" />
          <g transform="translate(26 74) scale(1.46)">${hopperShape(kg, "pf-clip")}</g>
          <g class="chartbtn" role="button" tabindex="0" aria-label="Grafici del pellet" @click=${(ev: Event) => { ev.stopPropagation(); this._openPelletCharts(); }}
            @keydown=${(ev: KeyboardEvent) => { if (ev.key === "Enter" || ev.key === " ") { ev.stopPropagation(); ev.preventDefault(); this._openPelletCharts(); } }}>
            <rect x="114" y="69" width="68" height="24" rx="12" />
            <polyline points="122,86 128,79 133,83 140,75" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            <text x="144" y="85" font-size="11" font-weight="700">Grafici</text>
          </g>
          <text x="104" y="138" font-size="28" font-weight="700" fill="#f1f5f9">${kg === null ? "–" : fmt(kg, 0)}<tspan font-size="13" font-weight="500" fill="#94a3b8"> kg</tspan></text>
          <text x="92" y="155" font-size="13" fill="#94a3b8">${days === null ? "" : dayText(days)}</text>
          <text x="76" y="171" font-size="9.5" fill="#94a3b8">${fullDays === null ? "" : `(100% pellet ${dayText(fullDays)})`}</text>
          <text x="72" y="192" font-size="10.5" fill="#94a3b8">pellet</text>
          <rect x="72" y="197" width="58" height="20" rx="10" fill=${pelletFill} />
          <text x="101" y="211.5" font-size="11" font-weight="700" text-anchor="middle" fill="#ffffff">${pellet.label}</text>
        </g>
        <rect x="14" y="230" width="22" height="8" rx="2" fill="#0f0f13" /><rect x="320" y="230" width="22" height="8" rx="2" fill="#0f0f13" />
      </svg>
    `;
  }

  /**
   * Layout split a schede larghe: l'altezza della riga la decide la scheda della caldaia. La scheda completa della stufa, se e'
   * piu' alta, si rimpicciolisce in proporzione (non sotto il 60 %) invece di allungare la riga.
   */
  private _fitStufa = (): void => {
    const panel = this.renderRoot.querySelector<HTMLElement>(".stufapanel.fit");
    const box = panel?.querySelector<HTMLElement>(".stufafull");
    const card = this._stufaCard;
    if (!panel || !box || !card) return;
    const avail = panel.clientHeight;
    // altezza del contenuto: se sta nel pannello e' uguale all'altezza del pannello (le sezioni si distribuiscono), altrimenti e' maggiore
    const pad = card.shadowRoot?.querySelector<HTMLElement>(".pad");
    const natural = pad ? pad.scrollHeight : card.offsetHeight;
    if (!avail || !natural) return;
    const fit = Math.max(0.6, Math.min(1, avail / natural));
    if (Math.abs(fit - this._fit) > 0.005) {
      this._fit = fit;
      box.style.setProperty("--fit", String(fit));
    }
  };

  /** Rimisura quando cambiano la scheda della caldaia, la scheda della stufa o il pannello. */
  private _observeFit(): void {
    const targets = [this.renderRoot.querySelector(".stove"), this.renderRoot.querySelector(".stufapanel.fit"), this._stufaCard].filter((x): x is Element => !!x);
    const same = targets.length === this._fitTargets.length && targets.every((t, i) => t === this._fitTargets[i]);
    if (!same) {
      this._fitRO?.disconnect();
      this._fitRO = new ResizeObserver(() => this._fitStufa());
      for (const t of targets) this._fitRO.observe(t);
      this._fitTargets = targets;
    }
    this._fitStufa();
  }

  /** Legge dall'integrazione stufa_pellet gli id delle entità; se non c'è la sintesi non compare. */
  private async _loadStufa(): Promise<void> {
    this._stufaLoading = true;
    try {
      const opt = this._config.stufa;
      const cfg = typeof opt === "object" && opt !== null ? opt : {};
      const msg: Record<string, unknown> = { type: "stufa_pellet/info", ...(cfg.entry_id ? { entry_id: cfg.entry_id } : {}) };
      const info = (await (this.hass as unknown as { callWS(m: Record<string, unknown>): Promise<unknown> }).callWS(msg)) as StufaInfoLite | null;
      this._stufa = info && info.entities && info.sources ? info : null;
    } catch {
      this._stufa = null;
    } finally {
      this._stufaLoadedAt = Date.now();
      this._stufaLoading = false;
    }
  }

  /** Accensione o spegnimento della stufa: chiede conferma in una finestra e poi comanda l'interruttore. */
  private _stufaPress(): void {
    const sw = this._stufa?.sources.switch;
    if (!sw) return;
    const on = this.hass.states[sw]?.state === "on" ? true : this.hass.states[sw]?.state === "off" ? false : null;
    const btn = stufaButton(on, false);
    if (btn.action === "none") return;
    const run = () => void this.hass.callService("homeassistant", btn.action === "on" ? "turn_on" : "turn_off", { entity_id: sw });
    if (btn.action === "on") this._ask("Accendere la stufa?", ["Chiude l'interruttore: la stufa a pellet si accende e parte la sua sequenza di accensione."], "Accendi", false, run);
    else this._ask("Spegnere la stufa?", ["Apre l'interruttore: la stufa a pellet inizia lo spegnimento."], "Spegni", true, run);
  }

  /** Popup con la programmazione settimanale della caldaia (caldaia-schedule-card), senza passare da altri pop-up della dashboard. */
  private _openSchedule(): void {
    if (this._scheduleDlg) return;
    const opt = this._config.schedule;
    const d = document.createElement("impianto-card-dialog") as ImpiantoCardDialog;
    d.hass = this.hass;
    d.tag = "caldaia-schedule-card";
    d.label = "Programmazione caldaia";
    d.wide = true;
    d.config = typeof opt === "object" && opt !== null ? opt : {};
    d.addEventListener("closed", () => {
      this._scheduleDlg = undefined;
    });
    document.body.appendChild(d);
    this._scheduleDlg = d;
  }

  /** Popup con la scheda completa della stufa (stufa-pellet-card, dell'integrazione stufa_pellet). */
  private _openStufa(): void {
    if (this._stufaDlg || !customElements.get("stufa-pellet-card")) return;
    const opt = this._config.stufa;
    const cfg = typeof opt === "object" && opt !== null ? opt : {};
    const d = document.createElement("impianto-card-dialog") as ImpiantoCardDialog;
    d.hass = this.hass;
    d.tag = "stufa-pellet-card";
    d.label = "Stufa a pellet";
    d.config = { ...(cfg.entry_id ? { entry_id: cfg.entry_id } : {}), ...(cfg.title ? { title: cfg.title } : {}) };
    d.addEventListener("closed", () => {
      this._stufaDlg = undefined;
    });
    document.body.appendChild(d);
    this._stufaDlg = d;
  }

  /** Sintesi della stufa a pellet: stato, modo, potenza, accensione manuale e pulsante della scheda completa. */
  /** Layout split: la scheda completa della stufa (stufa-pellet-card) incorporata, senza pulsante e popup. */
  private _stufaEmbedded() {
    if (!customElements.get("stufa-pellet-card")) return this._waited ? this._missingBox("Stufa a pellet", "stufa-pellet-card") : nothing;
    const opt = this._config.stufa;
    const cfg = typeof opt === "object" && opt !== null ? opt : {};
    const key = JSON.stringify(cfg) + this._config.layout;
    if (!this._stufaCard || this._stufaCardKey !== key) {
      const el = document.createElement("stufa-pellet-card") as HTMLElement & { hass: HomeAssistant; setConfig(c: Record<string, unknown>): void };
      // nel layout split la scheda sta accanto a boiler e caldaia, della stessa altezza: versione compatta
      el.setConfig({ type: "custom:stufa-pellet-card", ...(this._config.layout === "split" ? { compact: true } : {}), ...(cfg.entry_id ? { entry_id: cfg.entry_id } : {}), ...(cfg.title ? { title: cfg.title } : {}) });
      this._stufaCard = el;
      this._stufaCardKey = key;
    }
    this._stufaCard.hass = this.hass;
    return html`<div class=${this._config.layout === "split" && this._wide && this._sections.caldaia ? "stufapanel fit" : "stufapanel"}><div class="stufafull">${this._stufaCard}</div></div>`;
  }

  private _renderStufa() {
    if (this._config.stufa && this._config.layout === "split") return this._stufaEmbedded();
    const info = this._stufa;
    if (!this._config.stufa || !info) return nothing;
    const st = info.entities.stato ? this.hass.states[info.entities.stato] : undefined;
    const key = stufaKey(st?.state);
    const attrs = (st?.attributes ?? {}) as Record<string, unknown>;
    const power = toNumber(String(attrs.potenza ?? "")) ?? toNumber(this.hass.states[info.sources.power_sensor]?.state);
    const sinceRaw = attrs.da as string | null | undefined;
    const since = sinceRaw && key !== "non_disponibile" ? sinceText(Date.now() - Date.parse(sinceRaw)) : "";
    const modeRaw = info.entities.modo ? this.hass.states[info.entities.modo]?.state : undefined;
    const sw = info.sources.switch;
    const swRaw = sw ? this.hass.states[sw]?.state : undefined;
    const btn = stufaButton(swRaw === "on" ? true : swRaw === "off" ? false : null, false);
    const cls = btn.action === "none" ? "sbtn off" : swRaw === "on" ? "sbtn stop" : "sbtn";
    return html`
      <section class="stufa">
        <h3>${(typeof this._config.stufa === "object" && this._config.stufa.title) || info.title || "Stufa a pellet"}</h3>
        <div class="mid">
          <div class="sumstate">
            <span class="statepill st-${key}">${STUFA_LABEL[key]}</span>
            <span class="since">${since}</span>
          </div>
          ${modeRaw && STUFA_MODE_LABEL[modeRaw] ? html`<div class="sumrow"><span class="tl">Modo</span><b>${STUFA_MODE_LABEL[modeRaw]}</b></div>` : nothing}
          <div class="sumrow"><span class="tl">Potenza</span><b>${power === null ? "–" : `${fmt(power, power % 1 ? 1 : 0)} W`}</b></div>
        </div>
        ${sw
          ? html`<button class=${cls} ?disabled=${btn.action === "none"} @click=${() => this._stufaPress()}>
              <span>${btn.label}</span>${btn.sub ? html`<small>${btn.sub}</small>` : nothing}
            </button>`
          : nothing}
        ${customElements.get("stufa-pellet-card")
          ? html`<button class="more full" @click=${() => this._openStufa()} aria-label="Apri la scheda completa della stufa">Scheda completa ▸</button>`
          : nothing}
      </section>
    `;
  }

  render() {
    if (!this._config || !this.hass) return nothing;
    const sec = this._effectiveSections();
    const thermo = sec.termostato ? this._renderThermostat() : nothing;
    // le stanze hanno il loro interruttore (rooms: false), non seguono piu' il termostato
    const rooms = this._renderRooms();
    const stufa = sec.stufa ? this._renderStufa() : nothing;
    const split = this._config.layout === "split";
    // senza la scheda della caldaia (dove sta l'ingranaggio) le preferenze restano raggiungibili da una barra in alto
    const gear = !sec.caldaia && this._config.settings !== false;
    const head = html`${this._config.title || gear
      ? html`<div class="topbar">
          <div class="ctitle">${this._config.title ?? ""}</div>
          ${gear
            ? html`<button class="gearbtn" title="Preferenze impianto" aria-label="Preferenze impianto" @click=${() => this._openSettings()}>
                <ha-icon icon="mdi:cog-outline"></ha-icon>
              </button>`
            : nothing}
        </div>`
      : nothing}`;
    if (split) {
      // colonne: una per ogni scheda mostrata (boiler, caldaia, stufa), con le stesse proporzioni di prima
      const cols = [sec.boiler ? "minmax(0,1fr)" : "", sec.caldaia ? "minmax(0,1.15fr)" : "", sec.stufa && stufa !== nothing ? "minmax(0,1fr)" : ""].filter(Boolean);
      const cards = cols.length > 0;
      return html`
        <ha-card>
          ${head}
          <div class="layout split" style=${cards ? `--cols: ${cols.join(" ")}` : ""}>
            ${sec.boiler ? html`<section class="boilerpanel">${this._renderBoiler()}</section>` : nothing}
            ${sec.caldaia ? this._renderStove() : nothing}
            ${stufa}
            ${thermo === nothing && rooms === nothing
              ? nothing
              : html`<div class=${thermo !== nothing && rooms !== nothing ? "splitthermo two" : "splitthermo"}>${thermo}${rooms}</div>`}
          </div>
        </ha-card>
      `;
    }
    const right = html`${sec.caldaia ? (stufa === nothing ? this._renderStove() : html`<div class="stoverow">${this._renderStove()}${stufa}</div>`) : stufa}${thermo}${rooms}`;
    const hasRight = sec.caldaia || stufa !== nothing || thermo !== nothing || rooms !== nothing;
    const two = sec.boiler && hasRight;
    return html`
      <ha-card>
        ${head}
        <div class=${two ? "layout" : "layout solo"}>${sec.boiler ? this._renderBoiler() : nothing}${hasRight ? html`<div class="rightcol">${right}</div>` : nothing}</div>
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
    /* opzione color: la tinta si mescola allo sfondo della scheda del tema (vale uguale su tema chiaro e scuro); i pannelli dentro hanno il loro sfondo e non cambiano */
    :host([tinted]) ha-card {
      background: color-mix(in srgb, var(--ir-tint) 30%, var(--ha-card-background, var(--card-background-color, #fff)));
      border: 1px solid color-mix(in srgb, var(--ir-tint) 55%, transparent);
    }
    /* layout split: la scheda della caldaia in versione compatta (tessere in una riga, contatori, richieste e salvaguardia piu' stretti) */
    .layout.split .stove {
      padding: 10px 12px;
      border-radius: 20px;
    }
    .layout.split .stove h3 {
      font-size: 15px;
    }
    .layout.split .shead {
      margin: 0 0 6px;
    }
    .layout.split .tiles {
      grid-template-columns: repeat(4, 1fr);
      gap: 4px;
      margin-top: 6px;
    }
    .layout.split .tile {
      padding: 3px 7px;
      border-radius: 8px;
    }
    .layout.split .tile .tl {
      font-size: 10.5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .layout.split .tile .tv {
      font-size: 14px;
    }
    .layout.split .counters {
      margin-top: 6px;
      padding: 3px 10px;
      display: flex;
      align-items: baseline;
      gap: 10px;
    }
    .layout.split .counters > div {
      font-size: 13px;
      gap: 2px 14px;
    }
    .layout.split .chips {
      margin-top: 6px;
      gap: 6px;
    }
    .layout.split .chip {
      flex-direction: row;
      justify-content: center;
      gap: 6px;
      padding: 2px 4px;
      border-radius: 14px;
    }
    .layout.split .chip b {
      font-size: 13px;
    }
    /* pulsanti nel titolo della scheda della caldaia: programmazione e preferenze */
    .hbtns {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: none;
    }
    .gearbtn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      min-height: 36px;
      margin: -10px 0;
      padding: 0;
      border-radius: 12px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color);
      color: var(--secondary-text-color);
      cursor: pointer;
    }
    .gearbtn ha-icon {
      --mdc-icon-size: 20px;
    }
    .gearbtn:hover {
      border-color: var(--primary-color, #03a9f4);
      color: var(--primary-text-color);
    }
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .ctitle {
      font-size: 20px;
      font-weight: 700;
      margin: 4px 4px 8px;
    }
    .topbar .gearbtn {
      margin: 0 0 4px auto;
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
      .layout.solo {
        grid-template-columns: minmax(0, 1fr);
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
    .clesstint { mix-blend-mode: color; opacity: 0.85; }
    .clessflow { fill: none; stroke: #ffffff; stroke-opacity: 0.85; stroke-width: 7; stroke-linecap: round; stroke-dasharray: 14 30; animation: clessflow 1s linear infinite; }
    @keyframes clessflow { to { stroke-dashoffset: -44; } }
    .cutpipe { fill: var(--card-background-color, #fff); stroke-width: 2.6; }
    .plate { fill: #64748b; }
    .radbody { fill: var(--secondary-background-color, #e5e5e5); stroke: var(--secondary-text-color, #727272); stroke-width: 2; }
    .radfin { stroke: var(--secondary-text-color, #727272); stroke-width: 2; opacity: 0.6; }
    .stub { fill: #334155; stroke: #64748b; stroke-width: 1.5; }
    .tube { fill: none; stroke: #94a3b8; stroke-width: 3; }
    .tubefill { fill: rgba(255, 255, 255, 0.2); }
    .inpipe { fill: none; stroke-width: 4; stroke-linecap: round; }
    .inpipe.hot { stroke: #ef4444; }
    .inpipe.cold { stroke: #3b82f6; }
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
    .pumpring {
      fill: rgba(100, 116, 139, 0.12);
      stroke: #64748b;
      stroke-width: 1.4;
    }
    .pumprotor path {
      fill: none;
      stroke: #64748b;
      stroke-width: 1.6;
      stroke-linecap: round;
    }
    .pumphub {
      fill: #64748b;
    }
    .pump.on .pumpring {
      fill: rgba(34, 197, 94, 0.16);
      stroke: #22c55e;
    }
    .pump.on .pumprotor path {
      stroke: #22c55e;
    }
    .pump.on .pumphub {
      fill: #22c55e;
    }
    .pump.on .pumprotor {
      transform-origin: 0 0;
      animation: pumpspin 0.9s linear infinite;
    }
    @keyframes pumpspin {
      to {
        transform: rotate(360deg);
      }
    }
    .pumplab {
      fill: #64748b;
    }
    .pumplab.on {
      fill: #86efac;
    }
    @media (prefers-reduced-motion: reduce) {
      .coilflow,
      .pulse,
      .pump.on .pumprotor {
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
      /* le regole di larghezza (tessere su due colonne) guardano la scheda della caldaia, non l'intera scheda */
      container-type: inline-size;
    }
    .stove h3 {
      margin: 0;
      font-size: 17px;
    }
    .shead {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin: 0 0 12px;
    }
    .shead:has(.hbtns) {
      justify-content: space-between;
    }
    /* pulsante alto 36 px senza alzare la riga del titolo */
    .progbtn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      flex: none;
      min-height: 36px;
      margin: -10px 0;
      padding: 4px 12px;
      border-radius: 12px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font: inherit;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    .progbtn ha-icon {
      --mdc-icon-size: 18px;
      color: var(--primary-color, #03a9f4);
    }
    .progbtn:hover {
      border-color: var(--primary-color, #03a9f4);
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
    .rightcol {
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-width: 0;
    }
    /* prova: layout "split": boiler, caldaia e stufa in tre schede alte uguali, termostato in una striscia sotto */
    .layout.split {
      grid-template-columns: 1fr;
    }
    .boilerpanel {
      background: var(--secondary-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 20px;
      padding: 8px 6px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-width: 0;
    }
    .splitthermo {
      min-width: 0;
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 12px;
    }
    .roomsbox {
      min-width: 0;
    }
    .missingbox {
      background: var(--secondary-background-color);
      border: 1px dashed var(--divider-color);
      border-radius: 20px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: flex-start;
      justify-content: center;
      font-size: 14px;
      color: var(--secondary-text-color);
      min-width: 0;
    }
    .missingbox b {
      color: var(--primary-text-color);
      font-size: 15px;
    }
    .missingbox .missingdiag {
      font-size: 12px;
      font-family: monospace;
      word-break: break-word;
    }
    .missingbox button {
      min-height: 44px;
      border-radius: 22px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color);
      color: var(--primary-text-color);
      padding: 0 18px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    }
    /* scheda completa della stufa: stesso sfondo, bordo e angoli delle altre schede; le tessere prendono il colore delle tessere della caldaia */
    .stufapanel {
      background: var(--secondary-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 20px;
      overflow: hidden;
      min-width: 0;
    }
    .stufapanel.fit {
      position: relative;
    }
    /* a schede larghe la scheda della stufa non allunga la riga: sta nel pannello, scalata se serve (--fit) */
    .stufapanel.fit .stufafull {
      position: absolute;
      top: 0;
      left: 0;
      width: calc(100% / var(--fit, 1));
      height: calc(100% / var(--fit, 1));
      transform: scale(var(--fit, 1));
      transform-origin: top left;
    }
    .stufafull {
      min-width: 0;
      --ha-card-background: transparent;
      --ha-card-box-shadow: none;
      --ha-card-border-width: 0px;
      --secondary-background-color: var(--card-background-color);
    }
    @container (min-width: 1150px) {
      .layout.split {
        grid-template-columns: var(--cols, minmax(0, 1fr) minmax(0, 1.15fr) minmax(0, 1fr));
        align-items: stretch;
      }
      .layout.split > .splitthermo {
        grid-column: 1 / -1;
      }
      /* con le stanze il termostato sta su meta' riga e la scheda delle stanze sull'altra meta' */
      .layout.split > .splitthermo.two {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        align-items: stretch;
      }
      .layout.split svg.boiler {
        margin: 0 auto;
      }
      .layout.split svg.boiler .tv {
        font-size: 19px;
      }
    }
    /* le coppie etichetta/valore dello stato: nel layout normale restano figli diretti della griglia */
    .scp {
      display: contents;
    }
    /* figura Polygon del layout split */
    .top.figure {
      display: block;
    }
    .polyfig {
      display: block;
      width: 100%;
      max-width: 520px;
      margin: 0 auto;
      height: auto;
    }
    .polyfig .cabinet {
      cursor: pointer;
      outline: none;
    }
    .polyfig .chartbtn {
      cursor: pointer;
    }
    .polyfig .chartbtn rect {
      fill: #334155;
      stroke: #64748b;
      stroke-width: 1;
    }
    .polyfig .chartbtn polyline {
      stroke: #fbbf24;
    }
    .polyfig .chartbtn text {
      fill: #e2e8f0;
    }
    .polyfig .chartbtn:hover rect,
    .polyfig .chartbtn:focus-visible rect {
      fill: #475569;
      stroke: #fbbf24;
    }
    .polyfig .cabinet:hover > rect:first-child,
    .polyfig .cabinet:focus-visible > rect:first-child {
      stroke: var(--primary-color, #03a9f4);
    }
    .polyfig .flicker {
      transform-origin: 272px 156px;
    }
    .polyfig.work .flicker,
    .polyfig.start .flicker {
      animation: flicker 1.6s ease-in-out infinite;
    }
    @media (prefers-reduced-motion: reduce) {
      .polyfig .flicker {
        animation: none !important;
      }
    }
    .sp {
      fill: rgba(148, 163, 184, 0.28);
    }
    .sp.work {
      fill: rgba(34, 197, 94, 0.28);
    }
    .sp.start,
    .sp.wait {
      fill: rgba(245, 158, 11, 0.3);
    }
    .sp.stopping {
      fill: rgba(96, 165, 250, 0.3);
    }
    .spt {
      fill: #cbd5e1;
    }
    .spt.work {
      fill: #4ade80;
    }
    .spt.start,
    .spt.wait {
      fill: #fbbf24;
    }
    .spt.stopping {
      fill: #93c5fd;
    }
    /* prova: sintesi della stufa a pellet a destra della scheda della caldaia (sotto 1150 px una sopra l'altra) */
    .stoverow {
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-width: 0;
    }
    @container (min-width: 1150px) {
      .stoverow {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 164px;
        align-items: stretch;
      }
    }
    .stufa {
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: var(--secondary-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 20px;
      padding: 14px;
    }
    .stufa h3 {
      margin: 0;
      text-align: center;
      font-size: 17px;
    }
    .sumstate {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .statepill.st-spenta {
      background: rgba(107, 114, 128, 0.25);
    }
    .statepill.st-accensione {
      background: rgba(245, 158, 11, 0.25);
      color: #f59e0b;
    }
    .statepill.st-accesa {
      background: rgba(239, 68, 68, 0.22);
      color: #ef4444;
    }
    .statepill.st-spegnimento {
      background: rgba(96, 165, 250, 0.25);
      color: #60a5fa;
    }
    .statepill.st-non_disponibile {
      background: rgba(220, 38, 38, 0.2);
      color: #dc2626;
    }
    .sumrow {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .stufa .statepill {
      white-space: nowrap;
      font-size: 15px;
      padding: 3px 12px;
    }
    .stufa .mid {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 10px;
    }
    @container (min-width: 1150px) {
      .stufa .sumrow {
        flex-direction: column;
        gap: 0;
        text-align: center;
      }
      .stufa .sumrow b {
        font-size: 15px;
      }
    }
    .sbtn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      min-height: 52px;
      padding: 8px 12px;
      border: none;
      border-radius: 14px;
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
      font: inherit;
      font-size: 17px;
      font-weight: 700;
      cursor: pointer;
    }
    .sbtn small {
      font-size: 12.5px;
      font-weight: 400;
      opacity: 0.9;
    }
    .sbtn.stop {
      background: #ef4444;
    }
    .sbtn.armed {
      background: #f59e0b;
    }
    .sbtn.off,
    .sbtn:disabled {
      background: var(--secondary-background-color);
      color: var(--secondary-text-color);
      border: 1px solid var(--divider-color);
      cursor: default;
    }
    .more.full {
      width: 100%;
      min-height: 44px;
    }
    .more {
      white-space: nowrap;
    }
    .alarmbar {
      display: flex;
      gap: 10px;
      align-items: baseline;
      margin-top: 8px;
      padding: 6px 12px;
      border-radius: 10px;
      background: rgba(239, 68, 68, 0.16);
      color: #ef4444;
      font-size: 14px;
    }
    .more {
      margin-left: auto;
      min-height: 36px;
      padding: 4px 12px;
      border-radius: 10px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font-size: 13px;
      cursor: pointer;
    }
    .counters {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .tiles {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-top: 12px;
    }
    /* scheda della caldaia stretta: le quattro tessere restano in una riga, con carattere piu' piccolo */
    @container (max-width: 520px) {
      .tiles {
        gap: 6px;
      }
      .tile {
        padding: 6px 8px;
      }
      .tile .tl {
        font-size: 10.5px;
      }
      .tile .tv {
        font-size: 15px;
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
  `;
}

customElements.define(CARD_TAG, ImpiantoOverviewCard);
