import { test } from "node:test";
import assert from "node:assert/strict";
import * as series from "../src/domain/series.js";

test("createSeries seeds a valid default combination", () => {
  const s = series.createSeries();
  assert.ok(s.length > 0);
  assert.ok(s.every((i) => i.exercise && i.reps >= 1));
});

test("addItem rejects duplicates and invalid ids", () => {
  const base = [{ exercise: "curls", reps: 10 }];
  assert.equal(series.addItem(base, "curls").length, 1);
  assert.equal(series.addItem(base, "missing").length, 1);
  assert.deepEqual(
    series.addItem(base, "squats").map((i) => i.exercise),
    ["curls", "squats"],
  );
});

test("removeItem drops the matching exercise", () => {
  const s = [
    { exercise: "curls", reps: 10 },
    { exercise: "squats", reps: 8 },
  ];
  assert.deepEqual(
    series.removeItem(s, "curls").map((i) => i.exercise),
    ["squats"],
  );
});

test("moveItem reorders and ignores out-of-range moves", () => {
  const s = [
    { exercise: "curls", reps: 10 },
    { exercise: "squats", reps: 10 },
    { exercise: "pushups", reps: 10 },
  ];
  assert.deepEqual(
    series.moveItem(s, 0, 2).map((i) => i.exercise),
    ["squats", "pushups", "curls"],
  );
  assert.deepEqual(series.moveItem(s, 0, 9), s);
  assert.deepEqual(series.moveItem(s, 1, 1), s);
});

test("setReps clamps values to 1..100", () => {
  const s = [{ exercise: "curls", reps: 10 }];
  assert.equal(series.setReps(s, "curls", 0)[0].reps, 1);
  assert.equal(series.setReps(s, "curls", 999)[0].reps, 100);
  assert.equal(series.setReps(s, "curls", "7")[0].reps, 7);
});

test("seriesTotal sums reps across items", () => {
  const s = [
    { exercise: "curls", reps: 10 },
    { exercise: "squats", reps: 5 },
  ];
  assert.equal(series.seriesTotal(s), 15);
});

test("buildSeriesSessions keeps order and uses a single set per item", () => {
  const s = [
    { exercise: "curls", reps: 12 },
    { exercise: "squats", reps: 8 },
  ];
  const built = series.buildSeriesSessions(s, 45);
  assert.deepEqual(built, [
    { exercise: "curls", target: 12, sets: 1, rest: 45 },
    { exercise: "squats", target: 8, sets: 1, rest: 45 },
  ]);
});

test("summarizeSeries aggregates results", () => {
  const summary = series.summarizeSeries([
    { reps: 10, totalTarget: 10, elapsed: 30, status: "completed" },
    { reps: 4, totalTarget: 8, elapsed: 12, status: "completed" },
  ]);
  assert.deepEqual(summary, {
    exercises: 2,
    reps: 14,
    totalTarget: 18,
    elapsed: 42,
    completed: 2,
  });
});
