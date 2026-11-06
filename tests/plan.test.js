import test from "node:test";
import assert from "node:assert/strict";
import { validatePlan, previousPlan } from "../src/domain/plan.js";
const plan = { sets: 3, reps: 10, rest: 60, load: 0, auto: false };
test("plan accepts boundary values and optional load", () => {
  assert.deepEqual(
    validatePlan({ ...plan, sets: 20, reps: 100, rest: 0, load: "" }),
    {},
  );
  assert.deepEqual(
    validatePlan({ ...plan, sets: 1, reps: 1, rest: 600, load: 1000 }),
    {},
  );
});
test("plan rejects empty, fractional, infinite and out-of-range values", () => {
  assert.deepEqual(
    Object.keys(
      validatePlan({ sets: "", reps: 2.5, rest: Infinity, load: -1 }),
    ),
    ["sets", "reps", "rest", "load"],
  );
  assert.ok(validatePlan({ ...plan, load: 0.25 }).load);
  assert.ok(validatePlan({ ...plan, sets: 21 }).sets);
});
test("reuse previous plan preserves counting preference and handles legacy records", () => {
  assert.deepEqual(
    previousPlan({ sets: 2, target: 8, restInterval: 0, loads: [12.5] }, plan),
    { sets: 2, reps: 8, rest: 0, load: 12.5, auto: false },
  );
  assert.deepEqual(previousPlan({ target: 5 }, plan), {
    sets: 1,
    reps: 5,
    rest: 60,
    load: 0,
    auto: false,
  });
});
