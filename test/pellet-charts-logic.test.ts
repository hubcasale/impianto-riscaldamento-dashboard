import { test } from "node:test";
import assert from "node:assert/strict";
import type { Pt } from "../src/charts-logic";
import {
  PELLET_RANGES, calibration, classifyDelta, consumptionBuckets, detectEvents, mergeSeries, rangeStart, runOut, statsToPoints, summarizePeriod, valueAt,
} from "../src/pellet-charts-logic";

const MIN = 60000;
const T0 = new Date(2026, 9, 20, 0, 0, 0).getTime(); // 20 ottobre, mezzanotte locale

/**
 * Serie finta come quelle di Home Assistant: il totale stimato cresce, i chili rimasti sono riferimento - (totale - totale di riferimento),
 * arrotondati a 0,1 come il sensore. `events` riscrive il riferimento a un certo minuto: kg = chili scritti (o delta rispetto alla stima).
 */
function build(minutes: number, perMin: (m: number) => number, events: { m: number; add?: number; setKg?: number }[]) {
  const rem: Pt[] = [];
  const tot: Pt[] = [];
  let total = 100;
  let refKg = 90;
  let refTot = 100;
  for (let m = 0; m <= minutes; m++) {
    total += perMin(m);
    const ev = events.find((e) => e.m === m);
    if (ev) {
      const est = refKg - (total - refTot);
      refKg = ev.setKg !== undefined ? ev.setKg : est + (ev.add ?? 0);
      refTot = total;
    }
    const t = T0 + m * MIN;
    tot.push({ t, v: Math.round(total * 100) / 100 });
    rem.push({ t, v: Math.round((refKg - (total - refTot)) * 10) / 10 });
  }
  return { rem, tot };
}

const steady = (m: number) => (m % 1440 < 600 ? 0.06 : 0.01); // di giorno consuma di piu'

test("pellet: nessun evento se il conteggio non viene riscritto (rumore di arrotondamento)", () => {
  const { rem, tot } = build(3 * 1440, steady, []);
  assert.deepEqual(detectEvents(rem, tot, T0, T0 + 3 * 1440 * MIN, 15), []);
});

test("pellet: un caricamento di un sacco da 15 kg", () => {
  const { rem, tot } = build(3 * 1440, steady, [{ m: 1500, add: 15 }]);
  const ev = detectEvents(rem, tot, T0, T0 + 3 * 1440 * MIN, 15);
  assert.equal(ev.length, 1);
  assert.equal(ev[0].kind, "carico");
  assert.equal(ev[0].bags, 1);
  assert.ok(Math.abs(ev[0].delta - 15) < 0.3);
  assert.ok(Math.abs(ev[0].t - (T0 + 1500 * MIN)) <= 2 * MIN);
  assert.ok(Math.abs(ev[0].after - ev[0].before - 15) < 0.3);
});

test("pellet: mezzo sacco e due sacchi", () => {
  assert.deepEqual(classifyDelta(7.5, 80, 15), { kind: "carico", bags: 0.5 });
  assert.deepEqual(classifyDelta(30.2, 100, 15), { kind: "carico", bags: 2 });
});

test("pellet: il serbatoio pieno taglia il caricamento ma resta un caricamento", () => {
  assert.equal(classifyDelta(11, 120, 15).kind, "carico");
  assert.equal(classifyDelta(11, 100, 15).kind, "misura");
});

test("pellet: una lettura del livello con scarto, consumo reale e stimato", () => {
  // prima un caricamento (dà il riferimento), poi una lettura 3 kg sotto la stima
  const probe = build(3 * 1440, steady, [{ m: 600, add: 15 }]);
  const estAt = valueAt(probe.rem, T0 + 2400 * MIN) as number;
  const { rem, tot } = build(3 * 1440, steady, [{ m: 600, add: 15 }, { m: 2400, setKg: estAt - 3 }]);
  const ev = detectEvents(rem, tot, T0, T0 + 3 * 1440 * MIN, 15);
  assert.deepEqual(ev.map((e) => e.kind), ["carico", "misura"]);
  const m = ev[1];
  assert.ok(Math.abs(m.delta + 3) < 0.35, `delta ${m.delta}`);
  assert.equal(m.bags, null);
  assert.ok(m.used !== null && m.used > 5);
  assert.ok(m.real !== null && Math.abs((m.real as number) - ((m.used as number) + 3)) < 0.4);
  assert.ok(m.ratio !== null && (m.ratio as number) > 1);
});

test("pellet: una lettura che differisce di pochissimo dalla stima non e' un evento", () => {
  const probe = build(1440, steady, []);
  const estAt = valueAt(probe.rem, T0 + 700 * MIN) as number;
  const { rem, tot } = build(1440, steady, [{ m: 700, setKg: estAt - 0.2 }]);
  assert.deepEqual(detectEvents(rem, tot, T0, T0 + 1440 * MIN, 15), []);
});

