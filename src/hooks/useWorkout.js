import { useEffect, useState } from "react";
import * as engine from "../domain/session";
import { createDemoSource } from "../services/vision";
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
        if (auto) return engine.tick(s);
        if (s.status === "resting") return engine.tick(s);
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
  function finishSet() {
    setSession((s) => {
      if (s.status !== "active" || countdown) return s;
      let next = s;
      for (let i = s.setReps; i < s.target; i++) next = engine.addRep(next);
      return next;
    });
  }
  return {
    session,
    countdown,
    auto,
    setAuto,
    start,
    finishSet,
    pause: () =>
      setSession((s) =>
        s.status === "paused" ? engine.resume(s) : engine.pause(s),
      ),
    skipRest: () => setSession(engine.skipRest),
    end: () => {
      setCountdown(0);
      setSession((s) => ({ ...s, status: "completed" }));
    },
    clear: () => setSession(null),
  };
}
