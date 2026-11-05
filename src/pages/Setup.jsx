import React from "react";
import Preview from "../components/Preview";
export default function Setup({
  exercise,
  plan,
  setPlan,
  onStart,
  onBack,
  previous,
}) {
  const field = (key, label, min, max) => (
    <label>
      {label}
      <input
        type="number"
        min={min}
        max={max}
        required
        value={plan[key]}
        onChange={(e) => setPlan({ ...plan, [key]: e.target.value })}
      />
    </label>
  );
  return (
    <>
      <button className="text-button" onClick={onBack}>
        ← Exercises
      </button>
      <header>
        <h1>{exercise.name}</h1>
        <p>
          {exercise.equipment} · {exercise.primary.join(", ")}
        </p>
      </header>
      <div className="setup-grid">
        <div>
          <div className="setup-preview">
            <span className="preview-chip">Demo camera</span>
            <Preview exercise={exercise} />
          </div>
          <p className="camera-note">
            <strong>{exercise.label}</strong>
            <br />
            {exercise.setup}
          </p>
        </div>
        <form
          className="card"
          onSubmit={(e) => {
            e.preventDefault();
            onStart();
          }}
        >
          <h2>Your session</h2>
          <div className="plan-fields">
            {field("sets", "Sets", 1, 20)}
            {field("reps", "Reps / set", 1, 100)}
            {field("rest", "Rest · sec", 0, 600)}
          </div>
          <label>
            Load · kg <span className="muted">optional</span>
            <input
              type="number"
              min="0"
              max="1000"
              step="0.5"
              value={plan.load}
              onChange={(e) => setPlan({ ...plan, load: e.target.value })}
            />
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={plan.auto}
              onChange={(e) => setPlan({ ...plan, auto: e.target.checked })}
            />
            Automatic demo counting
          </label>
          {previous && (
            <div className="previous">
              <span>Last session</span>
              <strong>
                {previous.reps} reps · {previous.completedSets || 1} sets
              </strong>
            </div>
          )}
          <p className="muted small">{exercise.cue}</p>
          <button className="primary wide" type="submit">
            Begin workout →
          </button>
        </form>
      </div>
    </>
  );
}
