import React, { useState } from "react";
import { ArrowUp, ArrowDown, X, GripVertical } from "lucide-react";
import { exercises } from "../domain/library";
import {
  addItem,
  removeItem,
  moveItem,
  setReps,
  seriesTotal,
} from "../domain/series";
import NumberStepper from "../components/NumberStepper";
import Preview from "../components/Preview";

const byId = (id) => exercises.find((e) => e.id === id);

export default function SeriesSetup({
  series,
  setSeries,
  plan,
  setPlan,
  onStart,
  onBack,
}) {
  const [adding, setAdding] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const available = exercises.filter(
    (e) => !series.some((i) => i.exercise === e.id),
  );
  const total = seriesTotal(series);
  function dropAt(index) {
    if (dragIndex != null && dragIndex !== index)
      setSeries(moveItem(series, dragIndex, index));
    setDragIndex(null);
    setOverIndex(null);
  }
  return (
    <>
      <button className="text-button" onClick={onBack}>
        ← Exercises
      </button>
      <header>
        <h1>Build your series</h1>
        <p>Chain several moves back to back for a varied session.</p>
      </header>
      <div className="setup-grid">
        <div>
          <div className="section-heading">
            <h2>Your moves</h2>
            <span>
              {series.length} moves · {total} reps
            </span>
          </div>
          <ol className="series-list">
            {series.map((item, index) => {
              const e = byId(item.exercise);
              if (!e) return null;
              return (
                <li
                  className={`series-card ${dragIndex === index ? "dragging" : ""} ${overIndex === index && dragIndex !== index ? "drop-target" : ""}`}
                  key={item.exercise}
                  draggable
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(ev) => {
                    ev.preventDefault();
                    setOverIndex(index);
                  }}
                  onDragLeave={() =>
                    setOverIndex((cur) => (cur === index ? null : cur))
                  }
                  onDrop={(ev) => {
                    ev.preventDefault();
                    dropAt(index);
                  }}
                  onDragEnd={() => {
                    setDragIndex(null);
                    setOverIndex(null);
                  }}
                >
                  <span className="series-grip" aria-hidden="true">
                    <GripVertical size={18} strokeWidth={1.5} />
                  </span>
                  <div className={`series-thumb ${e.tone}`}>
                    <Preview exercise={e} />
                  </div>
                  <div className="series-info">
                    <strong>{e.name}</strong>
                    <span>
                      {e.equipment} · {e.primary.join(" · ")}
                    </span>
                  </div>
                  <div className="series-reps">
                    <label htmlFor={`series-reps-${item.exercise}`}>Reps</label>
                    <NumberStepper
                      id={`series-reps-${item.exercise}`}
                      label={`${e.name} repetitions`}
                      min={1}
                      max={100}
                      value={item.reps}
                      onChange={(value) =>
                        setSeries(setReps(series, item.exercise, value))
                      }
                    />
                  </div>
                  <div className="series-order">
                    <button
                      type="button"
                      aria-label={`Move ${e.name} up`}
                      disabled={index === 0}
                      onClick={() =>
                        setSeries(moveItem(series, index, index - 1))
                      }
                    >
                      <ArrowUp size={18} strokeWidth={1.6} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${e.name} down`}
                      disabled={index === series.length - 1}
                      onClick={() =>
                        setSeries(moveItem(series, index, index + 1))
                      }
                    >
                      <ArrowDown
                        size={18}
                        strokeWidth={1.6}
                        aria-hidden="true"
                      />
                    </button>
                    <button
                      type="button"
                      className="series-remove"
                      aria-label={`Remove ${e.name}`}
                      onClick={() =>
                        setSeries(removeItem(series, item.exercise))
                      }
                    >
                      <X size={18} strokeWidth={1.6} aria-hidden="true" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
          {!series.length && (
            <p className="muted">Add at least one move to start a series.</p>
          )}
          <button
            type="button"
            className="series-add"
            aria-expanded={adding}
            onClick={() => setAdding(!adding)}
          >
            {adding ? "Close" : "+ Add exercise"}
          </button>
          {adding && (
            <div className="series-pool">
              {available.map((e) => (
                <button
                  className="pool-card"
                  key={e.id}
                  type="button"
                  onClick={() => setSeries(addItem(series, e.id))}
                >
                  <span className={`pool-icon ${e.tone}`}>
                    <Preview exercise={e} />
                  </span>
                  <span className="pool-text">
                    <strong>{e.name}</strong>
                    <span>{e.equipment}</span>
                  </span>
                </button>
              ))}
              {!available.length && (
                <p className="muted">
                  Every exercise is already in your series.
                </p>
              )}
            </div>
          )}
        </div>
        <form
          className="card session-plan"
          onSubmit={(e) => {
            e.preventDefault();
            onStart();
          }}
        >
          <h2>Series plan</h2>
          <p className="muted small">
            Each move runs as one set. Set the reps per move above.
          </p>
          <div className="plan-fields">
            <div className="plan-field">
              <label htmlFor="series-rest">Rest · sec</label>
              <NumberStepper
                id="series-rest"
                label="Rest · sec"
                min={0}
                max={600}
                required
                value={plan.rest}
                onChange={(value) => setPlan({ ...plan, rest: value })}
              />
            </div>
          </div>
          <div className="previous">
            <span>Series total</span>
            <strong>
              {series.length} moves · {total} reps
            </strong>
          </div>
          <button
            className="primary wide"
            type="submit"
            disabled={!series.length}
          >
            Begin workout →
          </button>
        </form>
      </div>
    </>
  );
}
