# Milestone 3 — local fixtures and standings gateway

## Delivered scope

A disabled-by-default Node backend can request one UTC day of fixtures or current standings from football-data.org v4. It runs only on `127.0.0.1:8787`, using the existing match adapter and a new standings adapter. Only Premier League (`PL`) is allowed in this first experiment. Tests use invented teams and injected responses, never a real API key or football dataset.

The React app still displays fictional fixtures and a standings placeholder. The earlier illustrative image is not implemented UI. This step does not connect the UI, provision an account, fetch real football data, deploy a service, or complete Milestone 3.

## Verified baseline — 2026-11-15 (Asia/Seoul)

- [PR #12](https://github.com/Mezbah143/SoccerSence/pull/12) merged at 00:09:21 KST, merge commit `43d97c7b73fb2d56ef132ce9818f203ff03add54`.
- [PR #12 CI](https://github.com/Mezbah143/SoccerSence/actions/runs/43608349376) and [main CI](https://github.com/Mezbah143/SoccerSence/actions/runs/43608636346) both succeeded.
- The merge contained no lockfile. The checked PR review boxes did not establish completion of the lockfile, rights, or hosted quota gates. This change commits `frontend/package-lock.json` and requires `npm ci` in CI.

## Provider rights and cost review

Primary sources checked 2026-11-15:

- [Pricing](https://www.football-data.org/pricing): Free advertises €0/month, delayed scores/schedules, fixtures/tables, 12 competitions, 10 calls/minute. Paid live scores and add-ons remain excluded.
- [Coverage](https://www.football-data.org/coverage): England Premier League appears in the Free tier. Account-specific access has not been tested.
- [Terms, on the About page](https://www.football-data.org/about), §§2.3, 6, 7, 9: one app/domain per key; confidentiality; visible attribution; restrictions after cancellation; separate permission for logos/photos. Required attribution: **Football data provided by the Football-Data.org API**.
- [Policies](https://docs.football-data.org/general/v4/policies.html): free request quota, nullable values and empty lists.
- [Competition/standings reference](https://docs.football-data.org/general/v4/competition.html): official current tables may include deductions; grouped tables and TOTAL/HOME/AWAY variants exist; some competition types have no table.
- [v4 overview](https://docs.football-data.org/general/v4/): `dateTo` is exclusive. The gateway sends the next UTC date for a one-day query.

Decision: implement a local evaluation path, leave it off. Published documentation supports evaluating fixtures/tables but is not a completed rights assessment for SoccerSense's intended public use. Cache TTL, long-term retention, onward redistribution, and account-specific rights remain unresolved. No caching or persistence is implemented; responses use `Cache-Control: no-store`. No logos, photos, emblems or other provider asset URLs are returned. No paid subscription, hosting, billing details, or automatic upgrade mechanism is added. Project actions in this change cost $0.

## Run safely without a provider key

Requires Node 22.12+ (or Node 24) and npm. From `frontend/`:

```sh
npm ci
npm run serve:data
```

In another terminal:

```sh
curl -i 'http://127.0.0.1:8787/api/fixtures?competition=PL&date=2026-11-15'
curl -i 'http://127.0.0.1:8787/api/standings?competition=PL'
```

Both return HTTP 503 with `{"error":"provider_disabled"}` until all four settings below are configured. No upstream request happens in this state. Stop with Ctrl+C. No background service is installed.

## Before enabling a local real-data experiment

The owner must obtain a Free-only key for SoccerSense via the official provider; verify no payment/card requirement or charge path and verify current coverage. Record the dated terms/permission review for the intended local use (including any clarification needed). No key is needed for tests or CI.

Copy `frontend/.env.example` to `frontend/.env.server`, edit privately, then restart:

| Server-only setting | Required value |
|---|---|
| `DATA_MODE` | `football-data-local` |
| `FOOTBALL_FREE_PLAN_CONFIRMED` | `true`, only after the account's Free plan is verified |
| `FOOTBALL_RIGHTS_REVIEW` | Nonempty reference to the actual dated review record |
| `FOOTBALL_API_KEY` | Owner's private Free key |

The review reference is an operator attestation, not automatic legal verification. The key format guard rejects missing/placeholders; only the provider can validate it. Never paste it into chat, GitHub, URLs, frontend source or any `VITE_*` variable. The server reads only process environment / its ignored `.env.server`; Vite is not configured to proxy or load it. Keep the real key dedicated to this one local process. Disable by restoring `DATA_MODE=sample`, removing the key and restarting. Revoke any exposed key at the provider.

## Endpoint and error contract

| Local GET endpoint | Upstream path |
|---|---|
| `/api/fixtures?competition=PL&date=YYYY-MM-DD` | `/v4/competitions/PL/matches?dateFrom=...&dateTo=<next day>` |
| `/api/standings?competition=PL` | `/v4/competitions/PL/standings` |

Unknown, duplicate, extra parameters or non-calendar dates are rejected before network access. No arbitrary URL, season, asset or paid endpoint is exposed. Success includes `source`, `freshness: delayed`, `fetchedAt` (retrieval time, not provider update time), attribution, and normalized `matches` or `tables`. Missing scores remain null. Tables retain provider position/points, including deductions; no standings are fabricated from demo matches. Valid empty data differs from corrupt data, which returns an error.

Errors have only a fixed code: 400 invalid request; 401/403 provider authorization failures; 404 unavailable data; 429 throttle/cooldown/session cap; 502 provider/network/schema failure; 503 disabled/blocked. No raw upstream body, header, exception, or key is echoed. Errors do not silently substitute fictional records. A later UI must offer an explicitly labeled demo mode and show source, delayed freshness, attribution, loading/error/empty states.

## Quota and security boundaries

- One shared gateway instance for both routes: at most 6 attempted calls in a rolling 60 seconds, one in flight, and 100 calls during a process lifetime. Failures count; no polling or automatic retries.
- Provider 429 honors numeric or HTTP-date Retry-After with a 60-second minimum cooldown. 401/403 block further calls until operator correction and restart. No upgrade suggestion or paid fallback.
- Fixed HTTPS host, redirects rejected, 8-second fetch/body timeout, 512 KiB response cap. Only normalized fields leave the backend.
- Exact loopback Host and Origin checks, cross-site rejection, GET only, no CORS grant, no-store, no access/body logs. This is a local developer tool, not a multiuser security boundary. Other processes on the machine are trusted.
- **Counters reset on restart and are not shared between processes/machines.** Do not run multiple copies with the same key, deliberately restart to evade quotas, expose via tunnels, deploy publicly or add a Vite proxy. These limits are not a production hard budget or a distributed rate limiter.
- All tests are offline except a loopback HTTP test; no provider calls, accounts or secrets in CI.

## Validation and remaining gates

Run `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, and `npm run build:server` in `frontend/`. CI also builds with a non-secret sentinel value and verifies no server credential markers entered the browser bundle. This is a regression check, not a general secret scanner.

Before real public fixtures/standings: document applicable data rights/retention, verify an owner-controlled Free account, run a bounded authenticated schema/coverage experiment without committing payloads, choose truly $0 hosting with shared persistent quotas and verified no-overage behavior, design permitted caching, and implement/test the actual frontend states and attribution. Public deployment and UI/browser acceptance remain pending.

Rollback: stop the local server and revert this PR if needed. Existing sample UI remains usable independently. No migration, external resource or subscription needs cleanup.
