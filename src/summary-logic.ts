// Logica pura del riquadro "In breve": poche righe che dicono che cosa sta succedendo all'impianto.
// Nessuna dipendenza da Lit o da Home Assistant, così si prova con node:test.

import { fmt, stoveLook } from "./plant-logic";

export type SummaryTone = "ok" | "info" | "warn" | "bad";

export interface SummaryLine {
  icon: string;
  text: string;
  tone: SummaryTone;
}

/** Di quanto il puffer deve scendere sotto il Set boiler perché la Polygon riparta da ECO STOP (ricavato dallo storico). */
export const RESTART_BELOW_SETPOINT = 4;

export interface SummaryInput {
  /** stato della caldaia come lo legge l'integrazione (WORK, ECO STOP, OFF ...) */
  stoveState?: string;
  /** testo dell'allarme; vuoto o null se non c'è */
  alarm: string | null;
  power: number | null;
  setWater: number | null;
  setBoiler: number | null;
  puffer: number | null;
  /** il puffer non viene dalla caldaia ma dalla stima con la sonda */
  pufferEstimated: boolean;
  boilerTop: number | null;
  collector: number | null;
  integrationPump: "running" | "blocked" | "idle";
  collectorPumpOn: boolean | null;
  /** minuti stimati per avere l'acqua calda (0 = già calda) */
  etaMinutes: number | null;
  cronoOn: boolean | null;
  programActive: boolean | null;
  /** la salvaguardia ha annullato una partenza inutile */
  guardFlag: boolean | null;
  /** accensione rapida con il pulsante in corso */
  boostActive: boolean;
  /** nessuno in casa (iCloud3 + Wi-Fi) */
  nobodyHome: boolean | null;
  nobodyHomeMinutes: number | null;
  awayEnabled: boolean | null;
  awayFlag: boolean | null;
  guests: boolean | null;
  awayMinutes: number | null;
  pelletEmpty: boolean | null;
  pelletReserve: boolean | null;
}

const OFF_STATES = ["OFF", "SPENTO", "STOP", "ARRESTO", "UNKNOWN", "UNAVAILABLE", ""];

