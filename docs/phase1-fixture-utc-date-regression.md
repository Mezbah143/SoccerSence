# Phase 1 — UTC fixture-date verification and regression

Date: 2026-11-17. Scope: the existing, **local-only** football-data.org gateway.

## Observed authenticated local response (user report)
A request for `/api/fixtures?competition=PL&date=2026-11-21` returned HTTP 200 and nine normalized matches. Seven had `kickoffUtc` on November 21, while two had `kickoffUtc` on November 22. This is a reported local result, not independently repeated using the user's secret key. The endpoint also returned the required source attribution and `freshness: delayed`; scheduled scores were null. No credential or full provider payload is committed.

## Documented provider semantics
The official [v4 overview](https://docs.football-data.org/) says `dateTo` is **exclusive**. The [competition match endpoint](https://docs.football-data.org/general/v4/competition.html) accepts `dateFrom` and `dateTo`. Our gateway already requests one UTC day using `dateFrom=2026-11-21&dateTo=2026-11-22`. Therefore, the presence of November 22 UTC kickoffs in the reported result is unexpected; do not assume the cause without provider confirmation.

## Safeguard implemented
After the existing provider-response schema validation, the gateway now filters normalized fixtures by the **exact requested UTC date** using each match's `kickoffUtc`. The HTTP query and the conservative rate limits remain unchanged.

- `date=2026-11-21` returns only UTC kickoffs from 2026-11-21 00:00:00 through 23:59:59.999.
- Later or earlier UTC dates are omitted rather than misrepresented under the selected day.
- Invalid records still produce a sanitized 502, even if their stated kickoff lies on a different day.
- If all valid provider matches lie on other days, return a successful empty array for the requested day.
- This is **UTC day** selection, not a Korean-calendar-day selection: a match at 2026-11-21T15:00Z occurs on **November 22 at 00:00 KST**. Implement a timezone-aware date selector separately when connecting the frontend.

## Regression tests
Tests use mocked fictional provider matches only, including boundaries at 23:59:59Z and 00:00:00Z, an adjacent-day-only response, and a malformed off-day record. The tests do not call the real provider or consume any API quota.

## Local verification after merging
1. Stop the existing gateway with Ctrl+C and pull the updated main branch.
2. Run `cd frontend && npm ci && npm run test && npm run serve:data`.
3. From a second terminal, run `curl -i 'http://127.0.0.1:8787/api/fixtures?competition=PL&date=2026-11-21'`.
4. Verify HTTP 200, and that every match's `kickoffUtc` begins `2026-11-21`. Scores may be null.
5. Keep your token in ignored `.env.server`; never post it to a public issue.

## Remaining project gates
This PR does not connect React, add caching, approve public redistribution or deploy the gateway. Provider rights and public hosting safeguards remain separate tasks under Issues #5–#7. **$0 spending** and no paid upgrades remain mandatory.
