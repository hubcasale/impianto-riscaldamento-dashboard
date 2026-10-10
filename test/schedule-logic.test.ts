import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_PRESETS,
  dayIndex,
  describeOverlaps,
  findOverlaps,
  formatHM,
  hmToMinutes,
  parseTimeState,
  planPreset,
  programEntityIds,
  segmentsOnDay,
  toTimeValue,
  type ProgramState,
} from "../src/schedule-logic";

const week = (...on: number[]) => [0, 1, 2, 3, 4, 5, 6].map((d) => on.includes(d));
const prog = (n: number, on: string | null, off: string | null, days: boolean[], sb = 45, sw = 65): ProgramState => ({
  n,
  on: on === null ? null : hmToMinutes(on),
  off: off === null ? null : hmToMinutes(off),
  days,
  setBoiler: sb,
  setWater: sw,
});

test("tempi: parsing e formattazione", () => {
  assert.equal(parseTimeState("05:30:00"), 330);
  assert.equal(parseTimeState("unknown"), null);
  assert.equal(parseTimeState(undefined), null);
  assert.equal(formatHM(330), "05:30");
  assert.equal(formatHM(1440), "00:00");
  assert.equal(formatHM(null), "--:--");
  assert.equal(hmToMinutes("07:34"), 450); // 454 min -> 450 (07:30), passo di 10 minuti
  assert.equal(toTimeValue(1440), "00:00:00");
});

test("nomi dei giorni, italiano e inglese", () => {
  assert.equal(dayIndex("lun"), 0);
  assert.equal(dayIndex("Mon"), 0);
  assert.equal(dayIndex("Sabato"), 5);
  assert.equal(dayIndex("giovedì"), 3);
  assert.equal(dayIndex("xyz"), null);
});

test("sovrapposizione tra P1 e P3 il lunedì (dati reali della caldaia)", () => {
  const p1 = prog(1, "05:30", "08:00", week(0, 1, 2, 3, 4, 5));
  const p3 = prog(3, "07:00", "09:30", week(0));
  const o = findOverlaps([p1, p3]);
  assert.equal(o.length, 1);
  assert.deepEqual([o[0].day, o[0].a, o[0].b, o[0].start, o[0].end], [0, 1, 3, 420, 480]);
  assert.match(describeOverlaps(o)[0], /P1 e P3 .*Lun.*07:00.*08:00/);
});

test("fasce che si toccano soltanto non sono sovrapposte", () => {
  const a = prog(1, "06:00", "08:00", week(0));
  const b = prog(2, "08:00", "10:00", week(0));
  assert.equal(findOverlaps([a, b]).length, 0);
});

test("programmi in giorni diversi non si sovrappongono", () => {
  const a = prog(1, "06:00", "08:00", week(0));
  const b = prog(2, "06:00", "08:00", week(1));
  assert.equal(findOverlaps([a, b]).length, 0);
});

test("spegnimento 00:00 vale fino a mezzanotte", () => {
  const a = prog(1, "22:00", "00:00", week(0));
  assert.deepEqual(segmentsOnDay(a, 0), [{ start: 1320, end: 1440 }]);
  assert.deepEqual(segmentsOnDay(a, 1), []);
});

test("programma che scavalca la mezzanotte occupa anche il giorno dopo", () => {
  const a = prog(1, "22:00", "02:00", week(0));
  assert.deepEqual(segmentsOnDay(a, 0), [{ start: 1320, end: 1440 }]);
  assert.deepEqual(segmentsOnDay(a, 1), [{ start: 0, end: 120 }]);
  const b = prog(2, "01:00", "03:00", week(1));
  const o = findOverlaps([a, b]);
  assert.equal(o.length, 1);
  assert.equal(o[0].day, 1);
});

test("orari non impostati o uguali non generano fasce", () => {
  assert.deepEqual(segmentsOnDay(prog(1, null, "08:00", week(0)), 0), []);
  assert.deepEqual(segmentsOnDay(prog(1, "08:00", "08:00", week(0)), 0), []);
});

