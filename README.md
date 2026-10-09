# Impianto riscaldamento dashboard

Due schede Lovelace per Home Assistant, pensate per un impianto con **boiler solare**, **puffer** e
**caldaia a pellet Micronova (Nobis Polygon)** letta dall'integrazione
[`aguaiot_hubcasale`](https://github.com/hubcasale/home_assistant_micronova_agua_iot_hubcasale):

| Scheda | Cosa fa |
|---|---|
| `impianto-overview-card` | Il boiler solare con temperatura alta e bassa, acqua in uscita e docce stimate; il puffer; la caldaia con fiamma piccola (accensione) o grande (in lavoro), stato, temperature, pressioni, contatori del giorno e le richieste del sistema di suggerimento. |
| `caldaia-schedule-card` | La programmazione settimanale della caldaia: 4 programmi con orari, giorni e set di temperatura, **vista settimanale a barre**, **avviso di sovrapposizione** e **preset** (feriale, weekend, vacanza…) con un tocco. |

Funzionano sia su tema chiaro che scuro (usano i colori del tema di Home Assistant) e si adattano al telefono.

![Tema scuro](docs/screenshot-scuro.png)
![Tema chiaro](docs/screenshot-chiaro.png)

> Gli screenshot vengono dal banco di prova (`dev/index.html`) con dati di esempio.
> Il lunedì P1 e P3 si sovrappongono apposta, per mostrare l'avviso.

## Puffer senza Internet

La temperatura del puffer arriva dal cloud Micronova e senza Internet diventa non disponibile. `sensor.puffer_temperatura_effettiva` (in `ha-packages/caldaia_integrazione_blocco.yaml`) usa la lettura della caldaia finché c'è; se manca da più di 5 minuti la ricava dalla sonda ESP32 in ingresso alla serpentina di integrazione con il modello `puffer = T_amb + (sonda − T_amb) / k` (k = 0,753 e T_amb = 19,7 °C, ricavati il 8/10/2026 da 747 letture a pompa in marcia: errore medio 0,8 °C). La sonda legge il puffer solo con la pompa in marcia: a pompa ferma il valore non è affidabile e la regola di blocco/forzatura **non interviene mai**. Sulla scheda il puffer compare con la scritta «stima sonda». Parametri regolabili: minuti di attesa, k e temperatura ambiente.

## Pannello solare sulla scheda

Sotto il puffer da 50 litri la scheda disegna la sagoma del pannello solare, collegata alla serpentina solare del boiler. Il colore segue la temperatura (come il boiler, poi più scuro oltre i 65 °C).
- **Temperatura mostrata:** a pompa del collettore ferma è la stima del collettore (`sensor.solare_termico_t_collettore_stimata`), con la pompa in marcia è la temperatura **misurata** in ingresso alla serpentina solare (`sensor.solare_termico_solare_serpentina_ingresso`, sonda ESP32).
- **Sui tubi** compaiono le temperature in ingresso e in uscita della serpentina solare; sulle linee «mandata» e «ritorno» del puffer quelle della serpentina di integrazione (sonde ESP32 `..._integrazione_serpentina_ingresso/uscita`).
- **Massima prevista del giorno** e **massima già raggiunta oggi**: `ha-packages/solare_pannello.yaml`. Il modello usa la previsione oraria di `weather.casale` (nuvolosità, temperatura, umidità), la posizione del sole, l'inclinazione e l'orientamento dei collettori, il modello di accoppiamento già in uso e, nelle prime ore, l'**irraggiamento misurato adesso** (rapporto fra irraggiamento sul piano e cielo sereno, con peso che scende in circa 2 ore). La massima prevista non scende mai sotto quella già raggiunta. È una stima del collettore a pompa ferma: con la pompa in marcia il fluido misurato resta più freddo.
- Entità nuove: `sensor.solare_pannello_temperatura`, `sensor.solare_pannello_massima_prevista`, `sensor.solare_pannello_massima_oggi`, `sensor.solare_previsione_oraria`. Il fattore `input_number.solare_pannello_fattore_sereno` (1,00) calibra l'irraggiamento a cielo sereno.
- **Telefono:** sotto il boiler compare una fascia con il puffer e il pannello, con le scritte più grandi (le temperature in ingresso e in uscita delle serpentine sono indicate con le frecce → e ←). Sulla scheda larga i tubi riportano solo le temperature; la tessera «Solare» a sinistra mostra i kW.

## Stima del consumo di pellet

`ha-packages/caldaia_pellet.yaml` stima i chili di pellet bruciati e la scheda li mostra sotto i contatori di oggi (oggi, settimana, mese). È una **stima** da calibrare: la caldaia non comunica i chili. Il modello usa lo stato e la potenza reale:
- **WORK:** consumo interpolato fra i due valori del costruttore (1,63 kg/h al 30 %, 5,6 kg/h al 100 %) in base alla potenza reale (30 % al minimo, 100 % al massimo);
- **STAND BY e STOP:** consumo di mantenimento (0,2 kg/h, ipotesi);
- **ogni accensione** (ingresso in START): 200 g (ipotesi);
- ECO STOP, OFF e WAIT: nessun consumo.

Per tarare: dividi i chili di pellet realmente consumati in un periodo (sacchi aperti e finiti) per la stima dello stesso periodo e inserisci il risultato come fattore di taratura nelle preferenze (sezione «Consumo di pellet», ripiegata). Entità: `sensor.caldaia_pellet_oggi`, `_settimana`, `_mese` (si azzerano da sole), `sensor.caldaia_pellet_stimato_totale`, `sensor.caldaia_pellet_consumo_istantaneo` (kg/h).

Sui dati dal 2 al 6 ottobre 2026 il modello dà circa 2-6 kg al giorno, con poche ore in lavoro e molte accensioni.

## Preferenze dalla scheda dell'impianto

Il pulsante a forma di ingranaggio in alto a destra sulla scheda dell'impianto apre una finestra con le impostazioni degli helper di Home Assistant: blocco automatico e accensione forzata della pompa di integrazione, le differenze di temperatura che decidono quando bloccare o sbloccare, la temperatura massima della testa del boiler con la sua isteresi, la temperatura dell'acqua della caldaia (`climate.casale_acqua`) e il setpoint del puffer da 50 litri (`number.casale_setpoint_boiler`), la salvaguardia delle accensioni e (ripiegata) la misura delle pompe con le sue soglie. Ogni modifica è attiva subito e resta anche dopo un riavvio. Le impostazioni i cui helper non esistono (pacchetto non installato) non compaiono. Per nascondere il pulsante: `settings: false` nella configurazione della scheda.

## Installazione

### HACS (repository personalizzato)

1. HACS → menu a tre punti → **Repository personalizzati** → incolla
   `https://github.com/hubcasale/impianto-riscaldamento-dashboard`, categoria **Dashboard**.
2. Installa **Impianto riscaldamento dashboard**.
3. Aggiungi le schede a una dashboard (vedi `examples/dashboard.yaml`).

### A mano

1. Copia `dist/impianto-riscaldamento-dashboard.js` in `<config>/www/`.
2. Impostazioni → Dashboard → Risorse → aggiungi `/local/impianto-riscaldamento-dashboard.js` come **Modulo JavaScript**.
3. Ricarica la dashboard.

## `impianto-overview-card`

```yaml
type: custom:impianto-overview-card
title: Impianto acqua calda      # facoltativo
```

Senza altro usa questi nomi di entità (cambiali in `entities:` se i tuoi sono diversi):

| Chiave | Entità predefinita | Da dove viene |
|---|---|---|
| `boiler_top` | `sensor.boiler_solare_alto_stimato` | `ha-packages/boiler_solare.yaml` |
| `boiler_bottom` | `sensor.boiler_solare_basso_stimato` | idem |
| `outlet` | *(assente: si usa la sonda alta)* | temperatura dell'acqua in uscita, se la misuri |
| `solar_power`, `collector_temp` | `sensor.solare_termico_potenza`, `sensor.solare_termico_t_collettore_stimata` | pacchetto solare termico |
| `puffer`, `stove_state`, `stove_water`, `smoke`, `flame`, `power`, `water_pressure`, `brazier_pressure`, `extractor`, `pump`, `alarm` | `sensor.casale_*` | integrazione `aguaiot_hubcasale` |
| `set_boiler`, `set_water` | `number.casale_setpoint_boiler`, `climate.casale_acqua` (attributo `temperature`) | integrazione |
| `pellet_reserve`, `pellet_empty`, `pellet_open` | `binary_sensor.casale_riserva_legna` (riserva: sta per finire), `binary_sensor.casale_pellet_empty` (vuoto), `binary_sensor.casale_pellet_hopper_open` (serbatoio aperto) | integrazione `aguaiot_hubcasale` v1.2.7-hubcasale.4 (gli ultimi due) |
| `integration_pump`, `collector_pump` | `binary_sensor.caldaia_pompa_integrazione_attiva`, `binary_sensor.caldaia_pompa_collettore_attiva` | `ha-packages/caldaia_pompe_centralina.yaml` (dalla potenza della centralina solare) |
| `integration_power`, `collector_power` | `sensor.garage_bs_pompa_integrazione_potenza` (Shelly 1PM), `sensor.garage_centralina_solare_pompe_potenza` (Shelly EM Mini sull'alimentazione dell'Elios) | i watt accanto alle pompe in marcia |
| `integration_call`, `integration_block_enabled`, `integration_block_wanted` | `binary_sensor.garage_bs_pompa_integrazione_ingresso_0`, `input_boolean.caldaia_integrazione_blocco_attivo`, `binary_sensor.caldaia_integrazione_inutile` | `ha-packages/caldaia_integrazione_blocco.yaml`: la scritta arancione «integrazione bloccata» compare quando il blocco è acceso, la regola lo chiede e l'Elios chiama la pompa |
| `starts_today`, `starts_yesterday`, `standby_today`, `work_hours_today` | `sensor.caldaia_*` | `ha-packages/caldaia_suggerimento.yaml` |
| `request_acs`, `request_heating`, `consent` | `binary_sensor.caldaia_richiesta_acs` … | idem |

Il numero di **docce** si calcola con un modello a due zone: la parte alta del serbatoio (quota `top_share`)
è alla temperatura della sonda alta, il resto a quella della sonda bassa; ogni zona sopra la temperatura
della doccia dà `litri × (T − T_rete) / (T_doccia − T_rete)`. Parametri (numero o id di entità):

```yaml
model:
  volume: 190          # litri utili (predefinito: input_number.boiler_solare_volume)
  top_share: 50        # % di volume della zona alta (predefinito: input_number.boiler_solare_peso_alto)
  mains_temp: 15       # °C acqua di rete (predefinito: input_number.boiler_solare_t_rete)
  shower_volume: 40    # litri per doccia
  shower_temp: 38      # °C della doccia
```

Sotto i 560 px di larghezza il disegno del boiler perde il puffer (resta nelle tessere) per restare leggibile.

**Modalità compatta** (`compact: auto | true | false`, predefinito `auto`): sugli schermi larghi ma bassi (tablet, altezza sotto 850 px)
la scheda si riduce per stare in una schermata: boiler ridimensionato all'altezza dello schermo, caldaia più bassa (tessere su 4 colonne, stato su una riga, contatori e richieste più stretti), tutti i dati restano; sparisce solo la legenda delle fiamme.
Per forzarla o escluderla: `compact: true` / `compact: false`.

## `caldaia-schedule-card`

```yaml
type: custom:caldaia-schedule-card
title: Programmazione caldaia     # facoltativo
prefix: casale                    # prefisso delle entità dell'integrazione
hide: [weekly]                    # facoltativo: nasconde "weekly" e/o "presets"
```

Usa le entità create dall'integrazione, per ogni programma N da 1 a 4:
`time.casale_crono_pN_accensione`, `time.casale_crono_pN_spegnimento`,
`number.casale_crono_pN_setpoint_boiler`, `number.casale_crono_pN_setpoint_acqua`,
`switch.casale_crono_pN_<giorno>` (lunedi … domenica) e l'interruttore generale
`switch.casale_cronotermostato_settimanale`.

- **Orari a passi di 10 minuti** (come la caldaia). Spegnimento `00:00` = fino a mezzanotte.
- **Sovrapposizioni**: se due programmi attivi si incrociano nello stesso giorno compare un avviso in alto e la
  fascia è tratteggiata in rosso nella vista settimanale. Fasce che si toccano soltanto non contano; un programma
  che scavalca la mezzanotte occupa anche il giorno dopo.
- **Vista settimanale**: una riga per giorno, con la linea dell'ora attuale.
- Le modifiche sono scritte subito. I campi si attenuano finché la caldaia non conferma (passa dal cloud, può
  servire qualche minuto).

### Preset

Quattro preset predefiniti: *Settimana tipo*, *Feriale*, *Weekend*, *Vacanza*. Toccando un preset la scheda
mostra **che cosa cambierebbe** e chiede conferma; applica solo le differenze. Si possono sostituire:

```yaml
presets:
  - name: Mattina e sera
    icon: mdi:weather-sunset
    description: Dalle 5:30 alle 8 e dalle 17 alle 22:30
    crono: true                 # true/false = attiva/disattiva il cronotermostato; assente = non toccarlo
    programs:
      "1": { on: "05:30", off: "08:00", days: [lun, mar, mer, gio, ven, sab, dom], set_boiler: 45, set_water: 65 }
      "2": { on: "17:00", off: "22:30", days: [lun, mar, mer, gio, ven, sab, dom] }
      "3": null                 # null (o days: []) = programma disattivato
      # "4" non elencato = resta com'è
```

I giorni si scrivono in italiano o inglese, corti o lunghi (`lun`, `mon`, `lunedì`…).

## Pacchetti di Home Assistant e ESPHome

Le schede leggono sensori che qui sono forniti come esempio:

- `ha-packages/boiler_solare.yaml`: temperature stimate alta e bassa (con una correzione provvisoria di accoppiamento rispetto alla centralina
  solare, vedi `docs/MEMORIA.md`), media, stratificazione, energia accumulata e acqua calda equivalente.
- `ha-packages/caldaia_suggerimento.yaml`: suggerimento informativo di accendere o no la caldaia, contatori di
  accensioni e ore in lavoro. **Non comanda niente.**
- `ha-packages/caldaia_tempo_acqua.yaml`: misura quanti minuti servono, dopo un'accensione a freddo, per portare il boiler solare
  alla temperatura d'uso e ne fa la media (ultimi 10 campioni, correggibili a mano).
- `ha-packages/caldaia_pompe_centralina.yaml`: dalla potenza totale della centralina solare (`sensor.garage_centralina_solare_pompe_potenza`) ricava quale pompa gira (ferme sotto 15 W, solo collettore fino a 42 W, solo integrazione tra 42 e 65 W, entrambe da 65 W; soglie modificabili, tarate sulle misure del 5/10/2026) e le ore di funzionamento di oggi.
- `ha-packages/caldaia_accensione_rapida.yaml`: pulsante **Avvia caldaia** per quando serve acqua calda e la Polygon è spenta,
  con spegnimento automatico (vedi sotto) e la stima `sensor.caldaia_acqua_pronta_tra`.
- `esphome/solare-termico.yaml`: ESP32 con ADS1115 e sonde NTC 10k B3950 (serpentine) e due sonde sul boiler.

## Spegnimento con nessuno in casa

`ha-packages/caldaia_assenza.yaml`. La presenza viene dai quattro iPhone di iCloud3 (`device_tracker.iphone_camilla/corrado/matilde/roberta`) **e** dal Wi-Fi: nessun iPhone deve risultare connesso a `CASALE2G` (i `device_tracker` del router hanno l'attributo `ssid`). Se una delle due fonti non è disponibile non si considera nessuno fuori. Dopo 60 minuti di assenza (regolabili) la Polygon accesa viene fermata, tranne con termostato che chiede calore, modalità ospiti, accensione rapida, gelo (meno di 5 °C fuori) o caldaia già spenta o in allarme. Al rientro si riaccende solo se un programma è attivo in quel momento. Interruttore: `input_boolean.caldaia_assenza_attiva`; ospiti: `input_boolean.caldaia_assenza_ospiti`.

## Accensione rapida

Sulla scheda panoramica, sotto la sonda alta, ci sono i minuti stimati per avere l'acqua a temperatura d'uso
(0 se lo è già) e il pulsante. Il pulsante chiede una **conferma** (secondo tocco entro 4 secondi) e funziona solo se:
la Polygon è spenta (OFF), non c'è allarme, la sonda alta stimata è sotto la temperatura d'uso (45 °C), il puffer non è
già sopra la soglia (50 °C) e non si è superato il limite di accensioni rapide del giorno (2).

Quando la caldaia ha lavorato e va in **ECO STOP**, viene spenta per non farla riaccendere, a meno che altro la debba
tenere accesa: il termostato dei radiatori che chiama calore o un programma della Polygon attivo in quel momento.
Si spegne quando il puffer scende sotto la soglia (e l'acqua è a temperatura) oppure dopo la durata massima (2 ore).
Lo spegnimento avviene solo in ECO STOP, mai durante START o WORK. Un tocco su **Annulla** interrompe la richiesta.

## Documentazione

- [`docs/MEMORIA.md`](docs/MEMORIA.md): come funziona il sistema, scelte fatte, entità, cose da verificare.
- [`docs/schema-cablaggio.png`](docs/schema-cablaggio.png): schema dei collegamenti dello Shelly 1PM sulla pompa di integrazione (Elios OUT2 come segnale).
- [`docs/funzionamento.png`](docs/funzionamento.png): diagramma di flusso (accensione rapida, spegnimento, salvaguardia, misura dei tempi).

## Sviluppo

```bash
npm install
npm test            # prove della logica (programmazione, sovrapposizioni, preset, docce, pulsante)
python3 test-ha/test_templates.py   # prove offline dei template Home Assistant dell'accensione rapida
npm run typecheck
npm run build       # dist/impianto-riscaldamento-dashboard.js (da pubblicare nel repository)
npm run build:dev   # dev/bundle.js, poi apri dev/index.html nel browser
```

`dev/index.html` è un banco di prova con una finta Home Assistant (stati e servizi simulati):
`?tema=chiaro|scuro`, `?stato=WORK|START|ECO STOP|STAND BY`, `?larghezza=380`.

## Cose da sapere / limiti

- La scrittura dei **giorni** e degli **orari** passa dal cloud Micronova: va provata sulla propria caldaia
  (conviene su un programma libero, con il cronotermostato spento).
- La stima delle **docce** e le temperature "stimate" dipendono dalla taratura delle sonde.
- Niente editor visivo per ora: la configurazione è in YAML.

## Licenza

MIT
