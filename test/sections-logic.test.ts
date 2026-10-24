import { test } from "node:test";
import assert from "node:assert/strict";
import { SECTION_KEYS, defaultSections, normalizeSections, sectionsSummary, sectionsToStore, toggleSection, visibleKeys } from "../src/sections-logic";

test("sezioni: di partenza sono tutte visibili", () => {
  assert.deepEqual(defaultSections(), { boiler: true, caldaia: true, stufa: true, termostato: true });
  assert.deepEqual(visibleKeys(defaultSections()), SECTION_KEYS);
});

test("sezioni: l'elenco show della configurazione limita quelle di partenza", () => {
  assert.deepEqual(defaultSections(["caldaia", "termostato"]), { boiler: false, caldaia: true, stufa: false, termostato: true });
  assert.deepEqual(defaultSections(["boh"]), defaultSections());
  assert.deepEqual(defaultSections([]), defaultSections());
  assert.deepEqual(defaultSections("caldaia"), defaultSections());
});

test("sezioni: la scelta dell'utente vince sulla configurazione, i valori non validi no", () => {
  const s = normalizeSections({ version: 1, sections: { boiler: false, stufa: "si", termostato: false } });
  assert.deepEqual(s, { boiler: false, caldaia: true, stufa: true, termostato: false });
  assert.deepEqual(normalizeSections(null), defaultSections());
  assert.deepEqual(normalizeSections({ sections: { caldaia: true } }, ["boiler"]).caldaia, true);
  assert.deepEqual(normalizeSections(undefined, ["boiler"]), { boiler: true, caldaia: false, stufa: false, termostato: false });
});

test("sezioni: una scelta con tutto spento torna ai valori di partenza", () => {
  const spento = { version: 1, sections: { boiler: false, caldaia: false, stufa: false, termostato: false } };
  assert.deepEqual(normalizeSections(spento), defaultSections());
});

test("sezioni: l'ultima sezione visibile non si spegne", () => {
  let s = defaultSections();
  s = toggleSection(s, "boiler");
  s = toggleSection(s, "caldaia");
  s = toggleSection(s, "stufa");
  assert.deepEqual(visibleKeys(s), ["termostato"]);
  assert.deepEqual(toggleSection(s, "termostato"), s);
  assert.equal(toggleSection(s, "boiler").boiler, true);
});

test("sezioni: riepilogo a parole", () => {
  assert.equal(sectionsSummary(defaultSections()), "Tutte le sezioni");
  assert.equal(sectionsSummary(defaultSections(["caldaia"])), "Solo caldaia a pellet (polygon)");
  assert.equal(sectionsSummary(defaultSections(["boiler", "termostato"])), "boiler solare, termostato ambiente");
});

test("sezioni: dato salvato", () => {
  assert.deepEqual(sectionsToStore(defaultSections(["stufa"])), { version: 1, sections: { boiler: false, caldaia: false, stufa: true, termostato: false } });
});
