import React, { useState } from "react";
import Preview from "../components/Preview";
export default function Workout({
  exercise,
  workout,
  loads,
  setLoads,
  previous,
}) {
  const { session: s, countdown } = workout;
  const [log, setLog] = useState(false),
    [confirm, setConfirm] = useState(false);
  const resting = s.status === "resting",
    paused = s.status === "paused";
  return (
    <section className={`workout-stage ${log ? "show-log" : ""}`}>
      <div className="workout-title">
        <h1>{exercise.name}</h1>
        <span className="preview-chip">Demo camera</span>
      </div>
      <Preview
        exercise={exercise}
        moving={!countdown && s.status === "active"}
      />
      <aside className="workout-counter">
        <span>REPS REMAINING</span>
        <strong aria-live="polite">{s.target - s.setReps}</strong>
        <p>
          Set {s.currentSet} of {s.sets}
        </p>
        <progress value={s.reps} max={s.totalTarget} />
        <small>
          {s.reps} / {s.totalTarget} total reps
        </small>
      </aside>
      {(countdown || resting || paused) && (
        <div className="overlay">
          {countdown ? (
            <>
              <span>GET READY</span>
              <strong className="big">{countdown}</strong>
            </>
          ) : paused ? (
            <>
              <h2>
                {s.pausedFrom === "resting" ? "Rest paused" : "Workout paused"}
              </h2>
              <p>Your progress is saved in this session.</p>
            </>
          ) : (
            <>
              <span>SET {s.currentSet} COMPLETE</span>
              <h2>Take a breather.</h2>
              <strong className="big" role="timer">
                {format(s.restRemaining)}
              </strong>
              <p>
                Next: set {s.currentSet + 1} · {s.target} reps
              </p>
              <button onClick={workout.skipRest}>Skip rest →</button>
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
          Finish set ✓
        </button>
        <button onClick={() => setLog(!log)} aria-expanded={log}>
          Sets
        </button>
        <button onClick={() => setConfirm(true)}>End</button>
      </div>
      <div className="workout-time">
        {format(s.elapsed)} <small>ACTIVE TIME</small>
      </div>
      {log && (
        <aside className="set-drawer">
          <div className="section-heading">
            <h2>Set log</h2>
            <button onClick={() => setLog(false)} aria-label="Close set log">
              ×
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Set</th>
                <th>Previous</th>
                <th>kg</th>
                <th>Reps</th>
                <th>✓</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: s.sets }, (_, i) => (
                <tr className={i + 1 === s.currentSet ? "current" : ""} key={i}>
                  <td>{i + 1}</td>
                  <td>
                    {previous?.loads?.[i] ? `${previous.loads[i]} kg` : "—"}
                  </td>
                  <td>
                    <input
                      aria-label={`Set ${i + 1} load`}
                      type="number"
                      min="0"
                      max="1000"
                      step="0.5"
                      value={loads[i] ?? 0}
                      onChange={(e) =>
                        setLoads(
                          loads.map((v, j) =>
                            j === i ? Number(e.target.value) : v,
                          ),
                        )
                      }
                    />
                  </td>
                  <td>
                    {i < s.completedSets
                      ? s.target
                      : i + 1 === s.currentSet
                        ? s.setReps
                        : "—"}
                  </td>
                  <td>{i < s.completedSets ? "✓" : "○"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={workout.auto}
              onChange={(e) => workout.setAuto(e.target.checked)}
            />
            Auto count
          </label>
        </aside>
      )}
      {confirm && (
        <div className="modal-backdrop">
          <div
            className="card modal"
            role="dialog"
            aria-modal="true"
            aria-label="End workout"
          >
            <h2>End workout?</h2>
            <p>
              {s.reps} reps · {s.completedSets} completed sets
            </p>
            <div className="actions">
              <button onClick={() => setConfirm(false)}>Continue</button>
              <button className="primary" onClick={workout.end}>
                End & review
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
export const format = (s) =>
  `${Math.floor(s / 60)
    .toString()
    .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
