# M12 — Automatic all-leagues loading (private local development)

The Matches page now **automatically loads** the currently selected KST day through **one consolidated provider request**, never six automatic per-league requests. This uses the provider-documented `GET /v4/matches` competition filter and existing strict loopback gateway. $0 cost target; no real data is published to production.

## How it works
- After 700 ms of idle date selection, browser calls `/api/all-fixtures?date=YYYY-MM-DD&tz=KST` once. Opening the homepage also triggers this call.
- Local gateway restricts the path/parameters and hardcodes six football-data.org competition numeric IDs (PL 2021, PD 2014, BL1 2002, SA 2019, FL1 2015, DED 2003). It requests only the needed adjacent UTC days to correctly select the exact KST day.
- Server validates every match and its provider competition ID, groups into six allowlisted sections, preserves delayed attribution and does not copy logos, squads, unknown raw fields or credentials.
- This still counts as **one upstream attempt** against existing 6/min, 100/process, one-in-flight, 8-second and 512-KiB constraints. No timer polling, refresh loop, or automatic retry.
- Browser checks all six complete normalized groups before using existing bounded memory cache, and deduplicates same-day concurrent attempts. Inter-date automatic starts are spaced at least 10.5 seconds; date scrubbing is debounced.
- If the Free account responds with 403 for the aggregate route, only the automatic aggregate mode is unavailable (other routes continue to work). The existing **Load all fixtures** button still provides manual sequential per-league access. A user should not confuse this fallback with proof that aggregate rights/entitlements are granted.
- Public production builds remain fictional: real Matches component is guarded by `import.meta.env.DEV`.

## No hidden cost or hosting changes
No new account, provider token, plan, paid service, proxy, CORS bypass, public backend or caching in hosting is introduced. The module cache lives only in local browser memory. Automated requests consume the same private session budget as deliberate requests; if you browse many different dates you can use up the quota even with the consolidated endpoint.

## Test plan
1. In `frontend`, run `npm run serve:data` and `npm run dev` in separate terminals.
2. Load Matches. Within a moment, only **one** `/api/all-fixtures` request should appear. The six league sections should populate without clicking any button.
3. Change the selected KST date; wait for the debounce. Each new date triggers at most one consolidated request, not six.
4. Switch quickly among several dates. Only the final settled date should populate. Check network requests stay paced.
5. Return to a previously loaded date and follow match details/back: cached results should reappear with unchanged source timestamp and no extra upstream calls.
6. Test provider 403, 429, empty results, invalid competition IDs and malformed bodies. On 403 the manual fallback must remain functional; there should be no invented results.
7. Test widths 320, 390, 768 and 1440; ensure delayed labeling, clickable match cards, favorite league ordering and KST kickoff correctness.
8. CI lint/types/tests/build/server build/public secrets/static build guard should all pass.

## Limitation
The provider documents multiple competitions in the match endpoint, but **actual Free account access has not been authenticated and verified in this CI workflow**. If this specific endpoint is denied, the UI gracefully falls back to existing manual loading; it does not silently fire six more calls.
