# Script per lo Shelly 1PM Gen4 (pompa di integrazione)

`integrazione-blocco.js` fa seguire al relè la chiamata dell'Elios (ingresso SW) e permette a Home Assistant di bloccarla,
con scadenza di sicurezza. **Installato il 5/10/2026 sull'1PM (192.168.178.119): ingresso in modalità «detached», stato iniziale «off», booleano virtuale id 200, script avviato all'accensione. Resta da provare con l'Elios in manuale (punti 2-4 sotto).** Se il relè non segue l'Elios, tornare a modalità «follow» (`Switch.SetConfig` `in_mode: follow`): la pompa riparte subito come prima.

## Come blocca
- **Segnale di presenza (usato da Home Assistant):** `GET http://<shelly>/script/1/block` tiene il blocco per 600 s dall'ultima chiamata; `.../unblock` lo toglie subito. Home Assistant lo rinnova ogni 5 minuti. Se Home Assistant o il Wi-Fi spariscono, la pompa torna a seguire l'Elios entro 10 minuti.
- **Booleano virtuale «Blocca integrazione» (id 200):** blocco manuale, scade dopo 600 s dal momento in cui lo script lo vede acceso. Home Assistant non lo usa più (il vecchio rinnovo con il booleano lasciava cadere il blocco ogni 10 minuti).
- Provato il 5/10/2026 con l'Elios che chiamava: `block` apre il relè, `unblock` lo richiude.

- **Accensione forzata:** `GET .../run` accende il relè anche se l'Elios non chiama (il 1PM alimenta la pompa dalla fase permanente del quadro), per 600 s dall'ultima chiamata; `GET .../auto` toglie blocco e forzatura e la pompa torna a seguire solo l'Elios. Il blocco ha sempre la precedenza.

## Prova consigliata
1. Installa lo script con la pompa scollegata (o con il solo carico di prova), ingresso SW collegato al pin 8 dell'Elios (OUT2, L: fase commutata, in tensione solo quando l'Elios chiama la pompa).
2. Forza OUT2 dall'Elios (modalità manuale): il relè deve chiudere; togli la richiesta: deve aprire.
3. Con la richiesta attiva, accendi il booleano «Blocca integrazione»: il relè deve aprire; dopo `BLOCK_MAX_S` (600 s) deve
   richiudere da solo e il booleano tornare spento.
4. Spegni il Wi-Fi o Home Assistant durante un blocco: dopo la scadenza la pompa deve tornare a seguire l'Elios.

## Lato Home Assistant (fatto: `ha-packages/caldaia_integrazione_blocco.yaml`)
- Regola: accensione forzata quando il puffer supera il boiler di almeno 7 °C (sblocco) e il boiler alto è sotto la temperatura massima (55 °C, isteresi 2 °C), anche se l'Elios non chiama; interruttore `input_boolean.caldaia_integrazione_forzatura_attiva`, spento di partenza.
- Regola: blocco quando puffer − boiler alto stimato è sotto 4 °C, sblocco sopra 7 °C; il segnale di presenza viene rinnovato ogni 5 minuti con `rest_command` (nessuna entità richiesta). Interruttore generale `input_boolean.caldaia_integrazione_blocco_attivo`, spento di partenza: accenderlo dopo la prova del relè.

## Idee iniziali
- Un'automazione accende il booleano virtuale quando l'Elios chiama (ingresso acceso), il puffer non è abbastanza più caldo
  del boiler e la scadenza non è stata raggiunta; lo riaccende quando lo vede spegnersi e la condizione persiste.
- Mai bloccare se è attiva l'anti-legionella (P16) sull'Elios.
