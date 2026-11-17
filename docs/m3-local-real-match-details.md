# Milestone 3 — local real match details

Date: November 18, 2026. Scope: development-only match details, powered entirely by the already-verified local fixtures response.

## What's delivered

- Click a real fixture card to open `/real-match/:id`.
- Show the selected teams, match ID, competition, status, nullable score, KST kickoff, UTC kickoff, source attribution, delayed freshness, and fetched timestamp.
- Match details use only the normalized fixture response held in **React Router navigation state**. Opening them makes **zero additional provider/gateway calls**, conserving the free quota. No token enters browser code or URL parameters.
- Return link restores the selected UTC day and previously loaded fixture list without automatically refetching. Fictional-demo detail routes remain separate.
- Browser navigation state is validated against the existing local fixture-response contract and matching ID. If a detail URL is refreshed, bookmarked, pasted, or reached without that in-memory state, show **Match details unavailable** and a link back to the match centre. Do not invent a match or fetch new data automatically.
- No lineups, events, possession, player details or highlights are fabricated. No third-party team photos or logos are used.
- Feature is local development only, not included as a live public release. No paid provider, billing or server config changes.

## Local acceptance

1. Merge the pull request only after CI passes.
2. From the repo root, `git pull origin main`; ensure port 8787 serves the updated local gateway and Vite runs on localhost 5173.
3. On the home page, choose **Local real fixtures**, select UTC date `2026-11-21` (or another available day) and click **Load real fixtures** once.
4. Click any real fixture card. Confirm names, score placeholder if scheduled, correct KST/UTC kickoff and visible attribution.
5. Click **Back to real fixtures**; the date and loaded fixtures should be restored with no new request.
6. Refresh the detail page: it must show the unavailable state, not silently substitute fictional data or consume API quota.
7. Check the network inspector: navigation to detail makes no new `/api/` request.

Tests in `frontend/src/realMatchState.test.ts` use fictional teams and verify the route-state contract. No authenticated provider calls run in CI.

## Future enhancements / blockers

For shareable/reloadable match detail URLs, design a separate approved, quota-limited, explicitly requested server-side detail lookup once the provider's Free coverage and public data display/caching permissions are confirmed. Do not add polling, premium data or automatic retries to this local experiment. Public hosting and data redistribution are still not cleared.