test("pellet: serie vuote", () => {
  assert.deepEqual(detectEvents([], [], 0, 1000, 15), []);
});

test("pellet: consumo per giorno dal totale cumulativo", () => {
  const { tot } = build(3 * 1440, steady, []);
  const b = consumptionBuckets(tot, T0, T0 + 3 * 1440 * MIN, "day");
  assert.equal(b.length, 3);
  const expected = 600 * 0.06 + 840 * 0.01;
  for (const x of b.slice(0, 2)) assert.ok(Math.abs(x.kg - expected) < 0.2, `${x.kg}`);
  assert.equal(b[0].partial, false);
});

test("pellet: il giorno in corso e' parziale e il contatore che scende non conta", () => {
  const tot: Pt[] = [{ t: T0, v: 50 }, { t: T0 + 6 * 3600000, v: 53 }, { t: T0 + 8 * 3600000, v: 1 }];
  const b = consumptionBuckets(tot, T0, T0 + 12 * 3600000, "day");
  assert.equal(b.length, 1);
  assert.equal(b[0].partial, true);
  assert.equal(b[0].kg, 0);
});

test("pellet: consumo per ora", () => {
  const tot: Pt[] = [{ t: T0, v: 10 }, { t: T0 + 30 * MIN, v: 11 }, { t: T0 + 90 * MIN, v: 12.5 }];
  const b = consumptionBuckets(tot, T0, T0 + 2 * 3600000, "hour");
  assert.deepEqual(b.map((x) => Math.round(x.kg * 10) / 10), [1, 1.5]);
});

test("pellet: inizio del periodo (ore tonde o mezzanotte)", () => {
  const now = new Date(2026, 9, 28, 15, 42).getTime();
  const r24 = PELLET_RANGES.find((r) => r.id === "24h")!;
  const r7 = PELLET_RANGES.find((r) => r.id === "7d")!;
  assert.equal(new Date(rangeStart(r24, now)).getHours(), 16);
  assert.equal(rangeStart(r24, now), new Date(2026, 9, 27, 16, 0).getTime());
  assert.equal(rangeStart(r7, now), new Date(2026, 9, 22, 0, 0).getTime());
});

test("pellet: riepilogo del periodo", () => {
  const { rem, tot } = build(3 * 1440, steady, [{ m: 1500, add: 15 }]);
  const ev = detectEvents(rem, tot, T0, T0 + 3 * 1440 * MIN, 15);
  const s = summarizePeriod(tot, ev, T0, T0 + 3 * 1440 * MIN);
  assert.ok(Math.abs(s.perDay! - (600 * 0.06 + 840 * 0.01)) < 0.3);
  assert.equal(s.bags, 1);
  assert.ok(Math.abs(s.loaded - 15) < 0.3);
});

test("pellet: autonomia", () => {
  const now = 1_000_000;
  assert.equal(runOut(null, 5, now), null);
  assert.equal(runOut(50, 0, now), null);
  const r = runOut(50, 5, now)!;
  assert.equal(r.days, 10);
  assert.equal(r.date, now + 10 * 86400000);
});

test("pellet: taratura dal rapporto tra consumo reale e stimato", () => {
  const ev = [
    { t: 1, kind: "misura", before: 0, after: 0, delta: -3, bags: null, used: 20, real: 23, ratio: 1.15 },
    { t: 2, kind: "misura", before: 0, after: 0, delta: 1, bags: null, used: 10, real: 9, ratio: 0.9 },
    { t: 3, kind: "carico", before: 0, after: 0, delta: 15, bags: 1, used: null, real: null, ratio: null },
  ] as Parameters<typeof calibration>[0];
  const c = calibration(ev, 1.65)!;
  assert.equal(c.readings, 2);
  assert.ok(Math.abs(c.ratio - 32 / 30) < 1e-9);
  assert.equal(c.suggested, Math.round(1.65 * (32 / 30) * 100) / 100);
  assert.equal(calibration([], 1.65), null);
  assert.equal(calibration(ev, null)!.suggested, null);
});

test("pellet: statistiche a lungo termine e unione con lo storico", () => {
  const rows = [
    { start: T0, end: T0 + 3600000, mean: 80 },
    { start: T0 + 3600000, end: T0 + 7200000, mean: null },
    { start: T0 + 7200000, end: T0 + 10800000, mean: 78 },
  ];
  const p = statsToPoints(rows, "mean");
  assert.equal(p.length, 2);
  assert.equal(p[0].t, T0 + 30 * MIN);
  const st = statsToPoints([{ start: T0, end: T0 + 3600000, state: 120.5 }], "state");
  assert.equal(st[0].t, T0 + 3600000 - 1);
  const merged = mergeSeries(p, [{ t: T0 + 7200000 + 1, v: 77 }]);
  assert.deepEqual(merged.map((x) => x.v), [80, 77]);
});
