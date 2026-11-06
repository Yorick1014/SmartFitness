import React from "react";
import { Minus, Plus } from "lucide-react";

export default function NumberStepper({
  id,
  label,
  value,
  onChange,
  min = 0,
  max = 1000,
  step = 1,
  invalid,
  describedBy,
  required = false,
}) {
  const n = Number(value);
  function change(direction) {
    const base = Number.isFinite(n) ? n : min;
    const next = Math.round((base + direction * step) / step) * step;
    onChange(Math.max(min, Math.min(max, next)));
  }
  return (
    <div className={`number-stepper ${invalid ? "invalid" : ""}`}>
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        disabled={value !== "" && n <= min}
        onClick={() => change(-1)}
      >
        <Minus size={18} strokeWidth={1.7} aria-hidden="true" />
      </button>
      <input
        id={id}
        aria-label={label}
        type="number"
        inputMode={step < 1 ? "decimal" : "numeric"}
        min={min}
        max={max}
        step={step}
        required={required}
        value={value}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        aria-label={`Increase ${label}`}
        disabled={value !== "" && n >= max}
        onClick={() => change(1)}
      >
        <Plus size={18} strokeWidth={1.7} aria-hidden="true" />
      </button>
    </div>
  );
}
