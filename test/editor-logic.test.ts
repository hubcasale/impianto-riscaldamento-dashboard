import { test } from "node:test";
import assert from "node:assert/strict";
import { addRoom, applyGeneral, generalValues, moveRoom, removeRoom, roomComplete, roomDrafts, roomsOptions, setRooms, setRoomsOptions, updateRoom, type EditorConfig } from "../src/editor-logic";
import { DEFAULT_ROOMS, normalizeRooms } from "../src/rooms-logic";
import { defaultSections } from "../src/sections-logic";

const BASE: EditorConfig = { type: "custom:impianto-overview-card" };

test("editor: una configurazione vuota mostra tutto, senza stufa", () => {
  const v = generalValues(BASE);
  assert.equal(v.layout, "classic");
  assert.equal(v.boiler, "full");
  assert.deepEqual([v.show_boiler, v.show_caldaia, v.show_stufa, v.show_termostato, v.show_rooms], [true, true, false, true, true]);
  assert.deepEqual([v.btn_settings, v.btn_summary, v.btn_charts, v.btn_schedule], [true, true, true, true]);
});

test("editor: senza modifiche la configurazione resta com'è", () => {
  const cfg: EditorConfig = { ...BASE, layout: "split", stufa: { entry_id: "abc" }, grid_options: { columns: "full" }, entities: { puffer: "sensor.x" } };
  assert.deepEqual(applyGeneral(cfg, generalValues(cfg)), cfg);
  assert.deepEqual(applyGeneral(BASE, generalValues(BASE)), BASE);
});

test("editor: spegnere una sezione scrive l'elenco show, riaccenderla lo toglie", () => {
  const off = applyGeneral(BASE, { ...generalValues(BASE), show_boiler: false });
  assert.deepEqual(off.show, ["caldaia", "termostato"]);
  assert.deepEqual(defaultSections(off.show), { boiler: false, caldaia: true, stufa: false, termostato: true });
  const on = applyGeneral(off, { ...generalValues(off), show_boiler: true });
  assert.equal("show" in on, false);
});

test("editor: la stufa accesa viene configurata, spenta resta configurata ma fuori dall'elenco", () => {
  const on = applyGeneral(BASE, { ...generalValues(BASE), show_stufa: true });
  assert.equal(on.stufa, true);
  assert.equal("show" in on, false);
  const cfg: EditorConfig = { ...BASE, stufa: { entry_id: "abc" } };
  const off = applyGeneral(cfg, { ...generalValues(cfg), show_stufa: false });
  assert.deepEqual(off.stufa, { entry_id: "abc" });
  assert.deepEqual(off.show, ["boiler", "caldaia", "termostato"]);
  assert.equal(generalValues(off).show_stufa, false);
});

test("editor: il termostato nascosto con thermostat false torna visibile", () => {
  const cfg: EditorConfig = { ...BASE, thermostat: false };
  assert.equal(generalValues(cfg).show_termostato, false);
  const on = applyGeneral(cfg, { ...generalValues(cfg), show_termostato: true });
  assert.equal("thermostat" in on, false);
  assert.equal(generalValues(on).show_termostato, true);
});

test("editor: almeno una sezione resta visibile", () => {
  const cfg: EditorConfig = { ...BASE, show: ["boiler"] };
  assert.equal(applyGeneral(cfg, { ...generalValues(cfg), show_boiler: false }), cfg);
});

test("editor: titolo, disposizione, stanze e pulsanti", () => {
  const v = { ...generalValues(BASE), title: "  Impianto ", layout: "split" as const, boiler: "short" as const, show_rooms: false, btn_charts: false };
  const cfg = applyGeneral(BASE, v);
  assert.deepEqual(cfg, { ...BASE, title: "Impianto", layout: "split", boiler: "short", rooms: false, charts: false });
  const back = applyGeneral(cfg, { ...generalValues(cfg), title: "", layout: "classic", boiler: "full", show_rooms: true, btn_charts: true });
  assert.deepEqual(back, BASE);
});

test("editor: le opzioni della programmazione restano quando il pulsante è acceso", () => {
  const cfg: EditorConfig = { ...BASE, schedule: { prefix: "casale" } };
  assert.deepEqual(applyGeneral(cfg, generalValues(cfg)).schedule, { prefix: "casale" });
});

test("stanze: senza elenco si parte da quelle predefinite", () => {
  const d = roomDrafts(BASE);
  assert.equal(d.length, DEFAULT_ROOMS.length);
  assert.equal(d[2].short, "Matrimon.");
  assert.equal(d[0].short, "");
});

test("stanze: aggiungere, compilare, spostare e togliere", () => {
  let rooms = addRoom(roomDrafts(BASE));
  const last = rooms.length - 1;
  assert.equal(roomComplete(rooms[last]), false);
  assert.equal(new Set(rooms.map((r) => r.id)).size, rooms.length);
  rooms = updateRoom(rooms, last, { name: "Studio", temperature: "sensor.studio_t" });
  assert.equal(roomComplete(rooms[last]), true);
  rooms = moveRoom(rooms, last, -1);
  assert.equal(rooms[last - 1].name, "Studio");
  assert.equal(moveRoom(rooms, 0, -1), rooms);
  rooms = removeRoom(rooms, 0);
  assert.equal(rooms[0].name, "Cucina");
  const cfg = setRooms({ ...BASE, rooms: { title: "Casa" } }, rooms);
  const obj = cfg.rooms as { title: string; rooms: unknown[] };
  assert.equal(obj.title, "Casa");
  assert.equal(normalizeRooms(obj.rooms).length, rooms.length);
  assert.deepEqual(roomDrafts(cfg), rooms);
});

test("stanze: una stanza incompleta resta nell'editor ma non nella scheda", () => {
  const cfg = setRooms(BASE, addRoom(roomDrafts(BASE)));
  assert.equal(roomDrafts(cfg).length, DEFAULT_ROOMS.length + 1);
  assert.equal(normalizeRooms((cfg.rooms as { rooms: unknown }).rooms).length, DEFAULT_ROOMS.length);
});

test("stanze: titolo e termostato dell'obiettivo", () => {
  const cfg = setRoomsOptions(BASE, { title: "Casa", target_entity: "climate.altro" });
  assert.deepEqual(cfg.rooms, { title: "Casa", target_entity: "climate.altro" });
  assert.deepEqual(roomsOptions(cfg), { title: "Casa", target_entity: "climate.altro" });
  assert.deepEqual(setRoomsOptions(cfg, { title: "", target_entity: "" }), BASE);
});
