import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSettingsView, clampValue, stepValue, valueText } from "../src/settings-logic";

const st = (state: string, attributes: Record<string, unknown> = {}) => ({ state, attributes });

test("preferenze: le entità mancanti non compaiono e le sezioni vuote spariscono", () => {
  const v = buildSettingsView({
    "input_boolean.caldaia_integrazione_blocco_attivo": st("on"),
    "input_number.caldaia_integrazione_temp_max": st("55", { min: 40, max: 70, step: 1, unit_of_measurement: "°C" }),
  });
  assert.equal(v.length, 1);
  assert.equal(v[0].title, "Pompa di integrazione");
  assert.deepEqual(v[0].rows.map((r) => r.entity), ["input_boolean.caldaia_integrazione_blocco_attivo", "input_number.caldaia_integrazione_temp_max"]);
});

test("preferenze: interruttori e numeri", () => {
  const v = buildSettingsView({
    "input_boolean.caldaia_integrazione_blocco_attivo": st("on"),
    "input_boolean.caldaia_integrazione_forzatura_attiva": st("off"),
    "input_number.caldaia_integrazione_delta_blocco": st("4.0", { min: 0, max: 15, step: 0.5, unit_of_measurement: "°C" }),
  });
  const rows = v[0].rows;
  assert.equal(rows[0].on, true);
  assert.equal(rows[1].on, false);
  assert.equal(rows[2].value, 4);
  assert.equal(rows[2].max, 15);
  assert.equal(rows[2].step, 0.5);
  assert.equal(rows[2].unit, "°C");
});

test("preferenze: entità non disponibile", () => {
  const v = buildSettingsView({ "input_number.caldaia_integrazione_temp_max": st("unavailable", { min: 40, max: 70 }) });
  assert.equal(v[0].rows[0].unavailable, true);
  assert.equal(v[0].rows[0].value, null);
});

test("preferenze: la sezione della misura pompe è ripiegata", () => {
  const v = buildSettingsView({ "input_number.centralina_pompe_w_ferme": st("15", { min: 0, max: 40, step: 0.5 }) });
  assert.equal(v[0].title, "Misura delle pompe");
  assert.equal(v[0].advanced, true);
});

test("passi: restano nei limiti e senza errori di arrotondamento", () => {
  assert.equal(stepValue(4, 1, 0, 15, 0.5), 4.5);
  assert.equal(stepValue(4.5, -1, 0, 15, 0.5), 4);
  assert.equal(stepValue(15, 1, 0, 15, 0.5), 15);
  assert.equal(stepValue(0, -1, 0, 15, 0.5), 0);
  assert.equal(stepValue(null, 1, 40, 70, 1), 41);
  assert.equal(stepValue(0.1, 1, 0, 1, 0.1), 0.2);
});

test("valore digitato: dentro i limiti", () => {
  assert.equal(clampValue(99, 40, 70, 1), 70);
  assert.equal(clampValue(10, 40, 70, 1), 40);
  assert.equal(clampValue(55.26, 40, 70, 0.5), 55.5);
  assert.equal(clampValue(55.2, 40, 70, 0.5), 55);
});

test("testo del valore", () => {
  assert.equal(valueText({ value: 4, unit: "°C", step: 0.5 }), "4.0 °C");
  assert.equal(valueText({ value: 55, unit: "°C", step: 1 }), "55 °C");
  assert.equal(valueText({ value: null, unit: "W", step: 1 }), "–");
});
