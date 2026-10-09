import "./plant-card";
import "./schedule-card";

const VERSION = "0.3.15";

declare global {
  interface Window {
    customCards?: Array<Record<string, unknown>>;
  }
}

window.customCards = window.customCards || [];
window.customCards.push(
  {
    type: "impianto-overview-card",
    name: "Impianto: boiler solare e caldaia",
    description: "Boiler solare con temperature alta e bassa, docce stimate, puffer e caldaia a pellet con i dati principali.",
  },
  {
    type: "caldaia-schedule-card",
    name: "Caldaia: programmazione settimanale",
    description: "4 programmi, giorni, orari e temperature, vista settimanale, avviso di sovrapposizione e preset.",
  }
);

// eslint-disable-next-line no-console
console.info(
  `%c IMPIANTO-RISCALDAMENTO-DASHBOARD %c v${VERSION} `,
  "color: white; background: #b45309; font-weight: 700;",
  "color: #b45309; background: white; font-weight: 700;"
);
