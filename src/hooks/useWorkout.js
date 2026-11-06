import { useEffect, useState } from "react";
import * as engine from "../domain/session";
import { createDemoSource } from "../services/vision";
export function useWorkout() {
  const [session, setSession] = useState(null),
    [countdown, setCountdown] = useState(0);
  useEffect(() => {
    if (!countdown) return;
    const id = setTimeout(() => setCountdown((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);
  useEffect(() => {
    if (!session || countdown || session.status === "completed") return;
    return createDemoSource(() => setSession((s) => engine.tick(s)));
  }, [!!session, countdown, session?.status === "completed"]);
  function start(exercise, plan) {
    setSession(
      engine.createSession(
        exercise.id,
        Number(plan.reps),
        Number(plan.sets),
        Number(plan.rest),
      ),
    );
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
    start,
    finishSet,
    pause: () =>
      setSession((s) =>
        s.status === "paused" ? engine.resume(s) : engine.pause(s),
      ),
    adjustRest: (seconds) => setSession((s) => engine.adjustRest(s, seconds)),
    skipRest: () => setSession(engine.skipRest),
    end: () => {
      setCountdown(0);
      setSession((s) => ({ ...s, status: "completed" }));
    },
    clear: () => setSession(null),
  };
}
