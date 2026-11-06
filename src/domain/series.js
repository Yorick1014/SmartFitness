import { exercises } from "./library.js";

const valid = (id) => exercises.some((e) => e.id === id);
const clampReps = (value) => {
  const n = Math.round(Number(value));
  return Number.isFinite(n) ? Math.max(1, Math.min(100, n)) : 10;
};
const defaults = ["curls", "squats", "pushups"];

function createSeries(
  items = defaults.map((id) => ({ exercise: id, reps: 10 })),
) {
  return normalizeSeries(items);
}

function normalizeSeries(items) {
  if (!Array.isArray(items)) return [];
  return items
    .filter((item) => item && valid(item.exercise))
    .map((item) => ({ exercise: item.exercise, reps: clampReps(item.reps) }));
}

function addItem(series, exerciseId) {
  if (!valid(exerciseId) || series.some((i) => i.exercise === exerciseId))
    return series;
  return [...series, { exercise: exerciseId, reps: 10 }];
}

function removeItem(series, exerciseId) {
  return series.filter((i) => i.exercise !== exerciseId);
}

function moveItem(series, from, to) {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= series.length ||
    to >= series.length
  )
    return series;
  const next = [...series];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function setReps(series, exerciseId, reps) {
  return series.map((i) =>
    i.exercise === exerciseId ? { ...i, reps: clampReps(reps) } : i,
  );
}

function seriesTotal(series) {
  return series.reduce((sum, i) => sum + clampReps(i.reps), 0);
}

function buildSeriesSessions(series, rest = 60) {
  return normalizeSeries(series).map((item) => ({
    exercise: item.exercise,
    target: clampReps(item.reps),
    sets: 1,
    rest: Number(rest) || 0,
  }));
}

function summarizeSeries(results = []) {
  return {
    exercises: results.length,
    reps: results.reduce((sum, r) => sum + (r.reps || 0), 0),
    totalTarget: results.reduce((sum, r) => sum + (r.totalTarget || 0), 0),
    elapsed: results.reduce((sum, r) => sum + (r.elapsed || 0), 0),
    completed: results.filter((r) => r.status === "completed").length,
  };
}

export {
  createSeries,
  normalizeSeries,
  addItem,
  removeItem,
  moveItem,
  setReps,
  seriesTotal,
  buildSeriesSessions,
  summarizeSeries,
};
