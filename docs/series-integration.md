# Series / statistics integration - 6 November 2026

Merged `feature/series-stats-library` (`bc8633f`) into main after the UI refinement (`e9d14b4`). Resolved conflicts in App, Library, Workout, useWorkout and styles while preserving Radix controls, Lucide icons, explicit validation, paused confirmation dialogs, responsive steppers, always-on demo counting and fixed 15-second rest adjustments.

Feature additions include ordered exercise series, reorder/add/remove controls, per-move targets, series summaries/history, weekly and monthly statistics, five MRU entries, and recent/favourite library filtering and priority. New feature styles are in `series-stats.css`; shared Radix styles remain in `components/ui.css`.

## Integration corrections

- Series moves reuse the existing session engine and rest/pause lifecycle. The feature branch's one-set-per-item implementation skipped the planned break between moves.
- Global repetitions and planned targets are separate from per-move results. Ending during rest does not duplicate a completed move, and ending early retains the total planned target.
- A zero rest interval switches directly to the next exercise. Skipping or reducing a paused break to zero switches the move without resuming the workout.
- Series setup uses shared steppers and suitably sized reorder controls; statistics and library views use Radix tabs. No auto-count toggle or native filter select is reintroduced.

## Verification

- 44 domain tests, including four new integration regressions for series transitions, rest handling, move completion and partial results.
- Production build and modified-file formatting checks.
- Browser: reorder squats before curls, finish 3 + 2 reps with rest, adjust and skip paused rest, save 5/5 to history, open statistics.
- Browser: automatic 1 + 2 rep series with zero rest completes at 3/3 and nine active seconds.
- Browser: favourite view, muscle filtering, statistics period tabs; layouts checked at 1221, 930 and 390 pixels.
- Calorie estimates are inherited demonstration calculations, not measured exercise expenditure. Real camera tracking remains unimplemented.
