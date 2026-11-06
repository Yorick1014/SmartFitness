import React, { useState, useEffect } from "react";
import NumberStepper from "../components/NumberStepper";
import { Plus, Minus, X } from "lucide-react";
import { exercises } from "../domain/library";
import Progress from "../components/Progress";
import Dialog from "../components/Dialog";
import Preview from "../components/Preview";
export default function Workout({
  exercise,
  workout,
  loads,
  setLoads,
  previous,
  overlay = true,
}) {
  const { session: s, countdown } = workout;
  const isSeries = s.kind === "series";
  const current = isSeries
    ? exercises.find((item) => item.id === s.exercise) || exercise
    : exercise;
  const nextMove = isSeries
    ? exercises.find((item) => item.id === s.items[s.itemIndex + 1]?.exercise)
    : null;
  const [log, setLog] = useState(false),
    [confirm, setConfirm] = useState(false);
  const [resumeOnCancel, setResumeOnCancel] = useState(false);
  function requestEnd() {
    const running = ["active", "resting"].includes(s.status);
    setResumeOnCancel(running);
    if (running) workout.pause();
    setConfirm(true);
  }
  function cancelEnd() {
    setConfirm(false);
    if (resumeOnCancel) workout.pause();
  }
  useEffect(() => {
    const keydown = (e) => {
      if (
        e.code !== "Space" ||
        e.repeat ||
        countdown ||
        confirm ||
        document.querySelector('[role="dialog"][data-state="open"]')
      )
        return;
      if (
        e.target.closest(
          "input, textarea, select, button, [contenteditable], [role='combobox']",
        )
      )
        return;
      e.preventDefault();
      workout.pause();
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [countdown, confirm, workout.pause]);
  const resting = s.status === "resting",
    paused = s.status === "paused",
    onBreak = resting || (paused && s.pausedFrom === "resting");
  return (
    <section className={`workout-stage ${log ? "show-log" : ""}`}>
      <div className="workout-canvas">
        <div className="workout-title">
          <h1>{current.name}</h1>
          {isSeries && (
            <span className="series-progress">
              Move {s.itemIndex + 1} of {s.items.length}
            </span>
          )}
          <span className="preview-chip">Demo camera</span>
        </div>
        <Preview
          exercise={current}
          moving={!countdown && s.status === "active"}
          overlay={overlay}
        />
        <aside className="workout-counter">
          <span>REPS REMAINING</span>
          <strong>{s.target - s.setReps}</strong>
          <p>
            {isSeries ? "Move" : "Set"} {s.currentSet} of {s.sets}
          </p>
          <Progress
            label="Workout repetition progress"
            value={s.reps}
            max={s.totalTarget}
          />
          <small>
            {s.reps} / {s.totalTarget} total reps
          </small>
        </aside>
        <p className="sr-only" role="status" aria-atomic="true">
          {countdown
            ? `Get ready: ${countdown}`
            : paused
              ? "Workout paused"
              : resting
                ? `Set ${s.currentSet} complete. Resting.`
                : `Set ${s.currentSet} of ${s.sets}. ${s.target - s.setReps} repetitions remaining.`}
        </p>
        {(countdown || resting || paused) && (
          <div className="overlay">
            {countdown ? (
              <>
                <span>GET READY</span>
                <strong className="big">{countdown}</strong>
              </>
            ) : paused && !onBreak ? (
              <>
                <h2>
                  {s.pausedFrom === "resting"
                    ? "Rest paused"
                    : "Workout paused"}
                </h2>
                <p>Your progress is saved in this session.</p>
              </>
            ) : (
              <>
                <span>
                  {isSeries ? "MOVE" : "SET"} {s.currentSet} COMPLETE
                </span>
                <h2>{paused ? "Rest paused" : "Take a breather."}</h2>
                <strong className="big" role="timer">
                  {format(s.restRemaining)}
                </strong>
                <p>
                  {isSeries
                    ? `Next: ${nextMove?.name} · ${s.items[s.itemIndex + 1]?.target} reps`
                    : `Next: set ${s.currentSet + 1} · ${s.target} reps`}
                </p>
                <div className="rest-editor">
                  <span className="rest-editor-label">Adjust rest</span>
                  <div
                    className="rest-adjustments"
                    role="group"
                    aria-label="Adjust rest time"
                  >
                    <button
                      className="rest-nudge"
                      aria-label="Subtract 15 seconds of rest"
                      onClick={() => workout.adjustRest(-15)}
                    >
                      <Minus size={22} strokeWidth={1.5} aria-hidden="true" />
                    </button>
                    <span className="rest-step-label">15 sec</span>
                    <button
                      className="rest-nudge"
                      aria-label="Add 15 seconds of rest"
                      disabled={s.restRemaining >= 600}
                      onClick={() => workout.adjustRest(15)}
                    >
                      <Plus size={22} strokeWidth={1.5} aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <button
                  className="skip-rest"
                  onClick={() => workout.adjustRest(-s.restRemaining)}
                >
                  Skip rest →
                </button>
              </>
            )}
          </div>
        )}
        <div className="workout-dock">
          <button disabled={!!countdown} onClick={workout.pause}>
            {paused ? "Resume" : "Pause"}
          </button>
          <button
            disabled={!!countdown || s.status !== "active"}
            className="primary"
            onClick={workout.finishSet}
          >
            {isSeries ? "Finish move ✓" : "Finish set ✓"}
          </button>
          {!isSeries && (
            <button onClick={() => setLog(!log)} aria-expanded={log}>
              Sets
            </button>
          )}
          <button className="end-action" onClick={requestEnd}>
            End
          </button>
        </div>
        <div className="workout-time">
          {format(s.elapsed)} <small>ACTIVE TIME</small>
        </div>
      </div>
      {log && !isSeries && (
        <aside className="set-drawer" aria-label="Set log">
          <div className="set-log-header">
            <div>
              <p className="eyebrow">THIS WORKOUT</p>
              <h2>Set log</h2>
            </div>
            <button onClick={() => setLog(false)} aria-label="Close set log">
              <X size={20} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
          <div className="set-log-progress">
            <span>
              {s.completedSets} of {s.sets} sets complete
            </span>
            <strong>{s.reps} reps</strong>
          </div>
          <Progress
            label="Completed sets"
            value={s.completedSets}
            max={s.sets}
          />
          <div className="set-list">
            {Array.from({ length: s.sets }, (_, i) => {
              const done = i < s.completedSets;
              const current = !done && i + 1 === s.currentSet;
              const reps = done ? s.target : current ? s.setReps : 0;
              return (
                <section
                  className={`set-card ${done ? "done" : current ? "current" : ""}`}
                  key={i}
                  aria-label={`Set ${i + 1}`}
                >
                  <div className="set-card-heading">
                    <h3>Set {i + 1}</h3>
                    <span className="set-status">
                      {done ? "✓ Done" : current ? "Current" : "Up next"}
                    </span>
                  </div>
                  <div className="set-card-values">
                    <div>
                      <label htmlFor={`set-load-${i}`}>Load · kg</label>
                      <NumberStepper
                        id={`set-load-${i}`}
                        label={`Set ${i + 1} load`}
                        min={0}
                        max={1000}
                        step={0.5}
                        value={loads[i] ?? 0}
                        onChange={(value) =>
                          setLoads(loads.map((v, j) => (j === i ? value : v)))
                        }
                      />
                    </div>
                    <div className="set-reps">
                      <span>Reps</span>
                      <strong>
                        {reps}
                        <small> / {s.target}</small>
                      </strong>
                    </div>
                  </div>
                  {previous && (
                    <p className="set-previous">
                      Previous: {previous.loads?.[i] ?? 0} kg ×{" "}
                      {previous.target} reps
                    </p>
                  )}
                </section>
              );
            })}
          </div>
          <div className="set-log-footer">
            <button className="primary wide" onClick={() => setLog(false)}>
              Back to workout
            </button>
          </div>
        </aside>
      )}
      {confirm && (
        <Dialog title="End workout?" onCancel={cancelEnd}>
          <p>
            {s.reps} reps · {s.completedSets} completed sets
          </p>
          <div className="actions">
            <button onClick={cancelEnd}>Continue</button>
            <button className="primary" onClick={workout.end}>
              End & review
            </button>
          </div>
        </Dialog>
      )}
    </section>
  );
}
export const format = (s) =>
  `${Math.floor(s / 60)
    .toString()
    .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
