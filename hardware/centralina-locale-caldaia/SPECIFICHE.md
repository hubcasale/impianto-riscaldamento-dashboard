# Centralina del locale caldaia: specifiche della scheda (bozza del 20/11/2026)

Obiettivo: una scheda che sostituisce il proxy Bluetooth (ESP32-C3) e la scheda delle sonde (ESP32 + ADS1115) con un solo nodo
ESPHome cablato (Ethernet via powerline, niente Wi-Fi), con un pannello sul coperchio (TFT + 4 pulsanti).

## Decisioni prese

- Componenti saldati dal produttore (assemblaggio SMD, tipo JLCPCB: file Gerber, BOM e posizioni).
- Morsettiere a vite robuste (passo 5,08 mm).
- Scatola di derivazione 150 x 110 x 70 mm (esterne, internamente circa 130 x 90 con i pilastrini per le viti del coperchio agli angoli); barra DIN sul fondo opzionale (non cambia la scheda). KiCad lo installa l'utente.
- Scheda principale 120 x 80 mm, 4 fori M3 a 4 mm dagli angoli; morsettiere lungo un lato lungo (ingresso fili dai pressacavi), DevKit con USB-C e antenna verso il lato opposto.
- ESP32-S3 DevKitC-1 (N16R8, versione con antenna esterna) su prese femmina a 2,54 mm, estraibile.
- W5500: modulo ARCELI "W5500 Lite" (RJ45 HR961160C, 2 file di 6 pin, solo 3,3 V), separato dalla scheda, con un cavo da JST XH a contatti Dupont; si fissa nella scatola dove c'e' spazio davanti alla presa RJ45. W5500 integrato sulla scheda rimandato a una seconda versione (la spina RJ45 non ci sta nella scatola da 150 x 110).
- Display: ELEGOO 2,8" "ESP32-32E" 240x320, touch resistivo: NON e' un modulo SPI nudo ma una scheda con un proprio ESP32-32E (come l'Elecrow
  E32R28T: ILI9341 + XPT2046, microSD, altoparlante, LED RGB, USB-C, connettori UART e SPI; piedinatura da verificare sulla scheda tecnica).
  Funziona da nodo ESPHome a parte (Wi-Fi) sul coperchio e sostituisce i 4 pulsanti con il touch. DECISIONE: fa solo il display; sonde e
  Bluetooth con la stufa restano sul nodo S3 dentro la scatola (il proxy di riserva sul display, eventualmente, solo piu' avanti dopo una prova).

## Modulo W5500: ARCELI "W5500 Lite" (RJ45 HanRun HR961160C, 2 file di 6 pin), alimentato solo a 3,3 V

Dallo schema dei pin dell'annuncio (le sigle sono stampate sul modulo; da verificare sul tuo esemplare):

| Fila A (6 pin) | Fila B (6 pin) |
|---|---|
| GND | GND |
| GND | 3V3 |
| MOSI | 3V3 |
| SCLK | NC |
| CS | RST |
| INT | MISO |

Cavo: JST XH a 8 poli sulla scheda; dall'altro lato otto contatti Dupont singoli (o due custodie), uno per segnale:
XH1 +3V3 (uno dei due pin 3V3), XH2 GND, XH3 SCLK, XH4 MISO, XH5 MOSI, XH6 CS, XH7 INT, XH8 RST. Il 3,3 V arriva da un regolatore
dedicato sulla scheda (AP2112K-3.3, 600 mA, alimentato dai 5 V): il modulo assorbe circa 130 mA e non pesa sul DevKit.
Il cavo Ethernet entra nella scatola da un pressacavo e si crimpa dopo; il modulo si fissa dove c'e' spazio davanti alla presa RJ45.

## Assegnazione dei pin dell'ESP32-S3

| Funzione | GPIO |
|---|---|
| W5500: SCLK, MISO, MOSI | 12, 13, 11 |
| W5500: CS, INT, RST | 10, 14, 17 |
| I2C (ADS1115, pull-up 4,7 kOhm a 3,3 V): SDA, SCL | 8, 9 |
| Sonde direttamente sull'ESP (S3, S2) | 4, 5 |
| Seriale verso il display: TX, RX | 15, 16 |
| Liberi (1, 2, 38-42, 47, 48 sulla fila di pin della scheda) | 1, 2, 6, 7, 18, 21, 38, 39, 40, 41, 42, 47, 48 |

Da evitare: 0, 3, 45, 46 (avvio), 19, 20 (USB), 43, 44 (seriale del log), 26-32 (flash), 35-37 (PSRAM octal).
Su alcune versioni del DevKit un LED RGB usa GPIO38 o 48.

## Blocchi della scheda principale

1. **Alimentazione**: morsettiera 5 V (2 poli, 5,08 mm), fusibile ripristinabile, diodo o MOSFET contro l'inversione, TVS, condensatore
   elettrolitico; il 5 V alimenta il pin 5 V del DevKit (con diodo Schottky, da verificare con lo schema del DevKit), il modulo W5500
   (pin 9) e il pannello. Alimentatore consigliato: 5 V, almeno 1 A. Consumo stimato vicino a 500 mA (limite di una porta USB).
2. **ADS1115** (VSSOP-10, indirizzo 0x48, ADDR a GND), VDD 3,3 V con 100 nF + 10 uF, pull-up I2C 4,7 kOhm.
3. **6 canali sonda NTC 10k**, tutti uguali: 3,3 V -> resistenza 10 kOhm 0,1 % -> nodo -> 100 nF a GND -> morsettiera a 2 poli
   (nodo, GND). Quattro sugli ingressi A0-A3 dell'ADS1115, due sugli ingressi GPIO4 e GPIO5 dell'ESP.
4. **Connettore del W5500**: JST XH a 8 poli (passo 2,50 mm, polarizzato). Ordine sulla scheda: 1 +3,3 V (regolatore U2), 2 GND, 3 SCLK, 4 MISO, 5 MOSI, 6 CS,
   7 INT, 8 RST. Cavo con XH da un lato e dall'altro una custodia Dupont 2x5 femmina con i fili nei pin del modulo:
   XH1 -> pin 9 (5 V), XH2 -> pin 7 (GND), XH3 -> pin 2 (SCLK), XH4 -> pin 8 (MISO), XH5 -> pin 6 (MOSI), XH6 -> pin 4 (CS),
   XH7 -> pin 3 (INT), XH8 -> pin 5 (RST); pin 1 e 10 del modulo vuoti (pin 10 e' l'uscita 3,3 V del suo regolatore).
5. **Connettore del display** (JST XH a 4 poli; il connettore della scheda del display e' piu' piccolo, sembra a passo 1,25 mm: da verificare e si fa il cavo con la spina giusta, oppure si alimenta dalla sua USB-C): +5 V, GND, TX (GPIO15), RX (GPIO16): alimenta la scheda del display dal
   5 V della scheda principale (consumo del display circa 200-300 mA, quindi alimentatore da almeno 2 A) e lascia pronto un
   collegamento seriale con il nodo del display. Nessun cavo SPI, nessuna retroilluminazione da pilotare, nessun pulsante: il
   display ha il suo ESP32, il touch e la sua retroilluminazione. I GPIO 1, 2, 6, 7, 18, 40, 41, 42, 47 restano liberi.
6. **Fila di pin liberi** con 3,3 V, 5 V, GND e i GPIO rimasti, per le espansioni (relè sul contatto della stufa, ecc.).
7. Fori di fissaggio M3 secondo la scatola.

## Coperchio

Sul coperchio c'e' la scheda del display (nodo ESPHome indipendente, Wi-Fi). Prende i dati dal nodo principale con la sua interfaccia
web (JSON) o da Home Assistant, e si alimenta dal connettore a 4 poli della scheda principale. Il W5500 si collega alla fila 2x5 con
un cavo da JST XH a custodia Dupont 2x5.

## Da definire prima di produrre i Gerber

- Misure interne e profondita' della scatola di derivazione (decide il contorno della scheda).
- Scheda tecnica del display ELEGOO/Elecrow: piedinatura (display, touch, retroilluminazione), connettore UART, dimensioni e fori.
- Misure del modulo W5500 (lunghezza, larghezza, fori) per fissarlo alla scatola.
- Controllo dei componenti (disponibilità, impronte) sul sito del produttore prima dell'ordine.
- Controllo delle regole di progetto (DRC) con le tolleranze del produttore e verifica a calibro delle impronte.

## Stato del progetto KiCad (20/11/2026)

- Scheda principale 120 x 80 mm, 2 strati, instradata e con il controllo delle regole (DRC) pulito: nessuna violazione, nessun collegamento mancante.
- `genera_scheda.py` costruisce la scheda (parti, reti, posizioni, piano di massa sul retro). `costruisci.sh` la rigenera, la instrada
  con Freerouting 1.9.0 (richiede Java 17; si apre una finestra per qualche secondo) e lancia il DRC. `produci.sh` esporta Gerber, fori,
  distinta e posizioni nella cartella `produzione/`.
- Regole: clearance 0,15 mm, piste 0,25 mm (alimentazione 0,7 mm, 3,3 V 0,4 mm), via 0,6/0,3 mm.
- Piedinatura J1/J3 del DevKit presa dalla documentazione ufficiale del DevKitC-1 (da confrontare con la serigrafia); distanza tra le file 22,86 mm CONFERMATA dall'utente sul suo esemplare (20/11/2026); passo dei pin 2,54 mm.
- Da fare prima dell'ordine: verifica delle impronte delle morsettiere (5,08 mm) e dei JST XH (passo 2,50 mm, spesso venduti come "XH2.54"), codici LCSC nella distinta, anteprima dei Gerber nel
  visualizzatore del produttore, controllo di rotazione e posizione dei componenti nell'anteprima dell'assemblaggio.
