# Future FastAPI integration

The frontend currently runs offline, with demo timing in `createDemoSource`. `connectVision` is a transport scaffold, not a connected backend.

Suggested endpoint: `ws://127.0.0.1:8000/ws/sessions/{sessionId}`. Backend creates the session and explicitly associates camera/model input with its exercise.

Events:

```json
{"type":"rep","sessionId":"...","exerciseId":"curls","sequence":1}
{"type":"tracking","visible":false}
```

The React hook owns the session. Before enabling a model source:

1. Validate sessionId and exerciseId against the active session; reject stale events.
2. Use monotonically increasing sequence IDs to discard duplicate/replayed reps (the client scaffold deduplicates sequence values per connection).
3. Map `rep` to domain `addRep` and `tracking` to `setTracking`. Count only while active, visible and outside rest/countdown.
4. Keep a separate one-second clock for active time and rest; disable demo-derived rep increments.
5. Pause counting on disconnect and show a reconnect action. Do not silently return to demo counting.
6. Close the socket on unmount/end, test reconnect/replay behaviour and define how the server resets sequence IDs.

Keep video/model processing out of React. Agree separately on camera permission, frame transport and retention; the current prototype never requests device access. CORS/WS origins and authentication must be configured when a real server is added. Browser history remains local until a session API is explicitly introduced.