test("preset: solo le differenze", () => {
  const current = [
    prog(1, "05:30", "08:00", week(0, 1, 2, 3, 4, 5)),
    prog(2, "12:00", "00:00", week()),
    prog(3, "07:00", "09:30", week()),
    prog(4, "12:00", "00:00", week()),
  ];
  const preset = DEFAULT_PRESETS.find((p) => p.name === "Feriale")!;
  const plan = planPreset({ prefix: "casale", master: "switch.casale_cronotermostato_settimanale", programs: current, cronoOn: true }, preset);
  const labels = plan.map((a) => a.label);
  // P1: solo la domenica da accendere
  assert.ok(labels.includes("P1 Dom attivo"));
  assert.equal(labels.filter((l) => l.startsWith("P1")).length, 1);
  // P2: orari nuovi e 7 giorni
  assert.ok(labels.includes("P2 accensione 17:00"));
  assert.ok(labels.includes("P2 spegnimento 22:30"));
  assert.equal(labels.filter((l) => l.startsWith("P2") && l.endsWith("attivo")).length, 7);
  // P3 e P4 già senza giorni: nessuna operazione
  assert.equal(labels.filter((l) => l.startsWith("P3") || l.startsWith("P4")).length, 0);
  // il crono è già attivo
  assert.ok(!labels.some((l) => l.startsWith("Cronotermostato")));
  const dom = plan.find((a) => a.label === "P1 Dom attivo")!;
  assert.equal(dom.entity_id, "switch.casale_crono_p1_domenica");
  assert.equal(dom.service, "turn_on");
});

test("preset vacanza: spegne solo il cronotermostato", () => {
  const current = [prog(1, "05:30", "08:00", week(0)), prog(2, null, null, week()), prog(3, null, null, week()), prog(4, null, null, week())];
  const preset = DEFAULT_PRESETS.find((p) => p.name === "Vacanza")!;
  const plan = planPreset({ prefix: "casale", master: "switch.casale_cronotermostato_settimanale", programs: current, cronoOn: true }, preset);
  assert.equal(plan.length, 1);
  assert.equal(plan[0].service, "turn_off");
  assert.equal(plan[0].entity_id, "switch.casale_cronotermostato_settimanale");
});

test("preset già applicato: nessuna operazione", () => {
  const preset = DEFAULT_PRESETS.find((p) => p.name === "Weekend")!;
  const all = week(0, 1, 2, 3, 4, 5, 6);
  const current = [prog(1, "07:00", "23:00", all), prog(2, "17:00", "22:30", week()), prog(3, "07:00", "09:30", week()), prog(4, "12:00", "00:00", week())];
  const plan = planPreset({ prefix: "casale", master: "switch.m", programs: current, cronoOn: true }, preset);
  assert.equal(plan.length, 0);
});

test("id delle entità", () => {
  const ids = programEntityIds("casale", 2);
  assert.equal(ids.on, "time.casale_crono_p2_accensione");
  assert.equal(ids.setWater, "number.casale_crono_p2_setpoint_acqua");
  assert.equal(ids.day[2], "switch.casale_crono_p2_mercoledi");
});

import { describeProgram, formatDays, mergePresets, removeSaved, sanitizeSaved, snapshotPreset, upsertSaved, planPreset as _plan, DEFAULT_PRESETS as _DEF, programEntityIds as _ids } from "../src/schedule-logic";

const pg = (n: number, on: number | null, off: number | null, days: number[], sb: number | null = 45, sw: number | null = 65) => ({
  n, on, off, days: [0, 1, 2, 3, 4, 5, 6].map((d) => days.includes(d)), setBoiler: sb, setWater: sw,
});

test("giorni: tutti, intervalli, elenco, nessuno", () => {
  assert.equal(formatDays([true, true, true, true, true, true, true]), "tutti i giorni");
  assert.equal(formatDays([true, true, true, true, true, true, false]), "Lun–Sab");
  assert.equal(formatDays([true, false, true, false, true, false, false]), "Lun, Mer, Ven");
  assert.equal(formatDays([false, false, false, false, false, false, true]), "Dom");
  assert.equal(formatDays([true, true, false, false, false, false, false]), "Lun, Mar");
  assert.equal(formatDays([false, false, false, false, false, false, false]), "nessun giorno");
});

test("descrizione del programma", () => {
  assert.equal(describeProgram(pg(1, 330, 480, [0, 1, 2, 3, 4, 5])), "P1 05:30–08:00 · Lun–Sab · Set boiler 45 °C, Set acqua 65 °C");
  assert.equal(describeProgram(pg(2, 1020, 0, [0], null, null)), "P2 17:00–00:00 · Lun");
});

