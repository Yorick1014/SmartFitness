export function validatePlan(plan) {
  const errors = {};
  for (const [key, label, min, max] of [
    ["sets", "Sets", 1, 20],
    ["reps", "Reps", 1, 100],
    ["rest", "Rest", 0, 600],
    ["load", "Load", 0, 1000],
  ]) {
    const n = Number(plan[key]);
    if (String(plan[key]).trim() === "" && key === "load") continue;
    if (
      String(plan[key]).trim() === "" ||
      !Number.isFinite(n) ||
      n < min ||
      n > max ||
      (key !== "load" && !Number.isInteger(n)) ||
      (key === "load" && !Number.isInteger(n * 2))
    ) {
      errors[key] =
        key === "load"
          ? "Use 0–1000 kg in 0.5 kg steps."
          : `Use a whole number from ${min} to ${max}.`;
    }
  }
  return errors;
}
export function previousPlan(previous, current) {
  return {
    ...current,
    sets: previous.sets || 1,
    reps: previous.target,
    rest: previous.restInterval ?? 60,
    load: previous.loads?.[0] ?? 0,
  };
}
