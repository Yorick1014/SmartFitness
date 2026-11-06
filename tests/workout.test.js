import test from "node:test";
import assert from "node:assert/strict";
import * as engine from "../src/domain/session.js";
import {
  createSeriesSession,
  applySession,
  finishCurrentSet,
  endSession,
} from "../src/domain/workout.js";
const items = [
  { exercise: "curls", target: 2, rest: 15 },
  { exercise: "squats", target: 3, rest: 15 },
];
const ticks = (s, seconds) => {
  for (let i = 0; i < seconds; i++) s = applySession(s, engine.tick);
  return s;
};
test("series counts each move and respects rest before switching exercises", () => {
  let s = ticks(createSeriesSession(items), 6);
  assert.equal(s.status, "resting");
  assert.equal(s.results.length, 1);
  assert.equal(s.results[0].reps, 2);
  assert.equal(s.results[0].totalTarget, 2);
  assert.equal(s.totalTarget, 5);
  s = ticks(s, 15);
  assert.equal(s.exercise, "squats");
  assert.equal(s.target, 3);
  assert.equal(s.itemIndex, 1);
  s = ticks(s, 9);
  assert.equal(s.status, "completed");
  assert.equal(s.reps, 5);
  assert.equal(s.results.length, 2);
  assert.equal(s.results[1].reps, 3);
  assert.equal(s.elapsed, 15);
  assert.equal(s.results[1].elapsed, 9);
});
test("manual completion finishes only the current move, including with zero rest", () => {
  let s = createSeriesSession(items.map((i) => ({ ...i, rest: 0 })));
  s = finishCurrentSet(s);
  assert.equal(s.exercise, "squats");
  assert.equal(s.reps, 2);
  assert.equal(s.setReps, 0);
  s = finishCurrentSet(s);
  assert.equal(s.status, "completed");
  assert.equal(s.reps, 5);
  assert.deepEqual(
    s.results.map((r) => r.reps),
    [2, 3],
  );
});
test("adjusting paused series rest to zero switches exercise without resuming", () => {
  let s = engine.pause(finishCurrentSet(createSeriesSession(items)));
  s = applySession(s, (current) => engine.adjustRest(current, -15));
  assert.equal(s.exercise, "squats");
  assert.equal(s.status, "paused");
  assert.equal(s.pausedFrom, "active");
  assert.equal(s.target, 3);
});
test("ending in rest does not duplicate results; ending a partial move retains the planned total", () => {
  const resting = finishCurrentSet(createSeriesSession(items));
  assert.equal(endSession(resting).results.length, 1);
  let s = applySession(resting, engine.skipRest);
  s = ticks(s, 3);
  s = endSession(s);
  assert.equal(s.results.length, 2);
  assert.equal(s.results[1].reps, 1);
  assert.equal(s.results[1].status, "ended");
  assert.equal(s.reps, 3);
  assert.equal(s.totalTarget, 5);
  assert.deepEqual(endSession(s), s);
});