test("istantanea: orari, giorni, temperature e crono", () => {
  const programs = [pg(1, 330, 480, [0, 1, 2, 3, 4, 5], 50, 65), pg(2, 1020, 0, [0, 1, 2, 3, 4, 5], 50, 65), pg(3, 420, 570, [6]), pg(4, 1020, 0, [6])];
  const p = snapshotPreset("  Inverno ", programs, true, undefined, new Date(2026, 9, 10));
  assert.equal(p.name, "Inverno");
  assert.equal(p.crono, true);
  assert.equal(p.description, "Salvato il 10/10/2026");
  assert.deepEqual(p.programs?.["1"], { days: ["lun", "mar", "mer", "gio", "ven", "sab"], on: "05:30", off: "08:00", set_boiler: 50, set_water: 65 });
  assert.equal((p.programs?.["2"] as { off: string }).off, "00:00");
  assert.deepEqual((p.programs?.["4"] as { days: string[] }).days, ["dom"]);
});

test("istantanea: crono non disponibile non si salva; icona del preset sostituito", () => {
  const p = snapshotPreset("X", [pg(1, 330, 480, [])], null, { name: "X", icon: "mdi:palm-tree" });
  assert.equal(p.crono, undefined);
  assert.equal(p.icon, "mdi:palm-tree");
  assert.deepEqual((p.programs?.["1"] as { days: string[] }).days, []);
});

test("istantanea riapplicata sulla stessa programmazione: nessuna modifica", () => {
  const programs = [pg(1, 330, 480, [0, 1, 2, 3, 4, 5], 50, 65), pg(2, 1020, 0, [0, 1, 2, 3, 4, 5]), pg(3, 420, 570, [6]), pg(4, 1020, 0, [6])];
  const p = snapshotPreset("Tutto", programs, true);
  assert.equal(_plan({ prefix: "casale", master: "switch.m", programs, cronoOn: true }, p).length, 0);
});

test("istantanea applicata a un'altra programmazione: riporta tutto com'era", () => {
  const saved = [pg(1, 330, 480, [0, 1, 2], 50, 65), pg(2, 1020, 0, [0]), pg(3, 420, 570, []), pg(4, 1020, 0, [])];
  const now = [pg(1, 360, 480, [0, 1, 2, 3], 45, 65), pg(2, 1020, 0, [0]), pg(3, 420, 570, [6]), pg(4, 1020, 0, [])];
  const plan = _plan({ prefix: "casale", master: "switch.m", programs: now, cronoOn: false }, snapshotPreset("S", saved, true));
  const labels = plan.map((a) => a.label);
  assert.ok(labels.includes("P1 accensione 05:30"));
  assert.ok(labels.includes("P1 set boiler 50 °C"));
  assert.ok(labels.includes("P1 Gio spento"));
  assert.ok(labels.includes("P3 Dom spento"));
  assert.ok(labels.includes("Cronotermostato attivo"));
});

test("unione con i preset predefiniti", () => {
  const custom = snapshotPreset("Weekend", [pg(1, 420, 1380, [5, 6])], true);
  const extra = snapshotPreset("Inverno", [pg(1, 330, 480, [0])], true);
  const merged = mergePresets(_DEF, [custom, extra]);
  assert.equal(merged.length, _DEF.length + 1);
  assert.equal(merged.find((p) => p.name === "Weekend"), custom); // sostituisce quello predefinito
  assert.equal(merged[merged.length - 1].name, "Inverno");
  assert.equal(merged.map((p) => p.name).indexOf("Weekend"), _DEF.map((p) => p.name).indexOf("Weekend")); // stessa posizione
});

test("salvati: sostituzione per nome, eliminazione, dati sporchi", () => {
  const a = snapshotPreset("A", [], null);
  const a2 = { ...a, description: "nuovo" };
  assert.deepEqual(upsertSaved([a], a2), [a2]);
  assert.equal(upsertSaved([a], snapshotPreset("B", [], null)).length, 2);
  assert.deepEqual(removeSaved([a], "A"), []);
  assert.deepEqual(sanitizeSaved(null), []);
  assert.deepEqual(sanitizeSaved({ presets: [a, { name: "" }, 5, null, { x: 1 }] }), [a]);
  assert.equal(_ids("casale", 1).on, "time.casale_crono_p1_accensione");
});
