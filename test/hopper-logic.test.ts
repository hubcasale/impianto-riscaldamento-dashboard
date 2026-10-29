import { test } from "node:test";
import assert from "node:assert/strict";
import { DEAD_KG, HOPPER, HOPPER_HEIGHT, afterBags, daysLeft, depthAtKg, fillPercent, hopperOutline, kgAtDepth, levelColor, remainingKg } from "../src/hopper-logic";

const near = (a: number, b: number, tol: number, msg?: string) => assert.ok(Math.abs(a - b) <= tol, `${msg ?? ""} ${a} != ${b} (+-${tol})`);

test("serbatoio: capienza geometrica 128,6 kg, 8,6 kg occupati da coclea e altro", () => {
  near(DEAD_KG, 8.6, 0.1);
  near(kgAtDepth(0), 120, 0.01);
  assert.equal(HOPPER_HEIGHT, 94);
});

test("serbatoio: 2 kg per cm nella scatola alta (taratura con i sacchi)", () => {
  near(kgAtDepth(7.5), 105, 0.1);
  near(kgAtDepth(15), 90, 0.1);
  near(kgAtDepth(28), 64, 0.2);
  near(kgAtDepth(7.5) - kgAtDepth(15), 15, 0.1, "un sacco da 15 kg sono 7,5 cm");
});

test("serbatoio: tabella sotto i 28 cm (trapezio e punta)", () => {
  near(kgAtDepth(40), 41.9, 0.3);
  near(kgAtDepth(50), 26.3, 0.3);
  near(kgAtDepth(60), 13.4, 0.3);
  near(kgAtDepth(70), 3.0, 0.3);
  assert.equal(kgAtDepth(80), 0);
  assert.equal(kgAtDepth(94), 0);
});

test("serbatoio: la quota dai chili e' l'inversa", () => {
  for (const kg of [120, 105, 64, 41.9, 26.3, 10, 3]) near(kgAtDepth(depthAtKg(kg)), kg, 0.05);
  near(depthAtKg(105), 7.5, 0.05);
  assert.ok(depthAtKg(0) > 70 && depthAtKg(0) < 80);
  near(depthAtKg(500), 0, 0.01);
});

test("pellet rimasto: riferimento meno il consumo stimato da allora", () => {
  assert.equal(remainingKg(105, 59.27, 59.27), 105);
  near(remainingKg(105, 65.27, 59.27)!, 99, 0.001);
  assert.equal(remainingKg(105, 200, 59.27), 0);
  assert.equal(remainingKg(130, 59.27, 59.27), HOPPER.capacityKg);
  assert.equal(remainingKg(105, 50, 59.27), 105);      // il totale che scende (azzeramento) non aggiunge pellet
  assert.equal(remainingKg(105, 59.27, 0), null);       // riferimento non ancora impostato
  assert.equal(remainingKg(null, 60, 59), null);
  assert.equal(remainingKg(105, null, 59), null);
});

test("sacchi versati: si aggiungono ai chili che c'erano, non oltre 8 sacchi", () => {
  assert.equal(afterBags(90, 1), 105);
  assert.equal(afterBags(90, 2), 120);
  assert.equal(afterBags(110, 2), 120);
  assert.equal(afterBags(90, 0.5), 97.5);
  assert.equal(afterBags(10, -1), 0);
});

test("autonomia, colore e percentuale", () => {
  near(daysLeft(105, 6)!, 17.5, 0.001);
  assert.equal(daysLeft(105, 0), null);
  assert.equal(daysLeft(null, 6), null);
  assert.equal(levelColor(10), "#ef4444");
  assert.equal(levelColor(30), "#f59e0b");
  assert.equal(levelColor(80), "#b7791f");
  assert.equal(levelColor(null), "#64748b");
  assert.equal(fillPercent(60), 50);
  assert.equal(fillPercent(null), 0);
});

test("contorno: lato sinistro verticale, destro obliquo", () => {
  const o = hopperOutline();
  assert.deepEqual(o[0], [0, 0]);
  assert.deepEqual(o[o.length - 1], [0, 94]);
  assert.deepEqual(o[2], [54, 28]);
  assert.deepEqual(o[3], [19, 78]);
  assert.deepEqual(o[4], [7, 94]);
});

import { consumptionPerDay } from "../src/hopper-logic";

test("consumo al giorno: a meta' settimana si divide per i giorni trascorsi, non per 7", () => {
  // giovedi' 29/10/2026 alle 07:10: 3 giorni e un po' dal lunedi'
  const now = new Date(2026, 9, 29, 7, 10);
  const days = 3 + (7 * 60 + 10) / 1440;
  assert.ok(Math.abs(consumptionPerDay(19.16, 156.81, now) - 19.16 / days) < 1e-9);
  assert.ok(consumptionPerDay(19.16, 156.81, now) > 5.5);
});

test("consumo al giorno: all'inizio della settimana si usa il mese, poi il valore di riserva", () => {
  const lunedi = new Date(2026, 9, 26, 10, 0); // lunedi', 26 del mese: 25 giorni dall'inizio del mese
  assert.ok(Math.abs(consumptionPerDay(2, 140, lunedi) - 140 / (25 + 10 / 24)) < 1e-9);
  const primoDelMese = new Date(2026, 10, 2, 10, 0); // lunedi' 2 novembre: 1 giorno di mese
  assert.equal(consumptionPerDay(2, 9, primoDelMese), 6);
  assert.equal(consumptionPerDay(null, null, new Date(2026, 9, 29, 7, 10)), 6);
});

test("consumo al giorno: valori troppo bassi (stufa ferma) non allungano l'autonomia all'infinito", () => {
  const now = new Date(2026, 9, 29, 7, 10);
  assert.equal(consumptionPerDay(0.5, 1, now), 6);
});
