import { useEffect, useState } from "react";
import * as engine from "../domain/session";
import { createDemoSource } from "../services/vision";

function itemSession(item) {
  return engine.createSession(
    item.exercise,
    Number(item.target),
    1,
    Number(item.rest),
  );
}
function seriesStep(s, next) {
  const results = [
    ...(s.results || []),
    {
      exercise: s.exercise,
      reps: next.reps,
      totalTarget: next.totalTarget,
      elapsed: next.elapsed,
      status: "completed",
    },
  ];
  const itemIndex = s.itemIndex + 1;
  const item = s.items[itemIndex];
  if (!item) return { ...next, results, itemIndex, status: "completed" };
  const fresh = itemSession(item);
  return {
    ...fresh,
    kind: "series",
    items: s.items,
    results,
    itemIndex,
  };
}
function apply(fn) {
  return (s) => {
    if (!s) return s;
    const next = fn(s);
    if (
      s.kind === "series" &&
      next !== s &&
      next.status === "completed" &&
      s.status !== "completed"
    ) {
      if (s.itemIndex < s.items.length - 1) return seriesStep(s, next);
      return {
        ...next,
        results: [
          ...(s.results || []),
          {
            exercise: s.exercise,
            reps: next.reps,
            totalTarget: next.totalTarget,
            elapsed: next.elapsed,
            status: "completed",
          },
        ],
        itemIndex: s.itemIndex,
      };
    }
    return next;
  };
}

export function useWorkout() {
  const [session, setSession] = useState(null),
    [countdown, setCountdown] = useState(0),
    [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!countdown) return;
    const id = setTimeout(() => setCountdown((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);
  useEffect(() => {
    if (!session || countdown || session.status === "completed") return;
    return createDemoSource(() =>
      setSession((s) => {
        if (auto || s.status === "resting") return apply(engine.tick)(s);
        return s.status === "active" && s.tracking
          ? { ...s, elapsed: s.elapsed + 1 }
          : s;
      }),
    );
  }, [!!session, countdown, auto, session?.status === "completed"]);

  function start(exercise, plan) {
    setSession(
      engine.createSession(
        exercise.id,
        Number(plan.reps),
        Number(plan.sets),
        Number(plan.rest),
      ),
    );
    setAuto(plan.auto);
    setCountdown(3);
  }

  function startSeries(items, plan) {
    const first = itemSession(items[0]);
    setSession({
      ...first,
      kind: "series",
      items,
      results: [],
      itemIndex: 0,
      totalTarget: items.reduce((a, i) => a + Number(i.target), 0),
    });
    setAuto(plan.auto);
    setCountdown(3);
  }

  function finishSet() {
    setSession((s) => {
      if (s.status !== "active" || countdown) return s;
      if (s.kind === "series") {
        const completed = {
          ...s,
          setReps: s.target - 1,
          reps: s.totalTarget - 1,
        };
        return apply(engine.addRep)(completed);
      }
      let next = s;
      for (let i = s.setReps; i < s.target; i++)
        next = apply(engine.addRep)(next);
      return next;
    });
  }

  return {
    session,
    countdown,
    auto,
    setAuto,
    start,
    startSeries,
    finishSet,
    pause: () =>
      setSession((s) =>
        s.status === "paused" ? engine.resume(s) : engine.pause(s),
      ),
    skipRest: () => setSession((s) => apply(engine.skipRest)(s)),
    end: () => {
      setCountdown(0);
      setSession((s) => {
        if (s.kind === "series" && s.status !== "completed")
          return {
            ...s,
            results: [
              ...(s.results || []),
              {
                exercise: s.exercise,
                reps: s.reps,
                totalTarget: s.totalTarget,
                elapsed: s.elapsed,
                status: s.status === "active" ? "ended" : s.status,
              },
            ],
            status: "completed",
          };
        return { ...s, status: "completed" };
      });
    },
    clear: () => setSession(null),
  };
}
