# Milestone 3 — Korean match-day navigation

Review date: 2026-11-18. **Local development only**. No new paid/free API provider or public deployment. Owner's key remains in ignored `frontend/.env.server`.

## Rationale

A **KST calendar day** spans **15:00 UTC on the previous date through 14:59:59.999 UTC on the selected date**. Selecting a single UTC day therefore mislabels some matches in Korea. The app previously displayed kickoff in KST but searched only one UTC day.

## Implementation

- Real fixtures view defaults to **today in Asia/Seoul**, not the browser's assumed UTC date.
- Controls: **Previous day**, **Today**, **Next day**, and a native **KST date picker**, with the selected competition preserved.
- Each navigation change clears the old result and cancels outstanding browser requests. **No automatic request, retry, prefetch or polling.** Click `Load real fixtures` to make one request.
- New local-only API route variant: `GET /api/fixtures?competition=PL&date=2026-11-21&tz=KST`. The original `GET /api/fixtures?competition=PL&date=2026-11-21` continues to filter by UTC day for legacy callers.
- For KST date November 21, gateway requests `dateFrom=2026-11-20&dateTo=2026-11-22` from the **fixed football-data.org HTTPS host in one upstream request**, then validates the entire response and filters kickoff timestamps to the KST-day window. It never returns an unvalidated partial result.
- The two-UTC-day window **does not double API calls**, but may produce a larger provider payload. The existing 512 KiB response cap and 8s timeout remain fail-closed. Shared limits remain 6 requests/60s and 100/process for all routes, with no polling or retries.
- Real match detail navigation and Back to fixtures carry the selected date, competition, explicit timezone, and previously validated result through in-memory router state. No extra request for match details.
- Scores remain nullable; source, retrieval time and delayed-data attribution are preserved. No logo/photo assets are imported.

## Tests

- `src/dateNavigation.test.ts`: midnight edges, month/year/leap-day transitions, KST Today.
- `server/gateway.test.ts`: 1 request for a two-UTC-day KST window, boundary filtering, invalid timezone query rejection, shared quota and malformed payload fail-closed.
- `src/localFixtures.test.ts`: one same-origin KST fetch without key headers, rejection of fixtures after the selected KST day ends.
- `src/realMatchState.test.ts`: KST state validation and safe return-to-list.
- All tests use fictional sample data. CI makes no authenticated external API calls.

## Manual acceptance on Mac

After CI passes and PR is merged, stop the old gateway (port 8787), pull main, and restart both services from the `frontend/` directory:

```sh
npm ci
npm run typecheck
npm run test
npm run serve:data
# Second frontend terminal:
npm run dev
```

Open `http://127.0.0.1:5173/`, select **Local real fixtures**, choose a league and a Korean date, and press **Load real fixtures**. Check:

1. Previous / Today / Next update the KST date **without** making a fetch (inspect Network tab).
2. Clicking Load produces exactly one `/api/fixtures?...&tz=KST` request, which may return an empty valid array.
3. A 00:30 KST kickoff is grouped under that Korean day even though its UTC date is the previous day.
4. Click a real fixture and go back; selected KST date, league, and loaded list remain intact, with no new provider request.
5. If the provider denies access, rate limit triggers, a two-day response is too large, or any provider fixture is invalid, show the existing error state—no fictional substitute.

## Open blockers

This feature does not permit public hosting, public redistribution or caching of provider data. Keep the existing legal review and public multi-user durable quota tasks open. The Free tier is delayed, not truly live; the full project must remain at $0.
