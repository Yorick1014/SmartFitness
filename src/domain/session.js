const integer = (value, fallback, min, max) =>
  Number.isInteger(Number(value))
    ? Math.max(min, Math.min(max, Number(value)))
    : fallback;
function createSession(exercise, target, sets = 1, restInterval = 60) {
  target = integer(target, 10, 1, 100);
  sets = integer(sets, 1, 1, 20);
  restInterval = integer(restInterval, 60, 0, 600);
  return {
    exercise,
    target,
    sets,
    totalTarget: target * sets,
    currentSet: 1,
    completedSets: 0,
    setReps: 0,
    reps: 0,
    restInterval,
    restRemaining: 0,
    restElapsed: 0,
    elapsed: 0,
    phase: 0,
    status: "active",
    pausedFrom: null,
    tracking: true,
    interruptions: 0,
  };
}
function nextSet(s) {
  return {
    ...s,
    currentSet: s.currentSet + 1,
    setReps: 0,
    phase: 0,
    restRemaining: 0,
    status: "active",
  };
}
function addRep(s) {
  if (s.status !== "active" || !s.tracking) return s;
  const next = { ...s, reps: s.reps + 1, setReps: s.setReps + 1 };
  if (next.setReps < next.target) return next;
  next.completedSets++;
  next.phase = 0;
  if (next.currentSet >= next.sets) return { ...next, status: "completed" };
  if (!next.restInterval) return nextSet(next);
  return { ...next, status: "resting", restRemaining: next.restInterval };
}
function tick(s, seconds = 1) {
  if (
    !["active", "resting"].includes(s.status) ||
    (s.status === "active" && !s.tracking)
  )
    return s;
  let next = { ...s };
  for (let i = 0; i < seconds; i++) {
    if (next.status === "resting") {
      next = {
        ...next,
        restRemaining: Math.max(0, next.restRemaining - 1),
        restElapsed: next.restElapsed + 1,
      };
      if (!next.restRemaining) next = nextSet(next);
    } else if (next.status === "active" && next.tracking) {
      next = { ...next, elapsed: next.elapsed + 1, phase: next.phase + 1 };
      if (next.phase >= 3) {
        next.phase = 0;
        next = addRep(next);
      }
    } else break;
  }
  return next;
}
const pause = (s) =>
  ["active", "resting"].includes(s.status)
    ? { ...s, pausedFrom: s.status, status: "paused" }
    : s;
const resume = (s) =>
  s.status === "paused"
    ? { ...s, status: s.pausedFrom || "active", pausedFrom: null }
    : s;
const skipRest = (s) => (s.status === "resting" ? nextSet(s) : s);
function adjustRest(s, seconds) {
  const paused = s.status === "paused" && s.pausedFrom === "resting";
  if ((!paused && s.status !== "resting") || !Number.isFinite(seconds))
    return s;
  const remaining = Math.max(
    0,
    Math.min(600, s.restRemaining + Math.trunc(seconds)),
  );
  if (remaining) return { ...s, restRemaining: remaining };
  const next = nextSet(s);
  return paused ? pause(next) : next;
}
const setTracking = (s, tracking) => ({
  ...s,
  tracking,
  interruptions: s.interruptions + (!tracking && s.tracking ? 1 : 0),
});

export {
  createSession,
  tick,
  addRep,
  pause,
  resume,
  skipRest,
  adjustRest,
  setTracking,
};
