# Script per lo Shelly 1PM Gen4 (pompa di integrazione)

`integrazione-blocco.js` fa seguire al relè la chiamata dell'Elios (ingresso SW) e permette a Home Assistant di bloccarla,
con scadenza di sicurezza. **Bozza non provata su un dispositivo.**

## Prova consigliata
1. Installa lo script con la pompa scollegata (o con il solo carico di prova), ingresso collegato al pin 9 dell'Elios.
2. Forza OUT2 dall'Elios (modalità manuale): il relè deve chiudere; togli la richiesta: deve aprire.
3. Con la richiesta attiva, accendi il booleano «Blocca integrazione»: il relè deve aprire; dopo `BLOCK_MAX_S` (600 s) deve
   richiudere da solo e il booleano tornare spento.
4. Spegni il Wi-Fi o Home Assistant durante un blocco: dopo la scadenza la pompa deve tornare a seguire l'Elios.

## Lato Home Assistant (da fare quando le entità esistono)
- Un'automazione accende il booleano virtuale quando l'Elios chiama (ingresso acceso), il puffer non è abbastanza più caldo
  del boiler e la scadenza non è stata raggiunta; lo riaccende quando lo vede spegnersi e la condizione persiste.
- Mai bloccare se è attiva l'anti-legionella (P16) sull'Elios.
