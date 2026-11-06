import * as engine from "./session.js";

export function createSeriesSession(items) {
  if (!items.length) return null;
  return {
    ...engine.createSession(
      items[0].exercise,
      items[0].target,
      items.length,
      items[0].rest,
    ),
    kind: "series",
    items,
    itemIndex: 0,
    results: [],
    itemStartedElapsed: 0,
    totalTarget: items.reduce((sum, item) => sum + item.target, 0),
  };
}

export function applySession(session, action) {
  if (!session) return session;
  const next = action(session);
  if (session.kind !== "series" || next === session) return next;
  let updated = next;
  if (next.completedSets > session.completedSets) {
    updated = {
      ...updated,
      results: [
        ...session.results,
        {
          exercise: session.exercise,
          reps: session.target,
          totalTarget: session.target,
          elapsed: next.elapsed - session.itemStartedElapsed,
          status: "completed",
        },
      ],
    };
  }
  if (next.currentSet !== session.currentSet) {
    const itemIndex = next.currentSet - 1;
    const item = session.items[itemIndex];
    updated = {
      ...updated,
      itemIndex,
      exercise: item.exercise,
      target: item.target,
      restInterval: item.rest,
      itemStartedElapsed: next.elapsed,
    };
  }
  return updated;
}

export function finishCurrentSet(session) {
  if (!session || session.status !== "active") return session;
  let next = session;
  for (let i = session.setReps; i < session.target; i++)
    next = applySession(next, engine.addRep);
  return next;
}

export function endSession(session) {
  if (!session || session.status === "completed") return session;
  if (session.kind !== "series") return { ...session, status: "completed" };
  const results =
    session.completedSets < session.currentSet
      ? [
          ...session.results,
          {
            exercise: session.exercise,
            reps: session.setReps,
            totalTarget: session.target,
            elapsed: session.elapsed - session.itemStartedElapsed,
            status: "ended",
          },
        ]
      : session.results;
  return { ...session, results, status: "completed" };
}
