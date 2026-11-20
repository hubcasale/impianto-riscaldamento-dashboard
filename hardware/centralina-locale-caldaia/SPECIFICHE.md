# Centralina del locale caldaia: scheda principale (revisione C, 20/11/2026)

Una scheda che sostituisce il proxy Bluetooth (ESP32-C3) e la scheda delle sonde (ESP32 + ADS1115) con un solo nodo ESPHome cablato
(Ethernet via powerline, niente Wi-Fi). Il display e' una scheda a parte sul coperchio, con il suo ESP32.

## Decisioni

- Componenti smd saldati dal produttore (stile JLCPCB: Gerber, distinta e posizioni); morsettiere a vite 5,08 mm.
- Scatola di derivazione 150 x 110 x 70 mm (esterne; internamente circa 130 x 90, con i pilastrini del coperchio agli angoli); barra DIN
  opzionale sul fondo (non cambia la scheda). Scheda 120 x 80 mm, 2 strati, 4 fori M3 a 4 mm dagli angoli.
- ESP32-S3 DevKitC-1 (N16R8, versione con antenna u.FL) su due prese femmina 1x22 a 2,54 mm, file a 22,86 mm (misurato dall'utente).
  Vista dall'alto: USB-C a destra, antenna a sinistra, fila J1 sotto (quasi tutti i segnali), fila J3 sopra (GPIO liberi).
- W5500: modulo ARCELI "W5500 Lite" (RJ45 HanRun HR961160C), solo 3,3 V, fuori dalla scheda e collegato con un cavo; si fissa nella
  scatola dove c'e' spazio davanti alla presa RJ45. Il cavo Ethernet entra da un pressacavo e si crimpa dopo.
  W5500 integrato sulla scheda: rimandato a una seconda versione (la spina RJ45 non ci sta nei 130 mm interni).
- Display: ELEGOO 2,8" "ESP32-32E" 240x320 touch resistivo (scheda con proprio ESP32, simile all'Elecrow E32R28T). E' un nodo ESPHome
  indipendente sul coperchio che fa solo il display (dati dal nodo principale via interfaccia web, o da Home Assistant); sonde e Bluetooth
  con la stufa restano sul nodo S3 nella scatola. Nessun pulsante fisico (touch).
- Cavi crimpati dall'utente (JST XH, passo 2,50 mm, spesso venduti come "XH2.54").

## Modulo W5500 Lite e cavo

Pin del modulo (dallo schema dell'annuncio; le sigle sono stampate sul modulo, da verificare sul tuo esemplare):

| Fila A (6 pin) | Fila B (6 pin) |
|---|---|
| GND | GND |
| GND | 3V3 |
| MOSI | 3V3 |
| SCLK | NC |
| CS | RST |
| INT | MISO |

Cavo: JST XH a 8 poli sulla scheda (connettore J20, con i nomi dei pin sulla serigrafia) e otto contatti Dupont singoli sul modulo:

| XH | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| Segnale | +3V3 | GND | SCLK | MISO | MOSI | CS | INT | RST |
| ESP32-S3 | regolatore U2 | GND | GPIO12 | GPIO13 | GPIO11 | GPIO10 | GPIO14 | GPIO17 |

Il 3,3 V viene da un regolatore dedicato sulla scheda (U2, AP2112K-3.3, 600 mA, alimentato dai 5 V): il modulo assorbe circa 130 mA e non
pesa sul DevKit. Cavo sotto i 15 cm, con un filo di GND vicino a SCLK, MOSI e MISO.

## Pin dell'ESP32-S3

| Funzione | GPIO |
|---|---|
| W5500: SCLK, MISO, MOSI | 12, 13, 11 |
| W5500: CS, INT, RST | 10, 14, 17 |
| I2C (ADS1115 e connettore J22, pull-up 4,7 kOhm a 3,3 V): SDA, SCL | 8, 9 |
| Sonde direttamente sull'ESP (S3 puffer alto, S2 puffer basso) | 4, 5 |
| Seriale verso il display (J21): TX, RX | 15, 16 |
| Sulla fila di pin liberi J23 | 1, 2, 38, 39, 40, 41, 42, 47, 48 |
| Liberi ma non portati fuori | 6, 7, 18, 21 |

Da evitare: 0, 3, 45, 46 (avvio), 19, 20 (USB), 43, 44 (seriale del log), 26-32 (flash), 35-37 (PSRAM octal). Su alcune versioni del DevKit
un LED RGB usa GPIO38 o 48.

## Blocchi della scheda

1. **Alimentazione 5 V** (J10, morsettiera): fusibile ripristinabile F1, TVS D1, MOSFET a canale P Q1 contro l'inversione di polarita',
   100 uF + 100 nF, LED di presenza. Il 5 V va al DevKit attraverso il diodo Schottky D2 (per non rientrare nella sua USB) e al display
   (J21). Alimentatore consigliato: 5 V, almeno 2 A.
2. **Regolatore del W5500** (U2) e connettore **J20**.
3. **ADS1115** (U1, indirizzo 0x48, ADDR a GND), VDD 3,3 V con 100 nF + 10 uF, pull-up I2C.
4. **6 canali sonda NTC 10k** (J11-J16): 3,3 V -> 10 kOhm 0,1 % -> nodo -> 100 nF a GND -> morsettiera (nodo, GND).
   J11-J14 sugli ingressi A0-A3 dell'ADS1115 (solare ingresso, puffer b, solare uscita, puffer c), J15 e J16 sui GPIO4 e 5 (S3, S2).
5. **Display (J21)**: JST XH a 4 poli: +5 V, GND, TX (GPIO15), RX (GPIO16). La spina della scheda del display sembra piu' piccola (passo
   1,25 mm): da verificare sulla sua scheda tecnica; oppure si alimenta dalla sua USB-C.
6. **I2C esterno (J22)**: 3V3, GND, SDA, SCL. **GPIO liberi (J23)**: 3V3, 5V, GND, GPIO 1, 2, 42, 41, 40, 39, 38, 48, 47.

## Regole di progetto

Clearance 0,15 mm, piste 0,25 mm (alimentazione 0,7 mm, 3,3 V 0,4 mm), via 0,6/0,3 mm, piano di massa continuo sul retro, masse davanti
tramite via. Il DRC e' pulito e `verifica_reti.py` controlla 59 pad contro la piedinatura attesa.

## Come si rigenera

- `genera_scheda.py` costruisce la scheda (parti, reti, posizioni). `costruisci.sh` la instrada con Freerouting 1.9.0 (Java 17; si apre
  una finestra per qualche secondo), controlla le reti e il DRC e riprova con piu' o meno passaggi finche' e' pulita.
- `produci.sh` esporta Gerber, fori, distinta e posizioni nella cartella `produzione/` (sempre l'ultima revisione).
- Le revisioni precedenti sono in `archivio/`.

## Revisioni

- **A**: modulo W5500 blu a 2x5 pin, alimentato a 5 V (superata).
- **B**: modulo W5500 Lite a 3,3 V con regolatore dedicato, senza nomi dei pin sulla serigrafia (superata).
- **C** (questa): nomi dei pin del W5500 e degli altri connettori sulla serigrafia, revisione scritta sulla scheda.

## Prima dell'ordine

Impronte delle morsettiere (5,08 mm) e dei JST XH (2,50 mm); codici LCSC nella distinta; Gerber nel visualizzatore del produttore;
rotazione e posizione dei componenti nell'anteprima dell'assemblaggio; se il produttore salda anche i componenti a foro.
