import React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
export default function Progress({ value, max, label, className = "" }) {
  const percent = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <ProgressPrimitive.Root
      className={`ui-progress ${className}`}
      value={value}
      max={max}
      aria-label={label}
    >
      <ProgressPrimitive.Indicator
        className="ui-progress-indicator"
        style={{ width: `${percent}%` }}
      />
    </ProgressPrimitive.Root>
  );
}
