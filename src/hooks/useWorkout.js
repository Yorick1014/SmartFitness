import { useEffect, useState } from "react";
import * as engine from "../domain/session";
import {
  applySession,
  createSeriesSession,
  finishCurrentSet,
  endSession,
} from "../domain/workout";
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
    return createDemoSource(() =>
      setSession((s) => applySession(s, engine.tick)),
    );
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
  function startSeries(items) {
    const next = createSeriesSession(items);
    if (!next) return;
    setSession(next);
    setCountdown(3);
  }
  function finishSet() {
    if (!countdown) setSession(finishCurrentSet);
  }

  return {
    session,
    countdown,
    start,
    startSeries,
    finishSet,
    pause: () =>
      setSession((s) =>
        s.status === "paused" ? engine.resume(s) : engine.pause(s),
      ),
    adjustRest: (seconds) =>
      setSession((s) =>
        applySession(s, (current) => engine.adjustRest(current, seconds)),
      ),
    skipRest: () => setSession((s) => applySession(s, engine.skipRest)),
    end: () => {
      setCountdown(0);
      setSession(endSession);
    },
    clear: () => setSession(null),
  };
}
