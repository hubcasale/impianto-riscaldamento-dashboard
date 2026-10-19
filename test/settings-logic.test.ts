import { test } from "node:test";
import assert from "node:assert/strict";
import { SETTINGS_GROUPS, SETTINGS_SECTIONS, applyPending, buildSettingsView, clampValue, integrazioneBar, stepValue, valueText, writeService } from "../src/settings-logic";

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

test("preferenze: sezione del consumo di pellet, ripiegata e con i decimali del passo", () => {
  const v = buildSettingsView({
    "input_number.caldaia_pellet_fattore": st("1.0", { min: 0.5, max: 2, step: 0.01 }),
    "input_number.caldaia_pellet_kg_h_max": st("5.5", { min: 1, max: 10, step: 0.1, unit_of_measurement: "kg/h" }),
  });
  assert.equal(v[0].title, "Consumo di pellet (stima)");
  assert.equal(v[0].advanced, true);
  assert.deepEqual(v[0].rows.map((r) => r.entity), ["input_number.caldaia_pellet_kg_h_max", "input_number.caldaia_pellet_fattore"]);
  assert.equal(stepValue(1, 1, 0.5, 2, 0.01), 1.01);
  assert.equal(valueText(v[0].rows[0]), "5.5 kg/h");
});

test("blocchi: ognuno ha identificativo, icona e spiegazione; ogni voce ha la sua", () => {
  const ids = SETTINGS_SECTIONS.map((x) => x.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const sec of SETTINGS_SECTIONS) {
    assert.match(sec.icon, /^mdi:/, sec.id);
    assert.ok(sec.help.what.length > 20 && sec.help.when.length > 10, sec.id);
    for (const f of sec.fields) {
      assert.ok(f.help && f.help.what.length > 10 && f.help.when.length > 5, `${sec.id}: ${f.entity}`);
    }
  }
});

test("blocchi: la vista porta gruppo, icona, spiegazione e spiegazione delle righe", () => {
  const v = buildSettingsView({
    "input_boolean.caldaia_salvaguardia_attiva": st("on"),
    "input_number.caldaia_salvaguardia_t_puffer": st("40", { min: 30, max: 70, step: 1, unit_of_measurement: "°C" }),
  });
  assert.equal(v[0].id, "partenze");
  assert.equal(v[0].group, "riscaldamento");
  assert.match(v[0].icon, /^mdi:/);
  assert.ok(v[0].help.what.length > 0);
  assert.ok(v[0].rows[0].help);
});

test("gruppi: ogni blocco sta in un gruppo che esiste", () => {
  const ids = SETTINGS_GROUPS.map((g) => g.id);
  for (const sec of SETTINGS_SECTIONS) assert.ok(ids.includes(sec.group), sec.id);
});

test("interruttore generale: esce dalle righe e va nell'intestazione", () => {
  const v = buildSettingsView({
    "input_boolean.caldaia_assenza_attiva": st("on"),
    "input_boolean.caldaia_assenza_ospiti": st("off"),
    "input_number.caldaia_assenza_minuti": st("60", { min: 10, max: 240, step: 5, unit_of_measurement: "min" }),
    "input_number.caldaia_assenza_t_esterna_min": st("5", { min: -10, max: 15, step: 1, unit_of_measurement: "°C" }),
  });
  assert.equal(v[0].master?.entity, "input_boolean.caldaia_assenza_attiva");
  assert.deepEqual(v[0].rows.map((r) => r.entity), ["input_boolean.caldaia_assenza_ospiti", "input_number.caldaia_assenza_minuti", "input_number.caldaia_assenza_t_esterna_min"]);
  assert.equal(v[0].summary, "Spegne dopo 60 min di casa vuota");
  assert.match(v[0].notes[0], /da 60 minuti/);
  assert.match(v[0].notes[0], /meno di 5 °C/);
});

test("riepilogo: blocco spento o non disponibile", () => {
  const spento = buildSettingsView({ "input_boolean.caldaia_assenza_attiva": st("off"), "input_number.caldaia_assenza_minuti": st("60", { min: 10, max: 240, step: 5 }) });
  assert.equal(spento[0].summary, "Disattivato: la caldaia non si spegne da sola");
  assert.deepEqual(spento[0].notes, []);
  const nd = buildSettingsView({ "input_boolean.caldaia_salvaguardia_attiva": st("unavailable") });
  assert.equal(nd[0].summary, "Non disponibile");
});

