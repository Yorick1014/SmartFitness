import { test } from "node:test";
import assert from "node:assert/strict";
import * as stats from "../src/domain/stats.js";

const now = new Date("2024-05-15T12:00:00"); // Wednesday

const history = [
  { date: "2024-05-13T09:00:00", exercise: "curls", reps: 10 },
  { date: "2024-05-13T18:00:00", exercise: "squats", reps: 5 },
  {
    date: "2024-05-15T08:00:00",
    kind: "series",
    results: [
      { exercise: "curls", reps: 6 },
      { exercise: "pushups", reps: 4 },
    ],
  },
  { date: "2024-05-01T08:00:00", exercise: "rows", reps: 99 },
  { date: "not-a-date", exercise: "curls", reps: 3 },
];

test("weekDays groups reps Monday through Sunday", () => {
  const days = stats.weekDays(history, now);
  assert.equal(days.length, 7);
  assert.equal(days[0].label, "Mon");
  assert.equal(days[0].reps, 15);
  assert.equal(days[2].reps, 10);
  assert.equal(days[6].reps, 0);
  assert.equal(
    days.reduce((a, d) => a + d.reps, 0),
    25,
  );
});

test("weekMix yields shares per exercise including series items", () => {
  const mix = stats.weekMix(history, now);
  const byId = Object.fromEntries(mix.map((m) => [m.exercise, m]));
  assert.equal(byId.curls.reps, 16);
  assert.equal(byId.squats.reps, 5);
  assert.equal(byId.pushups.reps, 4);
  const total = mix.reduce((a, m) => a + m.share, 0);
  assert.ok(Math.abs(total - 1) < 1e-9);
  assert.deepEqual(
    mix.map((m) => m.exercise),
    ["curls", "squats", "pushups"],
  );
});

test("monthGrid covers the whole month with leveled cells", () => {
  const grid = stats.monthGrid(history, now);
  assert.equal(grid.cells.length, 31);
  assert.equal(grid.leading, 2); // 1 May 2024 is a Wednesday
  assert.equal(grid.cells[0].reps, 99);
  assert.equal(grid.cells[0].level, 4);
  assert.equal(grid.cells[12].reps, 15);
  assert.equal(grid.cells[12].level, 1);
  assert.equal(grid.max, 99);
});

test("empty history produces zeroed structures", () => {
  assert.ok(stats.weekDays([], now).every((d) => d.reps === 0));
  assert.deepEqual(stats.weekMix([], now), []);
  const grid = stats.monthGrid([], now);
  assert.ok(grid.cells.every((c) => c.level === 0));
  assert.equal(grid.max, 0);
});

test("exerciseReps handles single and series records", () => {
  assert.equal(stats.exerciseReps({ reps: 7 }), 7);
  assert.equal(
    stats.exerciseReps({ kind: "series", results: [{ reps: 3 }, { reps: 4 }] }),
    7,
  );
  assert.equal(stats.exerciseReps({ kind: "series" }), 0);
  assert.equal(stats.exerciseReps(null), 0);
});

test("weekSummary computes totals, average, calories and change", () => {
  const summary = stats.weekSummary(history, now, now);
  assert.equal(summary.total, 25);
  assert.equal(summary.activeDays, 2);
  assert.equal(summary.avgPerDay, 8.3); // 25 reps over 3 elapsed days
  assert.equal(summary.calories, Math.round(25 * stats.KCAL_PER_REP));
});

test("weekSummary reports no previous week as full increase", () => {
  const summary = stats.weekSummary(
    [{ date: "2024-05-15T08:00:00", exercise: "curls", reps: 10 }],
    now,
    now,
  );
  assert.equal(summary.prevTotal, 0);
  assert.equal(summary.change, "up");
  assert.equal(summary.changePct, 100);
});

test("weekSummary detects a decrease versus the previous week", () => {
  const hist = [
    { date: "2024-05-06T08:00:00", exercise: "curls", reps: 40 },
    { date: "2024-05-14T08:00:00", exercise: "curls", reps: 10 },
  ];
  const summary = stats.weekSummary(hist, now, now);
  assert.equal(summary.total, 10);
  assert.equal(summary.prevTotal, 40);
  assert.equal(summary.change, "down");
  assert.equal(summary.changePct, -75);
});

test("monthSummary aggregates the selected month", () => {
  const summary = stats.monthSummary(history, now, now);
  assert.equal(summary.total, 124); // 99 + 15 + 10, invalid date skipped
  assert.equal(summary.activeDays, 3);
  assert.equal(summary.calories, Math.round(124 * stats.KCAL_PER_REP));
  assert.ok(summary.grid.cells.length === 31);
});

test("weekSummary and monthSummary support browsing prior periods", () => {
  const past = new Date("2024-05-06T12:00:00"); // previous week
  const ws = stats.weekSummary(history, past, now);
  assert.equal(ws.total, 0);
  const ms = stats.monthSummary(history, new Date("2024-04-10"), now);
  assert.equal(ms.total, 0);
  assert.equal(ms.avgPerDay, 0);
});
