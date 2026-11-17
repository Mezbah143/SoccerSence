# Milestone 3 — real fixtures in the local React dashboard

Date: 2026-11-17. Scope: **developer-only**, using the preexisting loopback football-data.org gateway; no public redistribution, hosting or subscription.

## What's implemented
- The home page offers **Fictional demo** and (development builds only) **Local real fixtures** modes. Demo remains the initial/default mode, including for static production builds.
- Local real fixtures explicitly require the developer to click **Load real fixtures**. Date changes clear old data and require a new deliberate click. No polling, automatic retries, caching or browser-side credentials.
- Vite dev server listens on **127.0.0.1 only** and forwards relative `/api` requests to the existing loopback gateway on port 8787. This is a **development-only** proxy, not a production server, public tunnel or authorization for public redistribution. The gateway still enforces the only-PL and local-only protections.
- The browser client validates source, attribution, delayed freshness, requested UTC day and nullable scores, and shows loading, empty, blocked, rate-limit and provider-error states.
- Real fixtures display their kickoff in **KST**. Date selector refers to **UTC** for fidelity with gateway; selected dates in Korea may differ by one day from local match dates.
- Real cards do not link to fictional detail pages. Existing demo detail routes remain demo-only.
- The required visible attribution is **Football data provided by the Football-Data.org API**. Null scores display a dash; no fabricated stats, team logos, or player photos are used.

## Free and rights safeguards
No credentials in React or `VITE_*` variables; no browser requests directly to football-data.org. The owner retains the private Free key in ignored `frontend/.env.server`. This local evaluation must not be exposed publicly. Published use and caching require separate rights review; see [Step 2 provider evaluation](phase1-step2-api-verification.md).

## Local testing after merging
Use Node 22.12+; the user must already have their own Free account and rights review for local evaluation.

Terminal A (from `frontend/`):
```sh
npm ci
npm run serve:data
```
Terminal B (also from `frontend/`):
```sh
npm run dev
```
Open the printed **127.0.0.1** Vite address, choose **Local real fixtures**, select the UTC date **2026-11-21** and click **Load real fixtures**. Check displayed source, delayed freshness, KST kickoff and no November 22 UTC kickoffs. Restart backend after code updates. Do not post your token or raw account details.

## Tests and audit scope
`frontend/src/localFixtures.test.ts` covers validation, secrets-free same-origin request, UTC-day consistency, empty/error handling and KST formatting. Existing gateway tests remain in place. GitHub Actions must pass before merge. The local authenticated browser flow has **not** been run by this PR author; it requires the owner's machine and private key.

## Open production blockers
- Explicit permission for planned public display and caching.
- Public $0 hosted API budget with shared durable quotas and fail-closed limits.
- Proper timezone/day controls for user-selectable local timezones.
- Account, favorites, real detail pages and rich stats are not part of this PR.
