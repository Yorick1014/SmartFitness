import React, { useState } from "react";
import { validatePlan, previousPlan } from "../domain/plan";
import NumberStepper from "../components/NumberStepper";
import Preview from "../components/Preview";
export default function Setup({
  exercise,
  plan,
  setPlan,
  onStart,
  onBack,
  previous,
}) {
  const [submitted, setSubmitted] = useState(false);
  const errors = submitted ? validatePlan(plan) : {};
  const field = (key, label, min, max) => (
    <div className="plan-field">
      <label htmlFor={`plan-${key}`}>{label}</label>
      <NumberStepper
        id={`plan-${key}`}
        label={label}
        min={min}
        max={max}
        required
        invalid={!!errors[key]}
        describedBy={errors[key] ? `error-${key}` : undefined}
        value={plan[key]}
        onChange={(value) => setPlan({ ...plan, [key]: value })}
      />
      {errors[key] && (
        <span className="field-error" id={`error-${key}`}>
          {errors[key]}
        </span>
      )}
    </div>
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
          className="card session-plan"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
            const invalid = Object.keys(validatePlan(plan));
            if (invalid.length) {
              document.getElementById(`plan-${invalid[0]}`)?.focus();
              return;
            }
            onStart();
          }}
        >
          <h2>Your session</h2>
          <div className="plan-fields">
            {field("sets", "Sets", 1, 20)}
            {field("reps", "Reps / set", 1, 100)}
            {field("rest", "Rest · sec", 0, 600)}
          </div>
          <div className="plan-field load-field">
            <label htmlFor="plan-load">
              Load · kg <span className="muted">optional</span>
            </label>
            <NumberStepper
              id="plan-load"
              label="Load · kg"
              min={0}
              max={1000}
              step={0.5}
              invalid={!!errors.load}
              describedBy={errors.load ? "error-load" : undefined}
              value={plan.load}
              onChange={(value) => setPlan({ ...plan, load: value })}
            />
            {errors.load && (
              <span className="field-error" id="error-load">
                {errors.load}
              </span>
            )}
          </div>
          {previous && (
            <div className="previous">
              <span>Last session</span>
              <strong>
                {previous.reps} reps · {previous.completedSets || 1} sets
              </strong>
              <button
                type="button"
                onClick={() => setPlan(previousPlan(previous, plan))}
              >
                Use last plan
              </button>
            </div>
          )}
          {!Object.keys(validatePlan(plan)).length && (
            <p className="plan-summary" role="status">
              {plan.sets} sets × {plan.reps} reps ·{" "}
              {Number(plan.sets) * Number(plan.reps)} total · {plan.rest}s rest
            </p>
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
