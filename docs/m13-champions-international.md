# M13 — Champions League and International Tournaments

Date: November 19, 2026. Adds three competitions to the existing six-club-competition local MVP, retaining **$0**, private gateway, delayed scores and public fictional demo restrictions.

## Provider verification

Official football-data.org coverage lists UEFA Champions League, World Cup and European Championship on its Free tier: https://www.football-data.org/coverage

Official v4 lookup table confirms:
- `CL` — UEFA Champions League, provider competition ID `2001`
- `WC` — FIFA World Cup, provider competition ID `2000`
- `EC` — UEFA European Championship, provider competition ID `2018`

Reference: https://docs.football-data.org/general/v4/lookup_tables.html

This is **not** a general international match feed. National friendlies, Asian/European/African World Cup qualifiers, Copa América and all other competitions are deliberately **not included**; they must not be presented as supported Free coverage. Actual account responses, fixture availability, dates, tournament stages and standings depend on the provider's season and plan entitlements and have not been checked with this user's private API key.

## Product behavior

1. Existing M12 automatic `/api/all-fixtures` consolidated request now passes **nine allowlisted provider IDs**. It remains **one upstream request per selected KST date** under the same 6-per-minute, 100-per-gateway-session, one-in-flight, 8-second timeout and 512 KiB body safeguards. No new secret or public endpoint.
2. Club competitions section has the existing six leagues plus **UEFA Champions League**. International tournaments section contains **FIFA World Cup** and **UEFA European Championship**. Saved competitions remain first inside their category.
3. Leagues/Competitions directory supports saving, searching and opening each new competition's standings page. Standings remain **manual Load** and can be unavailable, empty or stage/group-based for knockout tournaments. Do not invent a league table.
4. Empty KST match days show an honest no-results state; World Cup and Euros do not play every week or year, so empty is normal.
5. Scores remain **delayed**, not live. Logos, national flags and other rights-controlled media are not added.
6. Public/static build remains fictional, never publishing real fixtures.

## Acceptance checklist

- [ ] CI lint, typecheck, Vitest, public build/audit, gateway compilation and secret guard pass
- [ ] In local development, refresh Matches: nine competition sections display, one consolidated request performs automatic load (no 9-call burst)
- [ ] Choose a Champions League match day: matches appear under the correct CL title with kickoff KST and exact match detail/back state
- [ ] Choose World Cup or Euros dates with real fixtures (if provider provides them): national teams appear under appropriate tournament
- [ ] Date with no tournament fixtures: compact no-results state; no fabricated matches
- [ ] Leagues directory and Search include all three new competitions and Favorites saves them
- [ ] Standings for cups/knockouts: honest group/stage data if supplied, unavailable state otherwise
- [ ] Manual fallback obeys shared six-request rate cap; if 429, remaining competitions are not requested or auto retried
- [ ] Mobile 320/390 and desktop 1440: category headings, team names and navigation fit without overflow
- [ ] Static production build contains no real football data or API credentials

## Further international coverage
Additional national-team events, friendlies and qualification fixtures require separate source/entitlement verification and explicit approval before any gateway expansion.
