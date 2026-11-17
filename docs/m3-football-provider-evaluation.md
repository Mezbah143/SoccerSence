# M3 football provider evaluation — 2026-11-15

Status: **disabled local backend implemented; no real feed enabled**. See [local gateway](m3-local-gateway.md) for the current implementation, dated terms review and remaining gates. No provider account, token, hosted backend or paid service was provisioned.

## Recommendation
First candidate: [football-data.org](https://www.football-data.org/pricing) free plan: **12 competitions, delayed scores, fixtures, delayed schedules, league tables and 10 calls/minute**. The paid live-score plan is **not** allowed under SoccerSense's $0 policy. Free score results must carry a visible **delayed** label and a fetched-at timestamp. Do not advertise them as live.

Reference documentation:
- https://www.football-data.org/pricing
- https://docs.football-data.org/general/v4/policies.html
- https://docs.football-data.org/general/v4/competition.html
- https://www.football-data.org/documentation/quickstart

## Proposed v4 endpoints (not invoked yet)
| Purpose | Path | Notes |
|---|---|---|
| Available competitions | `GET /v4/competitions` | Investigate free accessible list |
| Fixtures | `GET /v4/matches?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD` | Date-scoped; no background polling |
| Match details | `GET /v4/matches/{id}` | Available fields depend on tier |
| League table | `GET /v4/competitions/{code}/standings` | Validate permissions for each competition |

Provider authentication uses header `X-Auth-Token`. **Do not call with token from React or Vite**. A free public static-only frontend cannot safely conceal the token. Real integration must use a separately verified, genuinely $0 server-side proxy and shared cache/rate-limit guard.

## Decisions and blockers
1. **Not a live feed:** free scores are delayed; match status in API is not proof of data being near real time.
2. **Public-use assessment incomplete:** published terms and attribution were reviewed on 2026-11-15; see the local gateway review. No blanket redisplay/caching or logo permission is assumed. Confirm account-specific use and retention before deployment.
3. **Free-host feasibility:** check real quotas and whether requests can be hard-capped with no overage billing; no card-required activation.
4. **Coverage:** list supported competitions with a valid key, check 403/429 responses and missing statistics.
5. **Budget model:** begin at 0 scheduled poll requests; serve cached responses per date/competition; throttling shared among visitors. Recalculate once traffic estimates and allowed cache TTL are known.
6. **User action:** a free provider token would be obtained by the project owner from the official provider (never pasted into GitHub issues or chat). Without it, retain the fully disclosed offline demo mode.

## Offline adapter implementation
`frontend/src/providers/footballData.ts` normalizes an untrusted *mock response shaped like v4 JSON*, rejecting invalid IDs/dates and preserving nullable scores. Tests run without any external request. The provider adapter is not wired to the UI yet, and the application remains sample-data-only.

## Acceptance for production use
- [ ] Terms/license/attribution and caching approved
- [ ] $0 server-side implementation verified to enforce a hard budget
- [ ] Key stored server-side, not shipped to browser or git
- [ ] Real response schema integration, 401/403/429 and stale states tested
- [ ] User-facing source and freshness disclosure verified
- [ ] End-to-end tests and documented costs and limits
