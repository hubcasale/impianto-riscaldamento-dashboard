import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_ROOMS,
  barFraction,
  fmtNum,
  humClass,
  normalizeRooms,
  roomExists,
  roomValues,
  shortName,
  summarize,
  tempClass,
  toNum,
} from "../src/rooms-logic";
import { lighten, roomEntityKey, roomEntityOf, roomsGroup } from "../src/charts-logic";

test("toNum: numeri, virgola decimale, stati non validi", () => {
  assert.equal(toNum("22.3"), 22.3);
  assert.equal(toNum("22,3"), 22.3);
  assert.equal(toNum("unavailable"), null);
  assert.equal(toNum("unknown"), null);
  assert.equal(toNum(""), null);
  assert.equal(toNum(undefined), null);
  assert.equal(toNum("abc"), null);
});

test("tempClass: da 22 caldo, sotto 19 freddo, in mezzo bene", () => {
  assert.equal(tempClass(22), "warm");
  assert.equal(tempClass(21.9), "ok");
  assert.equal(tempClass(19), "ok");
  assert.equal(tempClass(18.9), "cool");
});

test("humClass: da 70 troppa, da 60 alta, sotto 40 secca", () => {
  assert.equal(humClass(74), "bad");
  assert.equal(humClass(70), "bad");
  assert.equal(humClass(69.9), "amber");
  assert.equal(humClass(60), "amber");
  assert.equal(humClass(59.9), "ok");
  assert.equal(humClass(40), "ok");
  assert.equal(humClass(39.9), "dry");
});

test("barFraction: tra 16 e 24 °C, con limiti", () => {
  assert.equal(barFraction(16), 0);
  assert.equal(barFraction(20), 0.5);
  assert.equal(barFraction(24), 1);
  assert.equal(barFraction(10), 0);
  assert.equal(barFraction(30), 1);
});

test("roomValues e summarize: più calda, più fredda, umidità alta ordinata, medie", () => {
  const states: Record<string, string> = {
    "sensor.sensore_soggiorno_temperature": "22.3",
    "sensor.sensore_soggiorno_humidity": "57",
    "sensor.sensore_camera_matrimoniale_temperature": "20.4",
    "sensor.sensore_camera_matrimoniale_humidity": "63",
    "sensor.sensore_bagno_blu_temperature": "20.6",
    "sensor.sensore_bagno_blu_humidity": "74",
    "sensor.sensore_cucina_temperature": "unavailable",
  };
  const v = roomValues(DEFAULT_ROOMS, (id) => states[id]);
  const s = summarize(v);
  assert.equal(s.warmest?.room.id, "soggiorno");
  assert.equal(s.coolest?.room.id, "matrimoniale");
  assert.deepEqual(s.humid.map((x) => x.room.id), ["bagno_blu"]);
  assert.equal(Math.round((s.avgT as number) * 100) / 100, 21.1);
  assert.equal(Math.round(s.avgH as number), 65);
});

test("summarize: senza dati tutto è nullo", () => {
  const s = summarize(roomValues(DEFAULT_ROOMS, () => undefined));
  assert.equal(s.warmest, null);
  assert.equal(s.coolest, null);
  assert.deepEqual(s.humid, []);
  assert.equal(s.avgT, null);
  assert.equal(s.avgH, null);
});

test("roomExists: basta uno dei due sensori", () => {
  const bagnoVerde = DEFAULT_ROOMS.find((r) => r.id === "bagno_verde")!;
  assert.equal(roomExists(bagnoVerde, () => false), false);
  assert.equal(roomExists(bagnoVerde, (id) => id === bagnoVerde.humidity), true);
});

test("normalizeRooms: valori non validi lasciano quelli di partenza; si leggono nome, id e nome corto", () => {
  assert.equal(normalizeRooms(undefined), DEFAULT_ROOMS);
  assert.equal(normalizeRooms([]), DEFAULT_ROOMS);
  assert.equal(normalizeRooms([{ nome: "x" }, null, 3]), DEFAULT_ROOMS);
  const r = normalizeRooms([
    { name: " Studio ", temperature: "sensor.a_t", humidity: "sensor.a_h", short: "Stud." },
    { name: "Garage", temperature: "sensor.g_t" },
    { name: "Senza sensori" },
  ]);
  assert.equal(r.length, 2);
  assert.equal(r[0].name, "Studio");
  assert.equal(r[0].id, "stanza1");
  assert.equal(shortName(r[0]), "Stud.");
  assert.equal(r[1].humidity, "");
  assert.equal(shortName(r[1]), "Garage");
});

test("fmtNum: virgola e trattino", () => {
  assert.equal(fmtNum(22.34), "22,3");
  assert.equal(fmtNum(null), "–");
  assert.equal(fmtNum(57, 0), "57");
});

test("grafici: roomEntityOf risolve i sensori anche con id con underscore", () => {
  assert.equal(roomEntityOf(DEFAULT_ROOMS, roomEntityKey("bagno_blu", "t")), "sensor.sensore_bagno_blu_temperature");
  assert.equal(roomEntityOf(DEFAULT_ROOMS, roomEntityKey("bagno_blu", "h")), "sensor.sensore_bagno_blu_humidity");
  assert.equal(roomEntityOf(DEFAULT_ROOMS, "room_inesistente_t"), undefined);
  assert.equal(roomEntityOf(DEFAULT_ROOMS, "boiler_top"), undefined);
});

test("grafici: roomsGroup con una stanza in primo piano accende solo le sue due serie", () => {
  const g = roomsGroup(DEFAULT_ROOMS, "cucina");
  assert.equal(g.id, "stanze");
  assert.equal(g.series.length, DEFAULT_ROOMS.length * 2);
  const on = g.series.filter((s) => s.on).map((s) => s.id);
  assert.deepEqual(on, ["cucina_t", "cucina_h"]);
  const h = g.series.find((s) => s.id === "cucina_h")!;
  assert.equal(h.axis, "r");
  assert.equal(h.unit, "%");
  assert.notEqual(h.color, g.series.find((s) => s.id === "cucina_t")!.color);
});

test("grafici: roomsGroup senza stanza in primo piano accende le temperature di tutte", () => {
  const g = roomsGroup(DEFAULT_ROOMS);
  assert.ok(g.series.filter((s) => s.id.endsWith("_t")).every((s) => s.on));
  assert.ok(g.series.filter((s) => s.id.endsWith("_h")).every((s) => !s.on));
});

test("lighten: schiarisce verso il bianco", () => {
  assert.equal(lighten("#000000", 0.5), "#808080");
  assert.equal(lighten("#ffffff", 0.5), "#ffffff");
  assert.equal(lighten("rosso", 0.5), "rosso");
});
