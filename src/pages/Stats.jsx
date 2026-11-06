import React, { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { exercises } from "../domain/library";
import { weekMix, weekSummary, monthSummary } from "../domain/stats";

const palette = [
  "#6262df",
  "#8f7bec",
  "#59c4a5",
  "#f0a35e",
  "#e46a8b",
  "#5fa8e0",
  "#b07be0",
  "#7fd47f",
  "#e0c05f",
  "#a0a8c0",
];

const isoDay = (date) => {
  const d = new Date(date);
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};

function niceMax(value) {
  if (value <= 5) return Math.max(5, value);
  const step = Math.pow(10, Math.floor(Math.log10(value)));
  const mult = Math.ceil(value / step);
  return mult * step;
}

function BarChart({ days }) {
  const width = 560,
    height = 260,
    left = 40,
    right = 16,
    top = 20,
    bottom = 30;
  const plotW = width - left - right;
  const plotH = height - top - bottom;
  const dataMax = Math.max(...days.map((d) => d.reps), 0);
  const max = niceMax(dataMax);
  const gap = 16;
  const barW = (plotW - gap * (days.length - 1)) / days.length;
  const ticks = 4;
  const [hover, setHover] = useState(null);
  return (
    <svg
      className="stat-chart"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Reps per weekday"
    >
      {Array.from({ length: ticks + 1 }, (_, i) => {
        const value = Math.round((max / ticks) * i);
        const y = top + plotH - (i / ticks) * plotH;
        return (
          <g key={i}>
            <line
              x1={left}
              y1={y}
              x2={width - right}
              y2={y}
              className="grid-line"
            />
            <text
              x={left - 8}
              y={y + 4}
              textAnchor="end"
              className="axis-label"
            >
              {value}
            </text>
          </g>
        );
      })}
      {days.map((d, i) => {
        const h = (d.reps / max) * plotH;
        const x = left + i * (barW + gap);
        const y = top + plotH - h;
        const active = hover === i;
        return (
          <g
            key={d.label}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            className="bar-group"
          >
            {active && d.reps > 0 && (
              <text
                x={x + barW / 2}
                y={y - 8}
                textAnchor="middle"
                className="bar-value"
              >
                {d.reps}
              </text>
            )}
            <rect
              x={x}
              y={y}
              width={barW}
              height={Math.max(h, d.reps > 0 ? 2 : 0)}
              rx="5"
              className={`bar ${active ? "active" : ""}`}
            />
            <text
              x={x + barW / 2}
              y={height - bottom + 18}
              textAnchor="middle"
              className="axis-label"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function polar(cx, cy, r, angle) {
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
}
function slicePath(cx, cy, r, start, end) {
  const [x1, y1] = polar(cx, cy, r, start);
  const [x2, y2] = polar(cx, cy, r, end);
  const large = end - start > Math.PI ? 1 : 0;
  return `M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
}

function PieChart({ mix }) {
  const size = 260,
    r = 100,
    cx = size / 2,
    cy = size / 2;
  const [hover, setHover] = useState(null);
  if (!mix.length)
    return <p className="muted stat-empty">No moves logged this week yet.</p>;
  let angle = -Math.PI / 2;
  const slices = mix.map((m, i) => {
    const sweep = m.share * Math.PI * 2;
    const start = angle;
    const end = angle + sweep;
    angle = end;
    return { ...m, start, end, color: palette[i % palette.length] };
  });
  const active = hover != null ? slices[hover] : null;
  const top = slices.slice(0, 3);
  return (
    <div className="pie-wrap">
      <svg
        className="stat-chart"
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="Share of moves this week"
      >
        {slices.map((s, i) => (
          <path
            key={s.exercise}
            d={slicePath(cx, cy, r, s.start, s.end)}
            fill={s.color}
            className={`slice ${hover === i ? "active" : ""}`}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
        <circle cx={cx} cy={cy} r={r * 0.55} fill="white" />
        {active && (
          <>
            <text x={cx} y={cy - 6} textAnchor="middle" className="pie-pct">
              {Math.round(active.share * 100)}%
            </text>
            <text x={cx} y={cy + 14} textAnchor="middle" className="pie-name">
              {(
                exercises.find((e) => e.id === active.exercise)?.name ||
                active.exercise
              ).slice(0, 16)}
            </text>
          </>
        )}
      </svg>
      <ul className="pie-top">
        <li className="pie-top-head">Top moves</li>
        {top.map((s) => (
          <li key={s.exercise}>
            <span className="dot" style={{ background: s.color }} />
            <span className="pie-top-name">
              {exercises.find((e) => e.id === s.exercise)?.name || s.exercise}
            </span>
            <strong>{Math.round(s.share * 100)}%</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Heatmap({ grid }) {
  const levels = ["l0", "l1", "l2", "l3", "l4"];
  return (
    <div className="heatmap-wrap">
      <div className="heatmap">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <span className="heatmap-dow" key={d}>
            {d[0]}
          </span>
        ))}
        {Array.from({ length: grid.leading }, (_, i) => (
          <span className="heat-cell blank" key={`lead-${i}`} />
        ))}
        {grid.cells.map((c) => (
          <span
            key={c.day}
            className={`heat-cell ${levels[c.level]}`}
            title={`${c.date.toLocaleDateString()} · ${c.reps} reps`}
          >
            <span className="heat-tip">{c.reps}</span>
          </span>
        ))}
      </div>
      <div className="heatmap-legend">
        <span className="heatmap-caption">Darkness = reps trained</span>
        <span className="heatmap-scale">
          <span>Less</span>
          {levels.map((l) => (
            <span className={`heat-cell ${l}`} key={l} />
          ))}
          <span>More</span>
        </span>
      </div>
    </div>
  );
}

function SummaryStat({ label, value, unit, tone, hint }) {
  return (
    <div className="summary-cell">
      <span>{label}</span>
      <strong className={tone ? `tone-${tone}` : ""}>
        {value}
        {unit && <em>{unit}</em>}
      </strong>
      {hint && <small>{hint}</small>}
    </div>
  );
}

function WeekView({ history }) {
  const today = new Date();
  const [ref, setRef] = useState(today);
  const currentWeekStart = (() => {
    const d = new Date(today);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d;
  })();
  const refWeekStart = (() => {
    const d = new Date(ref);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d;
  })();
  const onCurrentWeek = currentWeekStart.getTime() === refWeekStart.getTime();
  const summary = weekSummary(history, ref, today);
  const mix = weekMix(history, ref);
  const start = refWeekStart;
  const end = new Date(start.getTime() + 6 * 86400000);
  const rangeLabel = `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${end.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
  return (
    <>
      <section className="card stat-panel stat-bar">
        <div className="stat-head">
          <h2>This week</h2>
          <div className="week-controls">
            <label className="week-picker">
              <span className="sr-only">Pick a day</span>
              <input
                type="date"
                value={isoDay(ref)}
                onChange={(e) => {
                  const v = new Date(e.target.value + "T12:00:00");
                  if (!Number.isNaN(v.getTime())) setRef(v);
                }}
              />
            </label>
            {!onCurrentWeek && (
              <button type="button" onClick={() => setRef(today)}>
                Back to current week
              </button>
            )}
          </div>
        </div>
        <span className="muted small stat-subline">
          {rangeLabel} · {summary.total} reps
        </span>
        <BarChart days={summary.days} />
      </section>
      <div className="stats-grid">
        <section className="card stat-panel">
          <div className="section-heading">
            <h2>Move mix</h2>
            <span>{mix.length} moves</span>
          </div>
          <PieChart mix={mix} />
        </section>
        <section className="card stat-panel">
          <div className="section-heading">
            <h2>Week summary</h2>
          </div>
          <div className="summary-grid">
            <SummaryStat
              label="Total reps"
              value={summary.total}
              hint={`across ${summary.activeDays} active ${summary.activeDays === 1 ? "day" : "days"}`}
            />
            <SummaryStat
              label="Avg / day"
              value={summary.avgPerDay}
              unit=" reps"
            />
            <SummaryStat
              label="Est. calories"
              value={summary.calories}
              unit=" kcal"
            />
            <SummaryStat
              label="vs last week"
              value={`${summary.changePct > 0 ? "+" : ""}${summary.changePct}`}
              unit="%"
              tone={summary.change}
              hint={`last week ${summary.prevTotal} reps`}
            />
          </div>
        </section>
      </div>
    </>
  );
}

function MonthView({ history }) {
  const today = new Date();
  const [ref, setRef] = useState(today);
  const summary = monthSummary(history, ref, today);
  const grid = summary.grid;
  const shift = (delta) =>
    setRef(new Date(ref.getFullYear(), ref.getMonth() + delta, 1));
  return (
    <>
      <section className="card stat-panel stat-bar">
        <div className="month-head">
          <button
            type="button"
            className="month-nav"
            aria-label="Previous month"
            onClick={() => shift(-1)}
          >
            ‹
          </button>
          <div className="month-title">
            <h2>{grid.monthLabel}</h2>
          </div>
          <button
            type="button"
            className="month-nav"
            aria-label="Next month"
            onClick={() => shift(1)}
          >
            ›
          </button>
        </div>
        <Heatmap grid={grid} />
      </section>
      <section className="card stat-panel">
        <div className="section-heading">
          <h2>Month summary</h2>
        </div>
        <div className="summary-grid summary-grid-3">
          <SummaryStat
            label="Total reps"
            value={summary.total}
            hint={`across ${summary.activeDays} active ${summary.activeDays === 1 ? "day" : "days"}`}
          />
          <SummaryStat
            label="Avg / day"
            value={summary.avgPerDay}
            unit=" reps"
          />
          <SummaryStat
            label="Est. calories"
            value={summary.calories}
            unit=" kcal"
          />
        </div>
      </section>
    </>
  );
}

export default function Stats({ history = [] }) {
  const [tab, setTab] = useState("week");
  return (
    <>
      <header>
        <h1>Statistics</h1>
        <p>Your weekly and monthly training at a glance.</p>
      </header>
      <Tabs.Root value={tab} onValueChange={setTab}>
        <Tabs.List className="tabs" aria-label="Statistics period">
          <Tabs.Trigger value="week">Week</Tabs.Trigger>
          <Tabs.Trigger value="month">Month</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="week">
          <WeekView history={history} />
        </Tabs.Content>
        <Tabs.Content value="month">
          <MonthView history={history} />
        </Tabs.Content>
      </Tabs.Root>
    </>
  );
}
