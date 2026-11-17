# Milestone 3 — multi-competition local selector

Date: November 18, 2026. **Development-only evaluation.** This is not authorization for public redistribution or production deployment.

## Free-tier sources
- https://www.football-data.org/pricing — Free plan: €0, twelve competitions, delayed scores, fixtures, tables, ten registered requests/minute.
- https://www.football-data.org/coverage — free competition listing.
- https://docs.football-data.org/general/v4/lookup_tables.html — documented competition codes.
- https://docs.football-data.org/general/v4/policies.html — throttling and nullable data.

Only these six explicitly selected free-tier codes are enabled locally:
| Code | League |
|---|---|
| PL | Premier League |
| PD | La Liga |
| BL1 | Bundesliga |
| SA | Serie A |
| FL1 | Ligue 1 |
| DED | Eredivisie |

The Free website advertises other competitions too, but they are intentionally not enabled until tested. Specific account access, league schedules and standings support can vary; an unavailable response is displayed as an error or empty state, **never** as invented results.

## Implementation
- The gateway validates an exact six-code allowlist for both `/api/fixtures?competition=CODE&date=YYYY-MM-DD` and `/api/standings?competition=CODE`. There is no arbitrary competition or season URL support.
- Existing fixed HTTPS upstream, loopback-only HTTP, no-store, single in-flight request, max six attempts per rolling minute and max 100 attempts per process **remain shared across all six competitions**. Changing the selector gives no extra quota. The in-process quota resets on restart and is **not** sufficient for a public service.
- Browser selectors on real fixtures and standings let the user choose a league; changing one clears prior results and cancels any unfinished browser request. Nothing is automatically fetched on selection, navigation or a timer.
- Real-match navigation remembers the selected competition and restores the fixture list without new calls.
- The API token remains exclusively in the ignored `.env.server`, never the client or query string; no logos, photos or paid match fields.

## Test locally after CI passes and PR is merged
1. Update the repository (`git pull origin main` from repo root).
2. Restart the existing 8787 backend so it loads the updated gateway: from `frontend/`, `npm run serve:data`. Do not leave another old process on the port.
3. Start Vite via `npm run dev` in another `frontend/` terminal and visit `http://127.0.0.1:5173`.
4. Switch to **Local real fixtures**, select La Liga or Bundesliga, select a UTC date, then click **Load real fixtures**. A valid 200 with an empty matches array simply means no matches on that day.
5. Visit `/standings`, choose the same league and click **Load real standings**. Some competition types may lack a current table; show the empty/error state as appropriate.
6. Do not repeatedly refresh or run high-volume date scans. Observe the shared safe rate limit.
7. Verify a match detail page returns to the correct selected league without another request.

Tests exercise allowable codes, unknown-code rejection, backend routing, and shared throttling with **fictional** data. CI makes no provider request.

## Still blocked before public release
Provider-specific public display/retention/caching rights, durable distributed quota enforcement, genuinely $0 hosting, and explicit owner approval. Free tier is delayed, not live; user-facing labels/attribution stay mandatory.
