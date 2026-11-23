import { test } from "node:test";
import assert from "node:assert/strict";
import { tintColor } from "../src/color-logic";

test("colore: un nome della tavolozza di Home Assistant segue il tema", () => {
  assert.equal(tintColor("deep-orange"), "var(--deep-orange-color, #ff6f22)");
  assert.equal(tintColor("Blue"), "var(--blue-color, #2196f3)");
  assert.equal(tintColor("primary"), "var(--primary-color)");
  assert.equal(tintColor("accent"), "var(--accent-color)");
});

test("colore: un colore CSS scritto a mano passa com'è", () => {
  assert.equal(tintColor("#FF5722"), "#ff5722");
  assert.equal(tintColor(" rgb(255, 87, 34) "), "rgb(255, 87, 34)");
  assert.equal(tintColor("rgba(255,87,34,0.5)"), "rgba(255,87,34,0.5)");
});

test("colore: senza colore, o con «nessuno», la scheda resta com'è", () => {
  for (const none of [undefined, null, "", "  ", "none", "default"]) assert.equal(tintColor(none), undefined, String(none));
});

test("colore: quello che non è un colore non tinge niente", () => {
  for (const bad of [42, ["blue"], "bluastro", "red; background: url(x)", "var(--x)", "#12", "rgb(1,2,3); x"]) assert.equal(tintColor(bad), undefined, String(bad));
});
