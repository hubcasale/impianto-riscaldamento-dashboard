import { test } from "node:test";
import assert from "node:assert/strict";
import { SECTION_KEYS, defaultSections, sectionsSummary, toggleSection, visibleKeys } from "../src/sections-logic";

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
