// Shelly 1PM Gen4 - pompa di integrazione dell'Elios (OUT2, pin 9 sull'ingresso SW, uscita O sulla pompa).
//
// BOZZA NON PROVATA SU UN DISPOSITIVO: provarla con calma, prima a vuoto (senza pompa collegata o con la pompa ferma).
//
// Cosa fa:
//   - il relè segue l'ingresso SW, cioè la chiamata dell'Elios (come se la pompa fosse collegata direttamente);
//   - se Home Assistant accende il booleano virtuale "Blocca integrazione", il relè resta aperto anche se l'Elios chiama;
//   - il blocco scade DA SOLO dopo BLOCK_MAX_S secondi: se Home Assistant o il Wi-Fi spariscono, la pompa torna a
//     seguire l'Elios. Per tenerlo, Home Assistant lo riaccende quando vede che si è spento (vedi README).
//
// Impostazioni dello Shelly prima di avviare lo script:
//   1. Ingresso (Input/Output): tipo "Interruttore", modalità "Detached" (l'ingresso non comanda direttamente il relè).
//   2. Componenti virtuali: crea un Booleano con id 200, nome "Blocca integrazione", vista "Toggle".
//   3. Script: incolla questo file, attiva "Esegui all'avvio".

let CFG = {
  INPUT: "input:0",
  SWITCH_ID: 0,
  VIRTUAL_ID: 200,
  BLOCK_MAX_S: 600,
};

let blockSinceMs = 0; // istante (uptime) in cui il blocco è stato visto acceso; 0 = non bloccato

function blockActive() {
  let v = Shelly.getComponentStatus("boolean:" + CFG.VIRTUAL_ID);
  if (!v || !v.value) {
    blockSinceMs = 0;
    return false;
  }
  let now = Shelly.getUptimeMs();
  if (blockSinceMs === 0) blockSinceMs = now;
  if (now - blockSinceMs > CFG.BLOCK_MAX_S * 1000) {
    // scaduto: sblocca da solo
    Shelly.call("Boolean.Set", { id: CFG.VIRTUAL_ID, value: false });
    blockSinceMs = 0;
    return false;
  }
  return true;
}

function apply() {
  let inp = Shelly.getComponentStatus(CFG.INPUT);
  let sw = Shelly.getComponentStatus("switch:" + CFG.SWITCH_ID);
  if (!inp || !sw) return;
  let want = inp.state === true && !blockActive();
  if (sw.output !== want) {
    Shelly.call("Switch.Set", { id: CFG.SWITCH_ID, on: want });
  }
}

Shelly.addStatusHandler(function (e) {
  if (e.component === CFG.INPUT || e.component === "boolean:" + CFG.VIRTUAL_ID) apply();
});

// controllo periodico: fa scadere il blocco anche se non arriva nessun evento
Timer.set(5000, true, apply);
apply();
