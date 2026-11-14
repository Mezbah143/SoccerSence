# Football data source evaluation

Status: research, **no provider connected**. Do not confuse “free fixtures/results” with “free real-time scores”.

| Source | Free capability | Main restriction | Decision |
|---|---|---|---|
| [football-data.org](https://www.football-data.org/pricing) | Fixtures, delayed schedules/scores, tables, selected competitions | 12 competitions, 10 calls/min; delayed scores on Free (2026-11 check) | First candidate to test |
| [API-Football](https://www.api-football.com/pricing/) | Some football endpoints within limited free daily requests | Quotas/league coverage subject to plan; verify contemporary terms | Alternative only, not assumed adequate |
| [Sportmonks](https://www.sportmonks.com/football-api/free-plan/) | Limited free league coverage as advertised | Verify eligible competitions, redistribution and request limits | Research candidate |
| Local JSON fixture dataset | Deterministic development and testing | Not current real sports data | Always available development fallback |

## Mandatory feasibility experiments
- Request competition list, next seven days of matches, match detail and table using a free key.
- Record response schemas, timezone, update timestamps, quota headers, latency, missing fields and errors.
- Check provider terms for commercial use, caching, public display, logos, attribution and API-key storage.
- Validate CORS: if key is secret, run only through compliant server-side proxy with hard quota and cache.
- Design source attribution and delayed freshness prominently.
- When quota exhausted, show explicit unavailable/stale error; never relabel generated fixtures as real.

## API acceptance
Run a 1-day forecast estimating visitors × app requests and background polling. Proposed initial policy: zero background polling on client; refresh on user action, cached response, and obey server-imposed cooldowns. A provider is rejected if $0 plan cannot meet honest MVP features.