function stoveLine(i: SummaryInput): SummaryLine {
  const raw = (i.stoveState ?? "").trim().toUpperCase();
  const look = stoveLook(i.stoveState);
  if (raw === "UNAVAILABLE" || raw === "UNKNOWN" || raw === "") {
    return {
      icon: "mdi:lan-disconnect",
      text: i.pufferEstimated
        ? "Caldaia non raggiungibile: per il puffer uso la stima dalla sonda."
        : "Caldaia non raggiungibile.",
      tone: "warn",
    };
  }
  if (raw === "ECO STOP") {
    const dove =
      i.setBoiler !== null
        ? ` Riparte quando il puffer scende a circa ${fmt(i.setBoiler - RESTART_BELOW_SETPOINT)} °C${
            i.puffer !== null ? ` (ora ${fmt(i.puffer)} °C)` : ""
          }.`
        : "";
    return { icon: "mdi:pause-circle-outline", text: `Caldaia ferma in ECO STOP: l'acqua ha raggiunto la temperatura.${dove}`, tone: "info" };
  }
  if (look === "work")
    return {
      icon: "mdi:fire",
      text: `Caldaia in lavoro${i.power !== null ? ` al ${fmt(i.power)} %` : ""}${
        i.setWater !== null ? `: scalda l'acqua fino a ${fmt(i.setWater)} °C, poi va in ECO STOP` : ""
      }.`,
      tone: "ok",
    };
  if (look === "start" || look === "wait")
    return { icon: "mdi:fire-circle", text: "Caldaia in accensione: servono circa 15 minuti prima che scaldi.", tone: "info" };
  if (look === "standby") return { icon: "mdi:sleep", text: "Caldaia in stand-by: aspetta una richiesta di calore.", tone: "info" };
  if (raw === "STOP" || look === "stopping")
    return { icon: "mdi:fire-off", text: "Caldaia in spegnimento.", tone: "info" };
  return { icon: "mdi:fire-off", text: "Caldaia spenta.", tone: "info" };
}

/** Perché la caldaia è spenta, se lo sappiamo. */
function whyOffLine(i: SummaryInput): SummaryLine | null {
  const raw = (i.stoveState ?? "").trim().toUpperCase();
  if (!OFF_STATES.includes(raw) || raw === "UNAVAILABLE" || raw === "UNKNOWN" || raw === "") return null;
  if (i.awayFlag) return { icon: "mdi:home-off", text: "È spenta perché nessuno era in casa: riparte al rientro se c'è un programma attivo.", tone: "info" };
  if (i.guardFlag)
    return { icon: "mdi:shield-check", text: "Ho annullato una partenza inutile: puffer e boiler erano già caldi.", tone: "info" };
  if (i.boostActive) return null;
  if (i.cronoOn === false)
    return { icon: "mdi:palm-tree", text: "Cronotermostato disattivato (vacanza): non parte da sola.", tone: "info" };
  if (i.cronoOn && i.programActive === false)
    return { icon: "mdi:calendar-clock", text: "Fuori dalle fasce del cronotermostato: riparte al prossimo programma.", tone: "info" };
  if (i.cronoOn && i.programActive)
    return { icon: "mdi:calendar-check", text: "C'è un programma attivo: la caldaia dovrebbe partire da sola.", tone: "info" };
  return null;
}

function pumpLine(i: SummaryInput): SummaryLine | null {
  const p = i.puffer !== null ? `${fmt(i.puffer)} °C` : "–";
  const b = i.boilerTop !== null ? `${fmt(i.boilerTop)} °C` : "–";
  if (i.integrationPump === "running")
    return { icon: "mdi:pump", text: `Pompa di integrazione accesa: porta il calore del puffer (${p}) al boiler (${b}).`, tone: "ok" };
  if (i.integrationPump === "blocked")
    return { icon: "mdi:pump-off", text: `Pompa di integrazione ferma: il puffer (${p}) non è abbastanza più caldo del boiler (${b}).`, tone: "info" };
  return null;
}

function solarLine(i: SummaryInput): SummaryLine | null {
  if (i.collectorPumpOn === true)
    return {
      icon: "mdi:solar-power",
      text: `Il solare sta scaldando il boiler${i.collector !== null ? ` (collettore a ${fmt(i.collector)} °C)` : ""}.`,
      tone: "ok",
    };
  if (i.collectorPumpOn === false && i.collector !== null)
    return { icon: "mdi:weather-sunny-off", text: `Il solare è fermo (collettore a ${fmt(i.collector)} °C).`, tone: "info" };
  return null;
}

function awayLine(i: SummaryInput): SummaryLine | null {
  if (i.guests) return { icon: "mdi:account-multiple", text: "Modalità ospiti: la caldaia non si spegne per assenza.", tone: "info" };
  if (i.nobodyHome !== true) return null;
  const min = i.nobodyHomeMinutes !== null ? Math.round(i.nobodyHomeMinutes) : null;
  const da = min !== null ? ` da ${min} min` : "";
  if (i.awayEnabled === false) return { icon: "mdi:home-off", text: `Nessuno in casa${da} (lo spegnimento per assenza è disattivato).`, tone: "info" };
  const raw = (i.stoveState ?? "").trim().toUpperCase();
  const accesa = !OFF_STATES.includes(raw);
  if (accesa && min !== null && i.awayMinutes !== null) {
    const left = Math.max(0, Math.round(i.awayMinutes - min));
    return {
      icon: "mdi:home-off",
      text: left > 0 ? `Nessuno in casa${da}: la caldaia si spegne tra circa ${left} min.` : `Nessuno in casa${da}: sto per spegnere la caldaia.`,
      tone: "warn",
    };
  }
  return { icon: "mdi:home-off", text: `Nessuno in casa${da}.`, tone: "info" };
}

/** Le righe del riquadro, dalla più importante: avvisi, caldaia, perché, pompe, solare, presenza, acqua calda. */
export function summarize(i: SummaryInput): SummaryLine[] {
  const lines: SummaryLine[] = [];
  const alarm = (i.alarm ?? "").trim();
  if (alarm) lines.push({ icon: "mdi:alert-octagon", text: `Allarme della caldaia: ${alarm}.`, tone: "bad" });
  if (i.pelletEmpty) lines.push({ icon: "mdi:grain", text: "Pellet esaurito: ricarica il serbatoio.", tone: "bad" });
  else if (i.pelletReserve) lines.push({ icon: "mdi:grain", text: "Il pellet sta per finire.", tone: "warn" });

  lines.push(stoveLine(i));
  for (const l of [whyOffLine(i), pumpLine(i), solarLine(i), awayLine(i)]) if (l) lines.push(l);

  if (i.etaMinutes !== null) {
    lines.push(
      i.etaMinutes > 0
        ? { icon: "mdi:water-boiler", text: `L'acqua calda sarà pronta tra circa ${fmt(i.etaMinutes)} min.`, tone: "info" }
        : { icon: "mdi:water-boiler", text: "L'acqua calda è già a temperatura d'uso.", tone: "ok" },
    );
  }
  return lines;
}
