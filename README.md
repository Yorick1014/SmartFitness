# SmartFitness

React desktop fitness prototype for CS3483. Choose an exercise, plan sets/reps/rest, exercise with an immersive preview, and review your set log. Camera tracking is simulated; no webcam or microphone is accessed.

## Quick start

Requires **Node.js 22.12+** and npm.

```sh
git clone https://github.com/Yorick1014/SmartFitness.git
cd SmartFitness
npm ci
npm run dev
```

Open **http://127.0.0.1:4173**. On macOS, `Launch SmartFitness.command` runs the same command after dependencies are installed.

```sh
npm test           # session and library rules
npm run build      # production bundle → dist/
npm run preview    # serve production build on port 4174
```

If port 4173 is busy, stop the old prototype/server first. Keep the same URL/port to retain browser-local history. Vite can use the next port automatically; check its printed URL.

## Workout

- Pick sets, reps per set, rest seconds and optional load in kg.
- Automatic demo counting is always on and completes one rep every three seconds.
- Reps remaining count down. **Finish set** marks the current set complete; rest starts automatically.
- **Sets** opens the log: current set, previous load, editable kg and completed reps.
- Pause freezes active work or rest. Adjust the current break by 15 seconds using minus/plus, including while paused; reducing it to zero advances to the next set. Adjustments are limited to 10 minutes. Skip rest when ready. End early to review/save the work completed.
- History, favourites, recent exercises and settings stay in this browser. Existing `smartfitness.v1` history is retained.

## Code map

```
src/
  pages/        Library, setup and workout React screens
  components/   Reusable animated preview and pose geometry
  hooks/        Workout lifecycle and timer cleanup
  domain/       Pure session rules and exercise catalogue
  services/     Browser storage and future vision transport
```

UI state uses React hooks; no global event handlers or HTML string renderer. A single session has one exercise and a fixed rep target for each set. Active time excludes rest and pauses. Load is logged per set; no weight is inferred from the camera.

## FastAPI / vision handoff

There is no backend requirement for the prototype. `src/services/vision.js` provides a demo event source and a WebSocket client scaffold. See [backend-contract.md](docs/backend-contract.md) before wiring your model into `useWorkout`.

## Working together

Repository access is private; the owner can invite teammates under GitHub **Settings → Collaborators**. Clone with your own GitHub account.

Use a feature branch, keep each PR focused, and run `npm test` and `npm run build` before review. Commit `package-lock.json`; install with `npm ci`. Do not commit node_modules, dist, recordings, model weights, API keys or personal session exports. Run the checks locally before opening a pull request.

## Design documentation

- [Course application report](docs/reports/SmartFitness-Course-Application-Report.pdf): course-based refinements and verification, captured before the later UI library refactor.
- [Component libraries](docs/component-libraries.md): current Radix UI / Lucide mapping and browser checks.

Setup fields adapt to narrow cards. Rest minus/plus controls always adjust by 15 seconds.
