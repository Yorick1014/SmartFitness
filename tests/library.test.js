import { test } from "node:test";
import assert from "node:assert/strict";
import * as library from "../src/domain/library.js";
test("recent list moves a repeated exercise to the front without duplicates", () => {
  assert.equal(typeof library.recordRecent, "function");
  assert.deepEqual(
    library.recordRecent(["curls", "squats", "pushups"], "squats"),
    ["squats", "curls", "pushups"],
  );
  assert.deepEqual(library.recordRecent(["curls"], "missing"), ["curls"]);
});
test("legacy saved workouts populate recent exercises without losing saved data", () => {
  assert.equal(typeof library.normalizeAccess, "function");
  const raw = {
    history: [
      { exercise: "squats" },
      { exercise: "curls" },
      { exercise: "squats" },
      { exercise: "missing" },
    ],
  };
  assert.deepEqual(library.normalizeAccess(raw), {
    favorites: [],
    recent: ["squats", "curls"],
  });
  assert.equal(raw.history.length, 4);
});
test("stored favorites and recent lists reject invalid IDs and duplicates", () => {
  assert.equal(typeof library.normalizeAccess, "function");
  assert.deepEqual(
    library.normalizeAccess({
      favorites: ["rows", "rows", "bad"],
      recent: ["curls", "bad", "squats", "curls"],
    }),
    { favorites: ["rows"], recent: ["curls", "squats"] },
  );
});
test("search combines muscle text and equipment filters", () => {
  assert.equal(typeof library.findExercises, "function");
  assert.deepEqual(
    library
      .findExercises({ query: "  BICEPS  ", equipment: "Dumbbells" })
      .map((e) => e.id),
    ["curls", "rows"],
  );
  assert.equal(
    library.findExercises({ query: "biceps", equipment: "Bodyweight" }).length,
    0,
  );
  assert.ok(
    library.findExercises({ muscle: "Core" }).every((e) => e.group === "Core"),
  );
  assert.equal(library.findExercises({ query: "nonexistent" }).length, 0);
});
test("toggling favorites twice restores original selection", () => {
  assert.equal(typeof library.toggleFavorite, "function");
  const saved = ["curls"];
  assert.deepEqual(
    library.toggleFavorite(library.toggleFavorite(saved, "rows"), "rows"),
    saved,
  );
  assert.deepEqual(saved, ["curls"]);
});
test("new and previously empty recent lists start with default exercise shortcuts", () => {
  assert.deepEqual(library.normalizeAccess().recent, [
    "curls",
    "squats",
    "pushups",
  ]);
  assert.deepEqual(
    library.normalizeAccess({ recent: [], favorites: ["rows"] }).recent,
    ["curls", "squats", "pushups"],
  );
  assert.deepEqual(
    library.normalizeAccess({ recent: ["rows", "curls"] }).recent,
    ["rows", "curls"],
  );
});
