# Product requirements — SoccerSense

Version: 0.1 (draft, 2026-11-14). Status: planning.

## Vision and problem
Football fans want one responsive, comprehensible destination for fixtures, results, tables and match context. Existing services differ in coverage, update latency, language and usability. SoccerSense emphasizes transparent data freshness and a simple mobile-first experience.

## Target users
- Casual supporters checking upcoming matches and results.
- Regular supporters following favorite teams and competition tables.
- Statistics enthusiasts inspecting supported match details.

## Scope and delivery
**MVP (V0.2–V0.3):** competition list, date navigation, fixtures and delayed results, standings, match details where licensed/free data exists, loading/error/empty states, mobile layout, freshness badges, accessibility.
**Later:** team/player profiles where endpoints permit; account/favorites via free-tier backend; installable PWA; news and analytics only after legal data availability is validated.
**Excluded from MVP:** guaranteed real-time scores, streaming, betting, unauthorized scraping, paid API dependencies, monetization, native app stores, and push alerts.

## Functional requirements
- FR-01 Users can choose a date and see available matches, competitions and kickoff time with timezone indicated.
- FR-02 Users can filter by competition, including an explicit no-results state.
- FR-03 Users can view match status, home/away team, score only when reported, and source update time.
- FR-04 Users can view standings for supported competitions, with season clearly marked.
- FR-05 Users can open a match detail view; unavailable fields display “Not provided,” never fabricated values.
- FR-06 System surfaces API errors, rate limits and stale cached data, with safe retry UX.
- FR-07 Layout works on mobile and desktop; keyboard navigation and sufficient contrast are provided.
- FR-08 Later: users may opt in to login/favorites; deletion/export requirements must be defined before collection.
- FR-09 API credentials never appear in browser bundles or repository.
- FR-10 There is a local fixture-data mode that works without external service access for testing.

## Non-functional requirements
- NFR-01 Strict $0 recurring spend: no credit-card-required resources or automated paid upgrades.
- NFR-02 Accessible target WCAG 2.2 AA where practical; document exceptions.
- NFR-03 No unlicensed football imagery, logos or copied articles.
- NFR-04 Good perceived performance: skeletons, pagination and caching; measure Core Web Vitals before release.
- NFR-05 Every external call has bounded timeout, errors and rate-limit handling.
- NFR-06 Automated lint/unit/build checks for every PR after app bootstrap.
- NFR-07 Never assert “LIVE” unless source contract and observed latency substantiate it.
- NFR-08 Small-screen experience supports widths from 320px.

## Success and acceptance
- A new visitor finds fixtures and league tables from documented free data.
- Dates, sources, score delays and unavailable fields are unmistakable.
- Initial website deploys on a free URL without purchasing a domain or enabling paid billing.
- CI and installation instructions reproducibly pass after app bootstrap.

## Unknowns and risks
API licensing, CORS, allowed redisplay, coverage of leagues and statistics, provider rate/usage limits, and exact data freshness must be confirmed before integration. User account and database are deferred until a clear need arises. This document does not claim functionality is implemented.
