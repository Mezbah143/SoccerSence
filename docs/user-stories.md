# User stories and acceptance criteria

Priority: P0 = MVP critical; P1 = subsequent iteration; P2 = future.

## P0
**US-01 View fixtures:** As a fan, I select a date to see scheduled matches. Given a date with fixtures, show kickoff time in a labeled timezone, competition, opponents and status. Given none, show a helpful empty state. Given API failure, show retry and disclose last cache timestamp.

**US-02 Filter by competition:** As a fan, I select a league and see only matches from that competition. Accessible filter state persists during date navigation.

**US-03 View results:** As a fan, I see recorded scores and match status. Never label delayed scores as live. Explicit “data updated” timestamp accompanies dynamic score data.

**US-04 View standings:** As a fan, I open an available competition table. Show season, played, W/D/L, goals, goal difference and points when provided. If no standings exist, explain coverage.

**US-05 Match details:** As a fan, I open a match to view available info. Only source-provided facts appear; unavailable statistics show a neutral missing-data state.

**US-06 Resilient usage:** As a visitor, I can use a fallback demo when external free tiers are exhausted. Demo mode clearly says “sample data”; network failures never display sample data as real.

## P1
**US-07 Team details:** Team page with supported identity, schedule, results, optional roster if permitted.
**US-08 Player details:** Player information only when legally available via approved source.
**US-09 Favorites:** Sign in, follow/unfollow team or competition, list favorites, and delete account/data; define privacy notice before enabling.

## P2
**US-10 Insights:** Explainable trends from permitted data with methodology, sample size, attribution and uncertainty.
**US-11 Notifications:** Opt-in alerts only if a truly zero-cost, technically sound channel can be established.

## Definition of ready
Issue links to story, clarifies API feasibility, mocks/error states, acceptance tests, licensing and $0 cost.

## Definition of done
Code reviewed; automated and manual tests pass; accessibility checked; source attribution and timestamp confirmed; docs and CHANGELOG updated; deployed preview inspected.
