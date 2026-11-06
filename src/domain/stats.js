const DAY = 86400000;
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

function startOfWeek(date) {
  const d = startOfDay(date);
  const day = (d.getDay() + 6) % 7;
  return new Date(d.getTime() - day * DAY);
}

function startOfMonth(date) {
  const d = startOfDay(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function exerciseReps(record) {
  if (!record) return 0;
  if (record.kind === "series")
    return Array.isArray(record.results)
      ? record.results.reduce((sum, r) => sum + (Number(r.reps) || 0), 0)
      : 0;
  return Number(record.reps) || 0;
}

function recordDay(record) {
  if (!record || !record.date) return null;
  const d = new Date(record.date);
  return Number.isNaN(d.getTime()) ? null : startOfDay(d);
}

function weekDays(history = [], now = new Date()) {
  const start = startOfWeek(now);
  const days = WEEKDAYS.map((label, i) => ({
    label,
    date: new Date(start.getTime() + i * DAY),
    reps: 0,
  }));
  for (const record of history) {
    const day = recordDay(record);
    if (!day) continue;
    const index = Math.round((day.getTime() - start.getTime()) / DAY);
    if (index >= 0 && index < 7) days[index].reps += exerciseReps(record);
  }
  return days;
}

function weekMix(history = [], now = new Date()) {
  const start = startOfWeek(now);
  const end = new Date(start.getTime() + 7 * DAY);
  const totals = new Map();
  for (const record of history) {
    const day = recordDay(record);
    if (!day || day < start || day >= end) continue;
    const add = (id, reps) =>
      totals.set(id, (totals.get(id) || 0) + (Number(reps) || 0));
    if (record.kind === "series")
      (record.results || []).forEach((r) => add(r.exercise, r.reps));
    else add(record.exercise, record.reps);
  }
  const entries = [...totals.entries()].filter(([, reps]) => reps > 0);
  const total = entries.reduce((sum, [, reps]) => sum + reps, 0);
  return entries
    .map(([exercise, reps]) => ({
      exercise,
      reps,
      share: total ? reps / total : 0,
    }))
    .sort((a, b) => b.reps - a.reps);
}

function monthGrid(history = [], now = new Date()) {
  const first = startOfMonth(now);
  const year = first.getFullYear();
  const month = first.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(year, month, i + 1);
    return { date, day: i + 1, reps: 0 };
  });
  for (const record of history) {
    const day = recordDay(record);
    if (!day || day.getFullYear() !== year || day.getMonth() !== month)
      continue;
    cells[day.getDate() - 1].reps += exerciseReps(record);
  }
  const max = cells.reduce((m, c) => Math.max(m, c.reps), 0);
  const leading = (first.getDay() + 6) % 7;
  return {
    cells: cells.map((c) => ({
      ...c,
      level: max ? Math.ceil((c.reps / max) * 4) : 0,
    })),
    leading,
    max,
    monthLabel: first.toLocaleString(undefined, {
      month: "long",
      year: "numeric",
    }),
  };
}

const KCAL_PER_REP = 0.32;
const round1 = (n) => Math.round(n * 10) / 10;

function repsInWeek(history, refDate) {
  const start = startOfWeek(refDate);
  const end = new Date(start.getTime() + 7 * DAY);
  let total = 0;
  for (const record of history) {
    const day = recordDay(record);
    if (day && day >= start && day < end) total += exerciseReps(record);
  }
  return total;
}

function elapsedDaysInWeek(refDate, today = new Date()) {
  const start = startOfWeek(refDate);
  const current = startOfWeek(today);
  if (start.getTime() < current.getTime()) return 7;
  if (start.getTime() > current.getTime()) return 0;
  return ((today.getDay() + 6) % 7) + 1;
}

function weekSummary(history = [], refDate = new Date(), today = new Date()) {
  const days = weekDays(history, refDate);
  const total = days.reduce((a, d) => a + d.reps, 0);
  const activeDays = days.filter((d) => d.reps > 0).length;
  const elapsedDays = Math.max(1, elapsedDaysInWeek(refDate, today));
  const prevRef = new Date(refDate.getTime() - 7 * DAY);
  const prevTotal = repsInWeek(history, prevRef);
  const diff = total - prevTotal;
  const changePct = prevTotal ? (diff / prevTotal) * 100 : total > 0 ? 100 : 0;
  return {
    days,
    total,
    activeDays,
    avgPerDay: round1(total / elapsedDays),
    prevTotal,
    changePct: round1(changePct),
    change: diff > 0 ? "up" : diff < 0 ? "down" : "flat",
    calories: Math.round(total * KCAL_PER_REP),
  };
}

function monthSummary(history = [], refDate = new Date(), today = new Date()) {
  const grid = monthGrid(history, refDate);
  const total = grid.cells.reduce((a, c) => a + c.reps, 0);
  const first = startOfMonth(refDate);
  const currentMonth = startOfMonth(today);
  let elapsedDays;
  if (first.getTime() < currentMonth.getTime())
    elapsedDays = new Date(
      first.getFullYear(),
      first.getMonth() + 1,
      0,
    ).getDate();
  else if (first.getTime() > currentMonth.getTime()) elapsedDays = 0;
  else elapsedDays = today.getDate();
  return {
    grid,
    total,
    activeDays: grid.cells.filter((c) => c.reps > 0).length,
    avgPerDay: round1(total / Math.max(1, elapsedDays)),
    calories: Math.round(total * KCAL_PER_REP),
  };
}

export {
  weekDays,
  weekMix,
  monthGrid,
  weekSummary,
  monthSummary,
  exerciseReps,
  WEEKDAYS,
  KCAL_PER_REP,
};
