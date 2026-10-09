import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CHART_GROUPS, MAX_GAP_MS, allSeries, formatValue, linePath, niceAxis, normalizeValue, parseNumeric, parseStates,
  resample, seriesStats, stateAt, statusSegments, stoveStateColor, timeTicks,
} from "../src/charts-logic";

const H = 3600000;

test("storico: numeri in ordine, scarta unavailable e testi", () => {
  const pts = parseNumeric([
    { s: "50", lu: 1000 },
    { s: "unavailable", lu: 1010 },
    { s: "abc", lu: 1015 },
    { s: "52.5", lu: 1020 },
    { s: "49", lu: 1005 },
  ]);
  assert.deepEqual(pts.map((p) => p.v), [50, 49, 52.5]);
  assert.equal(pts[0].t, 1000 * 1000); // secondi -> millisecondi
});

test("storico: tempi in secondi, in millisecondi o ISO", () => {
  assert.equal(parseNumeric([{ s: "1", lu: 1800000000 }])[0].t, 1800000000000);
  assert.equal(parseNumeric([{ state: "1", last_updated: 1800000000000 }])[0].t, 1800000000000);
  assert.equal(parseNumeric([{ state: "1", last_updated: "2026-10-09T21:00:00Z" }])[0].t, Date.parse("2026-10-09T21:00:00Z"));
});

test("campionamento: media pesata nel tempo", () => {
  // 10 fino a t=1h, poi 20; due secchi da 1 h
  const pts = [{ t: 0, v: 10 }, { t: H, v: 20 }];
  assert.deepEqual(resample(pts, 0, 2 * H, 2), [10, 20]);
  // un solo secchio da 2 h: media di 10 e 20 per 1 h ciascuno
  assert.deepEqual(resample(pts, 0, 2 * H, 1), [15]);
});

test("campionamento: nessun valore prima della prima lettura", () => {
  const out = resample([{ t: H, v: 5 }], 0, 2 * H, 2);
  assert.equal(out[0], null);
  assert.equal(out[1], 5);
});

test("campionamento: il valore precedente al periodo si tiene", () => {
  assert.deepEqual(resample([{ t: -H, v: 7 }], 0, 2 * H, 2), [7, 7]);
});

test("campionamento: dopo troppo tempo senza letture il valore non vale più", () => {
  const out = resample([{ t: 0, v: 7 }], 0, 10 * H, 10);
  assert.equal(out[0], 7);
  assert.equal(out[2], 7);
  assert.equal(out[3], null);
  assert.ok(MAX_GAP_MS === 3 * H);
});

test("statistiche", () => {
  const st = seriesStats([null, 10, 30, 20, null]);
  assert.deepEqual(st, { min: 10, max: 30, avg: 20, last: 20 });
  assert.equal(seriesStats([null, null]), null);
});

test("asse con numeri tondi", () => {
  const a = niceAxis(41.3, 66.2, 5);
  assert.ok(a.min <= 41.3 && a.max >= 66.2);
  assert.ok(a.ticks.every((t) => Math.abs(t / 5 - Math.round(t / 5)) < 1e-9)); // multipli di 5
  assert.equal(niceAxis(20, 20).ticks.length >= 2, true);
  const w = niceAxis(0, 100, 5);
  assert.deepEqual([w.min, w.max], [0, 100]);
});

test("tacche del tempo", () => {
  const t0 = new Date(2026, 9, 9, 6, 30).getTime();
  const t1 = t0 + 6 * H;
  const t = timeTicks(t0, t1);
  assert.ok(t.length >= 3 && t.length <= 7);
  assert.ok(t.every((x) => x.t >= t0 && x.t <= t1));
  assert.match(t[0].label, /^\d\d:\d\d$/);
  const sett = timeTicks(t1 - 7 * 24 * H, t1);
  assert.ok(sett.some((x) => x.major && /\d/.test(x.label) && / /.test(x.label)));
});

test("percorso: i vuoti interrompono la linea", () => {
  const d = linePath([1, 2, null, 4], (i) => i * 10, (v) => 100 - v);
  assert.equal(d, "M0.0 99.0L10.0 98.0M30.0 96.0");
});

test("fasce dello stato: unisce e si estende dall'inizio", () => {
  const st = parseStates([
    { s: "OFF", lu: 0 },
    { s: "WAIT", lu: 100 },
    { s: "WORK", lu: 200 },
    { s: "WORK", lu: 250 },
    { s: "ECO STOP", lu: 400 },
  ].map((x) => ({ ...x, lu: x.lu * 1000 + 5e11 })));
  const t0 = 5e11 + 50 * 1000;
  const t1 = 5e11 + 600 * 1000;
  const seg = statusSegments(st, t0, t1);
  assert.deepEqual(seg.map((s) => s.state), ["OFF", "WAIT", "WORK", "ECO STOP"]);
  assert.equal(seg[0].from, t0);
  assert.equal(seg[3].to, t1);
  assert.equal(stateAt(st, 5e11 + 300 * 1000), "WORK");
  assert.equal(stateAt(st, 5e11 - 1), null);
});

test("colori dello stato della caldaia", () => {
  assert.equal(stoveStateColor("WORK"), "#ef4444");
  assert.equal(stoveStateColor("ECO STOP"), "#60a5fa");
  assert.equal(stoveStateColor("unavailable"), "transparent");
  assert.equal(stoveStateColor("OFF"), "#475569");
});

test("formattazione e normalizzazione", () => {
  assert.equal(formatValue(55.64, { decimals: 1, unit: "°C" }), "55,6 °C");
  assert.equal(formatValue(null, { decimals: 1, unit: "°C" }), "–");
  assert.equal(normalizeValue(15, { min: 10, max: 20 }), 0.5);
  assert.equal(normalizeValue(15, { min: 15, max: 15 }), 0.5);
});

test("gruppi: serie con scale sensate e almeno due accese", () => {
  for (const g of CHART_GROUPS) {
    assert.ok(g.series.filter((s) => s.on).length >= 2, g.id);
    const units = new Set(g.series.filter((s) => s.axis === "l").map((s) => s.unit));
    assert.equal(units.size, 1, `${g.id}: una sola unità a sinistra`);
    const right = new Set(g.series.filter((s) => s.axis === "r").map((s) => s.unit));
    assert.ok(right.size <= 1, `${g.id}: una sola unità a destra`);
  }
  assert.ok(allSeries().length >= 10);
});
