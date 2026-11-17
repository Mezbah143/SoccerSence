# Phase 1 / Step 2 — free football API verification

Reviewed: 2026-11-17. Status: **conditional candidate; owner account and public redistribution/caching not yet verified**. Scope: documentation and free-source decision only. No real key, payment, provider account, or network fetch of authenticated match data.

## Executive decision
football-data.org v4 Free is a **candidate for a bounded local test**, not yet approved as a live public SoccerSense feed. Its pricing page expressly labels Free “Free Forever” (€0/month). Free includes 12 competitions, fixtures, delayed schedules and scores, league tables, and 10 registered API requests/minute. It does **not** provide live scores. Keep the frontend in unmistakably fictional sample mode until authentication, rights, and source-format checks pass.

## Primary sources, verified November 17, 2026
- Pricing: https://www.football-data.org/pricing
- Free competitions: https://www.football-data.org/coverage
- Terms and privacy: https://www.football-data.org/about
- API policies: https://docs.football-data.org/general/v4/policies.html
- Official v4 docs: https://docs.football-data.org/general/v4/

## Free plan inventory
| Item | Free-plan publication | SoccerSense decision |
|---|---|---|
| Price | €0/month; “Free Forever” | No paid upgrades, addons or trials |
| Coverage | 12 named free competitions (including Premier League, La Liga, Bundesliga, Serie A, Champions League etc.) | Current local gateway deliberately allows ONLY Premier League (`PL`) |
| Score freshness | Scores delayed, schedules delayed | Never label free results live; show source, retrieval time, and delayed state |
| Tables | League tables included | Confirm exact shape on actual Free account before connecting UI |
| Rate limit | 10 registered calls/minute | Local gateway conservatively enforces 6 calls/minute, 100 calls/process |
| Deeper statistics / lineups | Paid tiers/addons advertise additional fields | Do not assume free access; avoid promising unverified match events |
| Registration | Provider requires account registration for personal key | Owner must register themselves; no credentials in chat/source |
| Billing | Privacy policy says card information is required on paid subscription | Verify actual Free signup screens do not request card or enable automatic paid billing |

## Contract and intellectual property constraints
- Terms §2.3: API key is associated with one application/domain. Dedicate the key to SoccerSense only.
- Terms §6: keep developer credentials confidential; never commit token to repository or client bundles.
- Terms §7: display exactly **Football data provided by the Football-Data.org API** in user-visible UI when using provider data.
- Terms §9.1: no continued display of provider data after cancellation.
- Terms §9.2: logos, emblems and profile photos have independent copyright; exclude these unless independently licensed.
- Terms §3: fair-use enforcement can terminate abusive service.
- Terms do not explicitly settle the caching TTL, permanent retention, or onward redisplay for our anticipated public site in the portions reviewed. **Do not infer unlimited caching/redistribution authorization from an accessible endpoint.**
- Provider API docs recognize null as an ordinary unavailable value; frontend must never invent scores/statistics.

## Go / no-go gates (each must be checked before enabling real data)
1. **No-payment signup** — owner creates account on provider’s official website choosing *Free €0/month*. If it asks for a credit card or trial-to-paid authorization, **stop**.
2. **Account and coverage** — confirm dashboard shows Free and PL availability. Do not paste actual token into chat, an issue, screenshots, code, or a GitHub secret without a deployment plan.
3. **Rights clarification** — obtain written clarification from provider about publicly displaying matches/results/tables in a free football app, whether attribution is sufficient, permitted server caching TTL / persistence and allowed hosting domain. Log date and answer (excluding secrets) in an issue.
4. **Local authenticated experiment only** — after terms review, set `DATA_MODE=football-data-local`, `FOOTBALL_FREE_PLAN_CONFIRMED=true`, `FOOTBALL_RIGHTS_REVIEW=<dated-reference>` and `FOOTBALL_API_KEY=<private-key>` in ignored `frontend/.env.server`. Run only loopback gateway and a single selected PL fixtures + standings query. Keep cost $0; no automated polling or retries.
5. **Schema and coverage** — check response status, empty/null cases, source/fetch time, correct UTC date bounds, normalized competitions/standings, rate-limit behavior. Never commit provider payloads that could violate the terms.
6. **Production feasibility** — public hosting, distributed shared hard quotas, permissible caching and fail-closed behaviour must each be confirmed genuinely free and safe from overage before enabling in a public application. Local 100-per-process limit is NOT a production-wide budget.

## Local verification commands (not executed in this review)
After owner approves local use and provides their own private key only in an ignored local env file:
```sh
cd frontend
npm ci
npm run serve:data
# In a second terminal (no key in command):
curl -i 'http://127.0.0.1:8787/api/fixtures?competition=PL&date=2026-11-17'
curl -i 'http://127.0.0.1:8787/api/standings?competition=PL'
```
All operations are against a loopback server at `127.0.0.1:8787`. If no key has been configured, expect HTTP 503 with `provider_disabled`; this is by design and is not a failure of the sample UI. Do not expose this gateway with port-forwarding, tunnels or deployment.

## Suggested provider clarification request
Subject: Free API permitted public display and caching for SoccerSense

Hello Football-Data team,

I am building SoccerSense, a small, publicly accessible, free football-information web application with no paid services. I am considering your Free €0 plan to display delayed fixtures, match scores and competition standings with the required visible attribution. I would not display third-party logos/photos without permission.

Could you clarify whether the Free plan permits public display of these textual/data fields to visitors, and whether server-side caching is permitted (including any required TTL, retention limits, traffic or domain restrictions)? I would use one API key for SoccerSense, keep it exclusively server-side, and respect the published 10 requests/minute limit.

Thank you.

## Outcome and next activity
**Documentary verification complete; no live usage authorized or configured.** Next owner action: create/verify a free account and obtain clarification of public-data rights as needed. Step 3 (actual frontend integration) is blocked until legal and account checks pass. Keep GitHub issue #5 open until account-level verification and rights gate are documented. Keep issue #6 open because per-process quotas cannot secure a public service.
