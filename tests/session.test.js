import { test } from "node:test";
import assert from "node:assert/strict";
import * as engine from "../src/domain/session.js";
test("paused sessions preserve repetitions and elapsed time", () => {
  assert.equal(typeof engine.createSession, "function");
  let s = engine.createSession("squats", 10);
  s = engine.tick(s, 3);
  assert.equal(s.reps, 1);
  s = engine.pause(s);
  assert.deepEqual(engine.tick(s, 10), s);
});
test("lost tracking suspends counting and recovery preserves progress", () => {
  assert.equal(typeof engine.createSession, "function");
  let s = engine.tick(engine.createSession("curls", 10), 3);
  s = engine.setTracking(s, false);
  assert.deepEqual(engine.tick(s, 10), s);
  assert.equal(engine.addRep(s).reps, 1);
  s = engine.setTracking(s, true);
  assert.equal(engine.tick(s, 3).reps, 2);
});
test("target completes the session and cannot count further", () => {
  assert.equal(typeof engine.createSession, "function");
  const s = engine.tick(engine.createSession("pushups", 2), 6);
  assert.equal(s.reps, 2);
  assert.equal(s.status, "completed");
  assert.equal(s.elapsed, 6);
  assert.deepEqual(engine.addRep(s), s);
});
test("pause, tracking recovery and resume remain independent", () => {
  assert.equal(typeof engine.createSession, "function");
  let s = engine.pause(engine.createSession("squats", 10));
  s = engine.setTracking(s, false);
  s = engine.setTracking(s, true);
  assert.equal(s.status, "paused");
  assert.equal(engine.tick(s, 6).reps, 0);
  assert.equal(engine.tick(engine.resume(s), 3).reps, 1);
});
test("multiple sets count down rest without adding repetitions or active time", () => {
  let s = engine.createSession("curls", 2, 2, 5);
  s = engine.tick(s, 6);
  assert.equal(s.status, "resting");
  assert.equal(s.completedSets, 1);
  assert.equal(s.reps, 2);
  assert.equal(s.restRemaining, 5);
  const elapsed = s.elapsed;
  s = engine.tick(s, 3);
  assert.equal(s.restRemaining, 2);
  assert.equal(s.reps, 2);
  assert.equal(s.elapsed, elapsed);
  s = engine.tick(s, 2);
  assert.equal(s.status, "active");
  assert.equal(s.currentSet, 2);
  assert.equal(s.setReps, 0);
  s = engine.tick(s, 6);
  assert.equal(s.status, "completed");
  assert.equal(s.completedSets, 2);
  assert.equal(s.reps, 4);
  assert.equal(s.totalTarget, 4);
  assert.equal(s.elapsed, 12);
});
test("pause freezes rest countdown and resumes the same remaining interval", () => {
  let s = engine.tick(engine.createSession("squats", 1, 2, 10), 3);
  s = engine.pause(s);
  assert.equal(s.status, "paused");
  assert.equal(s.pausedFrom, "resting");
  assert.deepEqual(engine.tick(s, 8), s);
  s = engine.tick(engine.resume(s), 2);
  assert.equal(s.status, "resting");
  assert.equal(s.restRemaining, 8);
});
test("zero rest interval moves directly to the next set", () => {
  const s = engine.tick(engine.createSession("squats", 1, 2, 0), 6);
  assert.equal(s.status, "completed");
  assert.equal(s.reps, 2);
  assert.equal(s.completedSets, 2);
});
test("skipping rest preserves completed repetitions and starts next set", () => {
  let s = engine.tick(engine.createSession("curls", 1, 3, 60), 3);
  assert.equal(typeof engine.skipRest, "function");
  s = engine.skipRest(s);
  assert.equal(s.status, "active");
  assert.equal(s.currentSet, 2);
  assert.equal(s.reps, 1);
  assert.equal(s.setReps, 0);
  assert.equal(s.restRemaining, 0);
});
