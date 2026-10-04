import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_MODEL, fmt, showersEstimate, stoveLook, tempColor, toNumber } from "../src/plant-logic";

test("docce: boiler caldo in alto, freddo in basso", () => {
  // zona alta 95 L a 55,6 °C -> 95*(40,6)/23 = 167,7 L a 38 °C -> 4 docce da 40 L
  assert.equal(showersEstimate(55.6, 23.1, { ...DEFAULT_MODEL, volume: 190, topShare: 0.5 }), 4);
});

test("docce: tutto freddo", () => {
  assert.equal(showersEstimate(30, 20, DEFAULT_MODEL), 0);
});

test("docce: tutto caldo", () => {
  // 190 L a 60 °C -> 190*45/23 = 371 L -> 9 docce
  assert.equal(showersEstimate(60, 60, DEFAULT_MODEL), 9);
});

test("docce: sonda alta mancante", () => {
  assert.equal(showersEstimate(null, 40, DEFAULT_MODEL), null);
});

test("docce: sonda bassa mancante usa quella alta", () => {
  assert.equal(showersEstimate(60, null, DEFAULT_MODEL), 9);
});

test("stato della stufa", () => {
  assert.equal(stoveLook("WORK"), "work");
  assert.equal(stoveLook("START"), "start");
  assert.equal(stoveLook("ECO STOP"), "off");
  assert.equal(stoveLook("OFF"), "off");
  assert.equal(stoveLook("STAND BY"), "standby");
  assert.equal(stoveLook("WAIT"), "wait");
  assert.equal(stoveLook(undefined), "off");
});

test("formattazione", () => {
  assert.equal(fmt(55.6, 1), "55,6");
  assert.equal(fmt(null), "–");
  assert.equal(toNumber("12.5"), 12.5);
  assert.equal(toNumber("unavailable"), null);
  assert.equal(toNumber(""), null);
});

test("colore: freddo blu, caldo rosso", () => {
  assert.equal(tempColor(15), "rgb(59, 130, 246)");
  assert.equal(tempColor(10), "rgb(59, 130, 246)");
  assert.equal(tempColor(65), "rgb(239, 68, 68)");
  assert.equal(tempColor(80), "rgb(239, 68, 68)");
  assert.equal(tempColor(42), "rgb(252, 211, 77)");
  assert.equal(tempColor(null), "#94a3b8");
});
