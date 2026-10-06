import { test } from "node:test";
import assert from "node:assert/strict";
import { applyPending, buildSettingsView, clampValue, stepValue, valueText, writeService } from "../src/settings-logic";

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

test("caldaia: temperatura dell'acqua dal termostato e setpoint del puffer", () => {
  const v = buildSettingsView({
    "climate.casale_acqua": st("heat", { temperature: 65, min_temp: 50, max_temp: 75, target_temp_step: 1 }),
    "number.casale_setpoint_boiler": st("45", { min: 45, max: 70, step: 1, unit_of_measurement: "°C" }),
  });
  assert.equal(v.length, 1);
  assert.equal(v[0].title, "Caldaia a pellet (Polygon)");
  const [acqua, puffer] = v[0].rows;
  assert.equal(acqua.domain, "climate");
  assert.equal(acqua.value, 65);
  assert.equal(acqua.min, 50);
  assert.equal(acqua.max, 75);
  assert.equal(acqua.unit, "°C");
  assert.equal(puffer.domain, "number");
  assert.equal(puffer.value, 45);
  assert.equal(puffer.min, 45);
});

test("caldaia: termostato senza temperatura obiettivo", () => {
  const v = buildSettingsView({ "climate.casale_acqua": st("off", { temperature: null }) });
  assert.equal(v[0].rows[0].value, null);
  assert.equal(v[0].rows[0].unavailable, false);
});

test("servizio di scrittura per dominio", () => {
  assert.deepEqual(writeService({ domain: "climate", entity: "climate.casale_acqua" }, 66), { domain: "climate", service: "set_temperature", data: { entity_id: "climate.casale_acqua", temperature: 66 } });
  assert.deepEqual(writeService({ domain: "number", entity: "number.casale_setpoint_boiler" }, 50), { domain: "number", service: "set_value", data: { entity_id: "number.casale_setpoint_boiler", value: 50 } });
  assert.deepEqual(writeService({ domain: "input_number", entity: "input_number.x" }, 3), { domain: "input_number", service: "set_value", data: { entity_id: "input_number.x", value: 3 } });
});

test("attesa di conferma: mostra il valore scelto finché la caldaia non risponde", () => {
  const v = buildSettingsView({ "number.casale_setpoint_boiler": st("45", { min: 45, max: 70, step: 1 }) });
  const r = applyPending(v, { "number.casale_setpoint_boiler": { value: 47, until: 1000 } }, 500);
  assert.equal(r.sections[0].rows[0].value, 47);
  assert.equal(r.sections[0].rows[0].saving, true);
  assert.deepEqual(r.settled, []);
});

test("attesa di conferma: finita quando il valore reale coincide o scade", () => {
  const v = buildSettingsView({ "number.casale_setpoint_boiler": st("47", { min: 45, max: 70, step: 1 }) });
  const conferma = applyPending(v, { "number.casale_setpoint_boiler": { value: 47, until: 1000 } }, 500);
  assert.deepEqual(conferma.settled, ["number.casale_setpoint_boiler"]);
  assert.equal(conferma.sections[0].rows[0].saving, undefined);
  const scaduta = applyPending(v, { "number.casale_setpoint_boiler": { value: 50, until: 1000 } }, 1500);
  assert.deepEqual(scaduta.settled, ["number.casale_setpoint_boiler"]);
  assert.equal(scaduta.sections[0].rows[0].value, 47);
});

test("attesa di conferma: gli interruttori non sono toccati", () => {
  const v = buildSettingsView({ "input_boolean.caldaia_integrazione_blocco_attivo": st("on") });
  const r = applyPending(v, { "input_boolean.caldaia_integrazione_blocco_attivo": { value: 1, until: 1000 } }, 500);
  assert.equal(r.sections[0].rows[0].saving, undefined);
  assert.deepEqual(r.settled, []);
});