test("riepilogo: caldaia e puffer, pompa di integrazione, modello del collettore", () => {
  const v = buildSettingsView({
    "climate.casale_acqua": st("heat", { temperature: 65, min_temp: 50, max_temp: 75, target_temp_step: 1 }),
    "number.casale_setpoint_boiler": st("50", { min: 45, max: 70, step: 1, unit_of_measurement: "°C" }),
    "input_boolean.caldaia_integrazione_blocco_attivo": st("on"),
    "input_boolean.caldaia_integrazione_forzatura_attiva": st("on"),
    "input_number.caldaia_integrazione_temp_max": st("60", { min: 40, max: 70, step: 1, unit_of_measurement: "°C" }),
    "input_number.caldaia_integrazione_isteresi_max": st("2", { min: 0.5, max: 10, step: 0.5, unit_of_measurement: "°C" }),
    "input_number.solare_termico_k": st("0.078", { min: 0.01, max: 0.3, step: 0.001, unit_of_measurement: "K·m²/W" }),
    "input_number.solare_termico_tau": st("120", { min: 1, max: 360, step: 5, unit_of_measurement: "min" }),
    "input_number.solare_termico_inclinazione": st("22", { min: 0, max: 90, step: 1, unit_of_measurement: "°" }),
    "input_number.solare_termico_orientamento": st("270", { min: 0, max: 360, step: 1, unit_of_measurement: "°" }),
  });
  const by = (id: string) => v.find((x) => x.id === id)!;
  assert.equal(by("caldaia").summary, "Acqua 65 °C · puffer 50 °C");
  assert.equal(by("integrazione").summary, "Blocco attivo · forzatura attiva · testa boiler max 60 °C");
  assert.equal(by("integrazione").notes[0], "La pompa smette di scaldare quando la testa del boiler arriva a 60 °C e riparte sotto 58 °C.");
  assert.equal(by("solare").summary, "k 0,078 · inerzia 120 min · 22° verso 270°");
  assert.equal(by("solare").group, "taratura");
  assert.equal(by("solare").advanced, true);
});

const bloccoRows = (b: number, s: number) =>
  buildSettingsView({
    "input_number.caldaia_integrazione_delta_blocco": st(String(b), { min: 0, max: 15, step: 0.5, unit_of_measurement: "°C" }),
    "input_number.caldaia_integrazione_delta_sblocco": st(String(s), { min: 1, max: 20, step: 0.5, unit_of_measurement: "°C" }),
  })[0].rows;

test("barra delle soglie: zone e segnaposto", () => {
  const rows = bloccoRows(4, 7);
  const zona = (p: number, b: number) => integrazioneBar(rows, { puffer: p, boiler: b })!;
  assert.equal(zona(55, 56).zone, "ferma"); // puffer piu' freddo del boiler
  assert.equal(zona(59, 55).zone, "attesa"); // +4: ne' sotto ne' sopra le soglie
  assert.equal(zona(62.5, 55).zone, "gira"); // +7,5: sopra la soglia di sblocco
  assert.equal(zona(55, 56).markerPct, 0); // la differenza negativa resta sul bordo
  const b = zona(61, 55);
  assert.equal(b.delta, 6);
  assert.equal(b.zone, "attesa");
  assert.ok(b.blockPct < b.markerPct! && b.markerPct! < b.unblockPct);
  assert.match(b.text, /6 °C più caldo del boiler/);
  assert.match(b.text, /resta com'è/);
  assert.match(zona(50, 54).text, /4 °C più freddo del boiler: la pompa resta ferma/);
});

test("barra delle soglie: senza temperature non c'è segnaposto, senza soglie non c'è barra", () => {
  const rows = bloccoRows(4, 7);
  const senza = integrazioneBar(rows, { puffer: null, boiler: 50 })!;
  assert.equal(senza.markerPct, null);
  assert.equal(senza.text, "");
  assert.equal(integrazioneBar([], undefined), undefined);
  assert.ok(senza.max >= 10 && senza.max >= 7 * 1.6);
});

test("attesa di conferma: il riepilogo e la barra seguono il valore appena scelto", () => {
  const v = buildSettingsView({
    "input_boolean.caldaia_integrazione_blocco_attivo": st("on"),
    "input_number.caldaia_integrazione_temp_max": st("55", { min: 40, max: 70, step: 1, unit_of_measurement: "°C" }),
    "input_number.caldaia_integrazione_isteresi_max": st("2", { min: 0.5, max: 10, step: 0.5, unit_of_measurement: "°C" }),
  });
  assert.match(v[0].summary, /testa boiler max 55 °C/);
  const r = applyPending(v, { "input_number.caldaia_integrazione_temp_max": { value: 60, until: 1000 } }, 0);
  assert.match(r.sections[0].summary, /testa boiler max 60 °C/);
  assert.match(r.sections[0].notes[0], /arriva a 60 °C e riparte sotto 58 °C/);
});

test("salvaguardia: riepilogo e frase con la temperatura d'uso del boiler, il puffer solo per la riaccensione", () => {
  const v = buildSettingsView({
    "input_boolean.caldaia_salvaguardia_attiva": st("on"),
    "input_number.caldaia_t_uso_acqua": st("43", { min: 30, max: 60, step: 1, unit_of_measurement: "°C" }),
    "input_number.caldaia_salvaguardia_t_puffer": st("50", { min: 30, max: 70, step: 1, unit_of_measurement: "°C" }),
  });
  const sec = v.find((x) => x.id === "partenze")!;
  assert.equal(sec.summary, "Attiva: annulla la partenza se il boiler è già sopra 43 °C");
  assert.deepEqual(sec.rows.map((r) => r.entity), ["input_number.caldaia_t_uso_acqua", "input_number.caldaia_salvaguardia_t_puffer"]);
  assert.match(sec.notes[0], /già sopra 43 °C e il termostato non chiede calore/);
  assert.match(sec.notes[0], /puffer sotto 50 °C/);
  const off = buildSettingsView({ "input_boolean.caldaia_salvaguardia_attiva": st("off"), "input_number.caldaia_t_uso_acqua": st("43", { min: 30, max: 60, step: 1 }) }).find((x) => x.id === "partenze")!;
  assert.equal(off.summary, "Disattivata: la caldaia parte sempre con il programma");
  assert.deepEqual(off.notes, []);
});
