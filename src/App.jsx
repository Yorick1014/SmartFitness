import React, { useState, useEffect } from "react";
import Library from "./pages/Library";
import Setup from "./pages/Setup";
import Workout, { format } from "./pages/Workout";
import Preview from "./components/Preview";
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
    [error, setError] = useState("");
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
      setError("Could not save. Check browser storage and try again.");
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
  }, [s?.reps, s?.status, data.settings.speech]);
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
              onClick={() =>
                s
                  ? setError("Save or discard this session before leaving.")
                  : setPage(id)
              }
            >
              <span>{glyph}</span>
              <strong>{label}</strong>
            </button>
          ))}
        </nav>
      </aside>
      <main>
        {error && (
          <div role="alert" className="error">
            {error}
            <button onClick={() => setError("")}>×</button>
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
          <>
            <header>
              <h1>Settings</h1>
            </header>
            <div className="card">
              <h2>Feedback</h2>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={data.settings.speech}
                  onChange={(e) =>
                    update({
                      ...data,
                      settings: { ...data.settings, speech: e.target.checked },
                    })
                  }
                />
                Spoken counts and rest alerts
              </label>
              <h2>Data</h2>
              <button
                onClick={() => {
                  const url = URL.createObjectURL(
                    new Blob([JSON.stringify(data.history, null, 2)], {
                      type: "application/json",
                    }),
                  );
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "smartfitness-history.json";
                  a.click();
                  setTimeout(() => URL.revokeObjectURL(url), 1000);
                }}
              >
                Export history
              </button>
              <p>Camera input is simulated. Sessions stay in this browser.</p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
