import React, { useState, useEffect } from "react";
import Library from "./pages/Library";
import Setup from "./pages/Setup";
import SeriesSetup from "./pages/SeriesSetup";
import Workout, { format } from "./pages/Workout";
import Stats from "./pages/Stats";
import Settings from "./pages/Settings";
import Preview from "./components/Preview";
import Celebrate from "./components/Celebrate";
import { exercises, toggleFavorite, recordRecent } from "./domain/library";
import { createSeries, buildSeriesSessions } from "./domain/series";
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
    [series, setSeries] = useState(createSeries),
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
  function startSeries() {
    const items = buildSeriesSessions(series, plan.rest);
    if (!items.length) return;
    workout.startSeries(items, plan);
    setPage("workout");
  }
  function save() {
    const isSeries = s.kind === "series";
    const record = isSeries
      ? {
          kind: "series",
          items: s.items.map((i) => ({
            exercise: i.exercise,
            target: i.target,
          })),
          results: s.results,
          reps: s.results.reduce((a, r) => a + r.reps, 0),
          totalTarget: s.results.reduce((a, r) => a + r.totalTarget, 0),
          completedSets: s.results.filter((r) => r.status === "completed")
            .length,
          sets: s.items.length,
          elapsed: s.results.reduce((a, r) => a + r.elapsed, 0),
          restInterval: Number(plan.rest) || 0,
        }
      : { ...s, loads };
    if (
      update({
        ...data,
        history: [
          {
            ...record,
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
            ["stats", "Statistics", "▤"],
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
          <div className="modal-backdrop" onClick={() => setLeaveGuard(false)}>
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
            onStartSeries={() => setPage("seriesSetup")}
          />
        )}
        {page === "seriesSetup" && (
          <SeriesSetup
            series={series}
            setSeries={setSeries}
            plan={plan}
            setPlan={setPlan}
            onStart={startSeries}
            onBack={() => setPage("library")}
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
                {s.kind === "series" ? (
                  <>
                    <h2>Exercise series</h2>
                    <div className="summary-stats">
                      <div>
                        <strong>
                          {s.results.reduce((a, r) => a + r.reps, 0)} /{" "}
                          {s.results.reduce((a, r) => a + r.totalTarget, 0)}
                        </strong>
                        <span>Reps</span>
                      </div>
                      <div>
                        <strong>
                          {
                            s.results.filter((r) => r.status === "completed")
                              .length
                          }{" "}
                          / {s.items.length}
                        </strong>
                        <span>Moves done</span>
                      </div>
                      <div>
                        <strong>
                          {format(s.results.reduce((a, r) => a + r.elapsed, 0))}
                        </strong>
                        <span>Active time</span>
                      </div>
                    </div>
                    <ul className="series-result">
                      {s.results.map((r) => (
                        <li key={r.exercise}>
                          <span>
                            {exercises.find((e) => e.id === r.exercise)?.name ||
                              r.exercise}
                          </span>
                          <strong>
                            {r.reps} / {r.totalTarget} reps
                          </strong>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <>
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
                  </>
                )}
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
                  {data.history.map((r) => {
                    const isSeries = r.kind === "series";
                    const name = isSeries
                      ? `Series · ${r.items.length} moves`
                      : exercises.find((e) => e.id === r.exercise)?.name ||
                        r.exercise;
                    return (
                      <tr key={r.id}>
                        <td>
                          {name}
                          {isSeries && r.results && (
                            <small>
                              {r.results
                                .map(
                                  (x) =>
                                    exercises.find((e) => e.id === x.exercise)
                                      ?.name || x.exercise,
                                )
                                .join(" · ")}
                            </small>
                          )}
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
                    );
                  })}
                </tbody>
              </table>
              {!data.history.length && <p className="empty">No sessions yet</p>}
            </div>
          </>
        )}
        {page === "stats" && <Stats history={data.history} />}
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
