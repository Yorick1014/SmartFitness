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
test("recentExercises maps valid ids to exercise objects in order and drops invalid ids", () => {
  assert.equal(typeof library.recentExercises, "function");
  const result = library.recentExercises([
    "squats",
    "missing",
    "curls",
    "squats",
  ]);
  assert.deepEqual(
    result.map((e) => e.id),
    ["squats", "curls"],
  );
  assert.ok(result.every((e) => e.name && e.equipment));
  assert.deepEqual(library.recentExercises([]), []);
  assert.deepEqual(library.recentExercises(undefined), []);
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

test("prioritizedExercises puts recent and favourite items first", () => {
  assert.equal(typeof library.prioritizedExercises, "function");
  const ordered = library.prioritizedExercises(
    library.exercises,
    ["pushups", "squats"],
    ["curls"],
  );
  const ids = ordered.map((e) => e.id);
  assert.equal(ids[0], "pushups");
  assert.equal(ids[1], "squats");
  assert.equal(ids[2], "curls");
  assert.equal(ordered.length, library.exercises.length);
});

test("recordRecent keeps the five most recent unique exercises", () => {
  let recent = [];
  for (const id of ["curls", "squats", "pushups", "rows", "lunges", "crunches"])
    recent = library.recordRecent(recent, id);
  assert.deepEqual(recent, ["crunches", "lunges", "rows", "pushups", "squats"]);
});
