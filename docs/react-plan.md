# React migration

- Replace imperative HTML/event rendering with React components and hooks.
- Preserve the clean library, favourites, details, history and immersive preview.
- Add a set table with editable reps/load, completion ticks and previous results; retain camera-assisted remaining reps and automatic rest.
- Keep session rules separate from UI. Use an event source interface for demo reps now and FastAPI events later.
- Keep data local, migrate existing records, and document teammate startup and backend contract.
- Verify domain tests, production build and browser workout flow. Publish only to a verified private repository.
