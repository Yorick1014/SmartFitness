# Shared UI components

The app uses Radix UI primitives styled with SmartFitness tokens. `src/components/ui.css` holds styles for library-backed controls; layout styles remain in `src/styles.css`.

| Interface | Component | Integration |
| --- | --- | --- |
| Confirmation modals | Radix Dialog | `components/Dialog.jsx`; controlled open state, Escape cancellation, focus containment, trigger focus restoration. Outside clicks do not dismiss a decision accidentally. |
| Exercise filters | Radix Select | `components/FilterSelect.jsx`; portalled popup with trigger gap and collision handling. |
| Recent / favourite shortcuts | Radix Tabs | `pages/Library.jsx`; proper tab/panel associations and arrow-key navigation. |
| Rest adjustment | Lucide minus/plus controls | `pages/Workout.jsx`; fixed 15-second steps, including while paused. |
| Settings toggles | Radix Switch | `pages/Settings.jsx`; controlled settings persisted through existing storage. |
| Settings help | Radix Tooltip | `pages/Settings.jsx`; portalled tooltip on hover/focus with viewport collision handling. |
| Speech volume | Radix Slider | `pages/Settings.jsx`; keyboard adjustment in 5-percent steps. |
| Workout and set progress | Radix Progress | `components/Progress.jsx`; named values/max and shared visual styling. |
| Navigation and control icons | Lucide React | Dumbbell, History, Settings, Star, Check, ChevronDown/Up, Plus, Minus, X and CircleHelp. |

The numeric stepper stays a small application component around the native number input, using Lucide plus/minus controls. Radix Primitives does not provide a number-field component; no second component framework was added just for this control. Its existing validation, bounds and typed entry are preserved.

Library-backed components reuse the existing session engine and storage. No actual webcam or speech recognition is introduced. The earlier PDF describes the prior implementation snapshot; this refactor replaces its native modal implementation with Radix.

## Verification - 6 November 2026

- `npm test`: 19 passed, zero failures.
- `npm run build`: passed. Vite reports non-fatal ignored use-client directive warnings from dependency modules.
- Prettier check passed for modified components and styles.
- Browser: tabs respond to arrow keys after the Radix focus update; settings switches toggle and volume changes by 5 percent with ArrowRight; help tooltip appears.
- Browser: rest controls use fixed 15-second steps. The earlier variable-step selector was removed following user review.
- Browser: dialog contains Tab focus and Escape restores the End trigger.
- Browser: no horizontal overflow at 390px in tested rest view; mobile set log captured for visual review.
- Browser console: no warnings or errors in the checked flow.

Sources: https://www.radix-ui.com/primitives/docs/components/dialog ; https://www.radix-ui.com/primitives/docs/components/radio-group ; https://lucide.dev/guide/react

## Final responsive check

Setup fields switch to labels above full-width steppers when their card is narrow. Container sizing prevents overlap at 930px, 1221px and 390px viewports. Focus is drawn around the entire input group rather than over the neighbouring minus/plus controls. Browser checks confirmed 01:00 -> 01:15 -> 01:00 using the fixed-step rest controls.
