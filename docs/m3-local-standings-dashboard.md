# Milestone 3 — local Premier League standings UI

Date: 2026-11-17. This feature is **local developer testing only**, not a public source-data release.

## Feature
The existing `/standings` page displays a real Premier League league table in Vite **development** mode. Click **Load real standings** to issue one request to the already-existing `GET /api/standings?competition=PL` local gateway. The frontend never accesses a provider API token and never calls the provider directly. The production build retains a non-live placeholder.

The table displays provider position, club, games played, wins, draws, losses, goals for, goals against, goal difference, and points. Provider positions and points are **not recomputed** (including deductions). The browser adapter validates the normalized data; source/freshness/retrieval timestamp and provider-mandated attribution appear in the UI. No logos, photos or paid fields are displayed.

The page includes explicit loading, empty, throttled, disabled and unavailable states; it does not substitute fictional standings when a real request fails. Loading happens **only on explicit button click**, not automatically on navigation or a timer. The backend quota is shared with the fixtures endpoint.

## Getting started
With Node 22.12+ and the already-verified private Free token in the ignored `frontend/.env.server` file, run in two terminals:

```sh
# Terminal 1, inside frontend
npm ci
npm run serve:data
# Terminal 2, inside frontend
npm run dev
```

Visit `http://127.0.0.1:5173/standings` and click **Load real standings**. If port 8787 is in use by an old gateway, stop the old process and restart after pulling changes.

Local test (without showing a secret):
```sh
curl -i 'http://127.0.0.1:8787/api/standings?competition=PL'
```

## Verification scope
Offline tests in `frontend/src/localStandings.test.ts` cover schema validation, provider attribution, non-negative and signed numeric fields, no frontend credential headers, and error responses. GitHub Actions runs lint, type checking, tests, and build; the owner must perform a browser check with their private local account.

## Non-goals / blockers
- Public provider-data display, caching and retention permissions are not established by success of a local authenticated request.
- Public hosting, shared durable rate limits, multi-user service, additional competitions and real-time scores are excluded.
- All dependencies and existing endpoints are reused; **$0 incremental spend**.
