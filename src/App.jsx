import React, { useState, useEffect } from "react";
import Library from "./pages/Library";
import Setup from "./pages/Setup";
import Workout, { format } from "./pages/Workout";
import Settings from "./pages/Settings";
import Preview from "./components/Preview";
import Celebrate from "./components/Celebrate";
import { exercises, toggleFavorite, recordRecent } from "./domain/library";
import { load, persist } from "./services/storage";
import { useWorkout } from "./hooks/useWorkout";
export default function App() {
  const [data, setData] = useState(load),
    [page, setPage] = useState("library"),
    [exercise, setExercise] = useState(exercises[0]),
    [plan, setPlan] = useState({
      sets: 3,
      reps: 10,
      rest: 60,
      load: 0,
      auto: true,
    }),
    [loads, setLoads] = useState([]),
    [error, setError] = useState(""),
    [leaveGuard, setLeaveGuard] = useState(false);
  const workout = useWorkout(),
    s = workout.session,
    active = page === "workout" && s?.status !== "completed",
    previous = data.history.find((r) => r.exercise === exercise.id);
  function update(next) {
    try {
      persist(next);
      setData(next);
      return true;
    } catch {
      setError("Check browser storage and try again.");
      return false;
    }
  }
  function select(e) {
    setExercise(e);
    setPage("setup");
  }
  function start() {
    update({ ...data, recent: recordRecent(data.recent, exercise.id) });
    setLoads(
      Array.from({ length: Number(plan.sets) }, () => Number(plan.load) || 0),
    );
    workout.start(exercise, plan);
    setPage("workout");
  }
  function save() {
    if (
      update({
        ...data,
        history: [
          {
            ...s,
            loads,
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            simulated: true,
          },
          ...data.history,
        ],
      })
    ) {
      setLeaveGuard(false);
      workout.clear();
      setPage("history");
    }
  }
  useEffect(() => {
    const listener = (e) => {
      if (s) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", listener);
    return () => window.removeEventListener("beforeunload", listener);
  }, [s]);
  useEffect(() => {
    if (!s || !data.settings.speech || !("speechSynthesis" in window)) return;
    const text =
      s.status === "resting"
        ? "Rest. " + s.restRemaining + " seconds."
        : s.status === "completed"
          ? "Workout complete"
          : s.status === "paused"
            ? "Paused"
            : s.target - s.setReps + " remaining";
    window.speechSynthesis.cancel();
    const voice = new SpeechSynthesisUtterance(text);
    voice.volume = data.settings.volume ?? 0.7;
    window.speechSynthesis.speak(voice);
  }, [s?.reps, s?.status, data.settings.speech, data.settings.volume]);
  return (
    <div className={`shell ${active ? "immersive" : ""}`}>
      <aside className="sidebar">
        <div className="brand">
          <b>ϟ</b>
          <strong>SmartFitness</strong>
        </div>
        <nav>
          {[
            ["library", "Workout", "◈"],
            ["history", "History", "◷"],
            ["settings", "Settings", "⚙"],
          ].map(([id, label, glyph]) => (
            <button
              key={id}
              aria-label={label}
              aria-current={page === id ? "page" : undefined}
              onClick={() => (s ? setLeaveGuard(true) : setPage(id))}
            >
              <span>{glyph}</span>
              <strong>{label}</strong>
            </button>
          ))}
        </nav>
      </aside>
      <main>
        {error && (
          <div role="alert" className="notice notice-error">
            <div className="notice-copy">
              <strong>Couldn’t save</strong>
              <p>{error}</p>
            </div>
            <button
              type="button"
              className="notice-dismiss"
              aria-label="Dismiss"
              onClick={() => setError("")}
            >
              ×
            </button>
          </div>
        )}
        {leaveGuard && s && (
          <div
            className="modal-backdrop"
            onClick={() => setLeaveGuard(false)}
          >
            <div
              className="card modal leave-guard"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="leave-guard-title"
              aria-describedby="leave-guard-desc"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="leave-guard-icon" aria-hidden="true">
                {s.status === "completed" ? "◷" : "◎"}
              </div>
              <h2 id="leave-guard-title">
                {s.status === "completed"
                  ? "Save or discard first"
                  : "Workout still in progress"}
              </h2>
              <p id="leave-guard-desc">
                {s.status === "completed"
                  ? "This session isn’t stored until you choose."
                  : "Leaving now would interrupt this session. Stay and keep training, or end it to review what you’ve done."}
              </p>
              <div className="actions leave-guard-actions">
                {s.status === "completed" ? (
                  <button
                    type="button"
                    className="primary"
                    onClick={() => setLeaveGuard(false)}
                  >
                    Stay here
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setLeaveGuard(false);
                        workout.end();
                      }}
                    >
                      End & review
                    </button>
                    <button
                      type="button"
                      className="primary"
                      onClick={() => setLeaveGuard(false)}
                    >
                      Continue workout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        {page === "library" && (
          <Library
            data={data}
            onFavorite={(id) =>
              update({ ...data, favorites: toggleFavorite(data.favorites, id) })
            }
            onSelect={select}
            onDetails={(e) => {
              setExercise(e);
              setPage("details");
            }}
          />
        )}
        {page === "details" && (
          <>
            <button onClick={() => setPage("library")}>← Exercises</button>
            <header>
              <h1>{exercise.name}</h1>
              <p>{exercise.primary.join(" · ")}</p>
            </header>
            <div className="setup-grid">
              <div className="setup-preview">
                <Preview exercise={exercise} />
              </div>
              <div className="card">
                <h2>{exercise.equipment}</h2>
                <p>{exercise.desc}</p>
                <ol>
                  {exercise.steps.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ol>
                <p>{exercise.setup}</p>
                {previous && <p>Last session: {previous.reps} reps</p>}
                <button
                  className="primary wide"
                  onClick={() => select(exercise)}
                >
                  Start setup →
                </button>
              </div>
            </div>
          </>
        )}
        {page === "setup" && (
          <Setup
            exercise={exercise}
            plan={plan}
            setPlan={setPlan}
            onStart={start}
            onBack={() => setPage("library")}
            previous={previous}
          />
        )}{" "}
        {page === "workout" &&
          s &&
          (s.status === "completed" ? (
            <>
              <Celebrate />
              <header>
                <h1>Session complete</h1>
              </header>
              <section className="card summary">
                <div className="success">✓</div>
                <h2>{exercise.name}</h2>
                <div className="summary-stats">
                  <div>
                    <strong>
                      {s.reps} / {s.totalTarget}
                    </strong>
                    <span>Reps</span>
                  </div>
                  <div>
                    <strong>
                      {s.completedSets} / {s.sets}
                    </strong>
                    <span>Sets</span>
                  </div>
                  <div>
                    <strong>{format(s.elapsed)}</strong>
                    <span>Active time</span>
                  </div>
                </div>
                <p>
                  {s.target} reps per set · {s.restInterval}s rest
                </p>
                <div className="actions">
                  <button
                    onClick={() => {
                      setLeaveGuard(false);
                      workout.clear();
                      setPage("library");
                    }}
                  >
                    Discard
                  </button>
                  <button className="primary" onClick={save}>
                    Save session
                  </button>
                </div>
              </section>
            </>
          ) : (
            <Workout
              exercise={exercise}
              workout={workout}
              loads={loads}
              setLoads={setLoads}
              previous={previous}
              overlay={data.settings.overlay !== false}
            />
          ))}
        {page === "history" && (
          <>
            <header>
              <h1>History</h1>
            </header>
            <div className="card history">
              <table>
                <thead>
                  <tr>
                    <th>Exercise</th>
                    <th>Date</th>
                    <th>Sets</th>
                    <th>Reps</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {data.history.map((r) => (
                    <tr key={r.id}>
                      <td>
                        {exercises.find((e) => e.id === r.exercise)?.name ||
                          r.exercise}
                        <small>{r.restInterval || 0}s rest · Demo</small>
                      </td>
                      <td>{new Date(r.date).toLocaleDateString()}</td>
                      <td>
                        {r.completedSets ?? 1} / {r.sets || 1}
                      </td>
                      <td>
                        {r.reps} / {r.totalTarget || r.target}
                      </td>
                      <td>{format(r.elapsed)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!data.history.length && <p className="empty">No sessions yet</p>}
            </div>
          </>
        )}
        {page === "settings" && (
          <Settings
            settings={data.settings}
            onChange={(settings) => update({ ...data, settings })}
          />
        )}
      </main>
    </div>
  );
}
