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
