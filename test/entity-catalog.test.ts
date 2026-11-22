import { test } from "node:test";
import assert from "node:assert/strict";
import { ENTITY_GROUPS, applyGroup, groupChanged, groupMissing, groupValues, keyDomain } from "../src/entity-catalog";
import { DEFAULT_ENTITIES } from "../src/plant-entities";
import { applyParts, partsValues, type EditorConfig } from "../src/editor-logic";

const BASE: EditorConfig = { type: "custom:impianto-overview-card" };
const G = (id: string) => ENTITY_GROUPS.find((g) => g.id === id)!;

test("entità: ogni chiave di partenza sta in un gruppo, una volta sola", () => {
  const keys = ENTITY_GROUPS.flatMap((g) => g.items.map((i) => i.key as string));
  assert.equal(new Set(keys).size, keys.length);
  for (const k of Object.keys(DEFAULT_ENTITIES)) assert.ok(keys.includes(k), `manca ${k}`);
  assert.ok(keys.includes("outlet"));
});

test("entità: i valori sono quelli di partenza finché non si cambiano", () => {
  const v = groupValues(BASE, G("caldaia"));
  assert.equal(v.stove_state, "sensor.casale_stato");
  assert.equal(groupValues(BASE, G("accumulo")).outlet, "");
  assert.equal(groupChanged(BASE, G("caldaia")), 0);
});

test("entità: si scrive solo quello che cambia e gli altri gruppi restano", () => {
  const start: EditorConfig = { ...BASE, entities: { puffer: "sensor.altro_puffer" } };
  const v = { ...groupValues(start, G("caldaia")), stove_state: "sensor.nuovo_stato" };
  const cfg = applyGroup(start, G("caldaia"), v);
  assert.deepEqual(cfg.entities, { puffer: "sensor.altro_puffer", stove_state: "sensor.nuovo_stato" });
  assert.equal(groupChanged(cfg, G("caldaia")), 1);
  // svuotato o rimesso uguale: torna quella di partenza
  const back = applyGroup(cfg, G("caldaia"), { ...groupValues(cfg, G("caldaia")), stove_state: "" });
  assert.deepEqual(back.entities, { puffer: "sensor.altro_puffer" });
  const none = applyGroup(back, G("accumulo"), { ...groupValues(back, G("accumulo")), puffer: DEFAULT_ENTITIES.puffer });
  assert.deepEqual(none, BASE);
});

test("entità: quelle che non esistono si contano, le facoltative vuote no", () => {
  const exists = (id: string) => id !== "sensor.casale_allarme";
  assert.equal(groupMissing(BASE, G("caldaia"), exists), 1);
  assert.equal(groupMissing(BASE, G("accumulo"), () => true), 0);
});

test("entità: dominio per il selettore", () => {
  assert.equal(keyDomain("set_water"), "climate");
  assert.equal(keyDomain("boost_start_script"), "script");
  assert.equal(keyDomain("outlet"), null);
});

test("stufa e termostato: titolo e voce", () => {
  assert.deepEqual(partsValues({ ...BASE, stufa: true }), { stufa_title: "", stufa_entry: "", thermo_title: "", thermo_entry: "" });
  const cfg = applyParts({ ...BASE, stufa: true }, { stufa_title: "Stufa sala", stufa_entry: "abc", thermo_title: "", thermo_entry: "xyz" });
  assert.deepEqual(cfg.stufa, { entry_id: "abc", title: "Stufa sala" });
  assert.deepEqual(cfg.thermostat, { entry_id: "xyz" });
  const back = applyParts(cfg, { stufa_title: "", stufa_entry: "", thermo_title: "", thermo_entry: "" });
  assert.deepEqual(back, { ...BASE, stufa: true });
  // senza stufa e con il termostato nascosto non si accende nulla da solo
  const off: EditorConfig = { ...BASE, thermostat: false };
  assert.deepEqual(applyParts(off, partsValues(off)), off);
});
