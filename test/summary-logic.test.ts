import { test } from "node:test";
import assert from "node:assert/strict";
import { summarize, type SummaryInput } from "../src/summary-logic";

const base: SummaryInput = {
  stoveState: "WORK",
  alarm: null,
  power: 100,
  setWater: 65,
  setBoiler: 50,
  puffer: 61,
  pufferEstimated: false,
  boilerTop: 55.6,
  collector: 40,
  integrationPump: "idle",
  collectorPumpOn: false,
  etaMinutes: null,
  cronoOn: true,
  programActive: true,
  guardFlag: false,
  boostActive: false,
  nobodyHome: false,
  nobodyHomeMinutes: null,
  awayEnabled: true,
  awayFlag: false,
  guests: false,
  awayMinutes: 60,
  pelletEmpty: false,
  pelletReserve: false,
  allskyOk: true,
  sunFree: true,
  allskyCloud: 20,
  sunAboveHorizon: true,
  horizonElev: 3,
  sunElevation: 35,
};
const texts = (i: Partial<SummaryInput>) => summarize({ ...base, ...i }).map((l) => l.text);
const joined = (i: Partial<SummaryInput>) => texts(i).join(" | ");

test("riepilogo: caldaia in lavoro", () => {
  const t = texts({});
  assert.match(t[0], /in lavoro al 100 %.*fino a 65 °C/);
});

test("riepilogo: ECO STOP dice a che puffer riparte", () => {
  const t = texts({ stoveState: "ECO STOP", puffer: 43 });
  assert.match(t[0], /ECO STOP/);
  assert.match(t[0], /circa 46 °C \(ora 43 °C\)/);
});

test("riepilogo: accensione", () => {
  assert.match(texts({ stoveState: "START" })[0], /in accensione/);
  assert.match(texts({ stoveState: "WAIT" })[0], /in accensione/);
});

test("riepilogo: spenta per assenza", () => {
  const t = joined({ stoveState: "OFF", awayFlag: true });
  assert.match(t, /Caldaia spenta/);
  assert.match(t, /nessuno era in casa/);
});

test("riepilogo: vacanza (cronotermostato spento)", () => {
  assert.match(joined({ stoveState: "OFF", cronoOn: false }), /Cronotermostato disattivato/);
});

test("riepilogo: fuori fascia e programma attivo", () => {
  assert.match(joined({ stoveState: "OFF", programActive: false }), /Fuori dalle fasce/);
  assert.match(joined({ stoveState: "OFF", programActive: true }), /dovrebbe partire da sola/);
});

test("riepilogo: salvaguardia", () => {
  assert.match(joined({ stoveState: "OFF", guardFlag: true }), /partenza inutile/);
});

test("riepilogo: pompa di integrazione ferma e accesa", () => {
  assert.match(joined({ integrationPump: "blocked", puffer: 44, boilerTop: 43 }), /ferma: il puffer \(44 °C\).*boiler \(43 °C\)/);
  assert.match(joined({ integrationPump: "running" }), /Pompa di integrazione accesa/);
  assert.doesNotMatch(joined({ integrationPump: "idle" }), /Pompa di integrazione/);
});

test("riepilogo: solare", () => {
  assert.match(joined({ collectorPumpOn: true, collector: 72 }), /solare sta scaldando.*72 °C/);
  assert.match(joined({ collectorPumpOn: false, collector: 18 }), /solare è fermo.*18 °C/);
});

test("riepilogo: nessuno in casa con caldaia accesa, conto alla rovescia", () => {
  assert.match(joined({ nobodyHome: true, nobodyHomeMinutes: 25, awayMinutes: 60 }), /da 25 min.*tra circa 35 min/);
});

test("riepilogo: nessuno in casa a caldaia spenta o funzione disattivata", () => {
  assert.match(joined({ nobodyHome: true, nobodyHomeMinutes: 25, stoveState: "OFF" }), /Nessuno in casa da 25 min\./);
  assert.match(joined({ nobodyHome: true, nobodyHomeMinutes: 25, awayEnabled: false }), /disattivato/);
});

test("riepilogo: ospiti", () => {
  assert.match(joined({ guests: true, nobodyHome: true }), /Modalità ospiti/);
});

test("riepilogo: allarme e pellet vengono per primi", () => {
  const t = texts({ alarm: "Al07 Pellet finito", pelletReserve: true });
  assert.match(t[0], /Allarme della caldaia: Al07/);
  assert.match(t[1], /pellet sta per finire/);
  assert.match(texts({ pelletEmpty: true })[0], /Pellet esaurito/);
});

test("riepilogo: caldaia non raggiungibile", () => {
  assert.match(texts({ stoveState: "unavailable", pufferEstimated: true })[0], /non raggiungibile.*stima dalla sonda/);
});

test("riepilogo: acqua calda", () => {
  assert.match(joined({ etaMinutes: 35 }), /pronta tra circa 35 min/);
  assert.match(joined({ etaMinutes: 0 }), /già a temperatura d'uso/);
  assert.doesNotMatch(joined({ etaMinutes: null }), /acqua calda/i);
});

test("riepilogo sole: molte nuvole ma il sole e' libero, il collettore lavora", () => {
  const t = joined({ allskyCloud: 80, sunFree: true });
  assert.match(t, /molto nuvoloso \(80 %\) ma il sole è libero.*collettore lavora/);
  assert.match(t, /temperatura esterna può calare/);
});

test("riepilogo sole: sole libero con poche nuvole", () => {
  assert.match(joined({ allskyCloud: 15, sunFree: true }), /Il sole è libero \(nuvolosità 15 %\)/);
});

test("riepilogo sole: poche nuvole ma una copre il sole", () => {
  assert.match(joined({ allskyCloud: 20, sunFree: false }), /Poche nuvole \(20 %\), ma una copre il sole/);
});

test("riepilogo sole: coperto, solo luce diffusa", () => {
  assert.match(joined({ allskyCloud: 90, sunFree: false }), /sole è coperto.*luce diffusa/);
});

test("riepilogo sole: dietro le colline", () => {
  const t = joined({ sunAboveHorizon: false, sunElevation: 6, horizonElev: 9.5 });
  assert.match(t, /dietro le colline \(da quella parte il terreno arriva a 10°\).*niente luce diretta/);
  assert.doesNotMatch(t, /sole è libero/);
});

test("riepilogo sole: di notte o senza foto non dice niente sul sole", () => {
  assert.doesNotMatch(joined({ allskyOk: false }), /sole è (libero|coperto)|Poche nuvole|molto nuvoloso/);
  assert.doesNotMatch(joined({ allskyOk: null, sunFree: null }), /sole è (libero|coperto)/);
  assert.doesNotMatch(joined({ sunElevation: -5, sunAboveHorizon: false, allskyOk: false }), /colline/);
});
