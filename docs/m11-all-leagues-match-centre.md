# M11 — All-Leagues Match Centre (development-only)

## Implemented scope

- Matches now opens all six competition headings immediately: Premier League (PL), La Liga (PD), Bundesliga (BL1), Serie A (SA), Ligue 1 (FL1), Eredivisie (DED).
- A single horizontal Korean-date (KST) selector appears beneath the heading, with adjacent days, previous/next buttons and an accessible date input. It retains the existing cross-UTC-midnight date handling.
- Favorite league codes from locally saved favorites are shown first. A safe `?competition=CODE` shortcut can prioritize a league; no arbitrary provider IDs.
- A single explicit **Load all fixtures** button requests missing leagues **sequentially**, at most one request in flight, with a maximum of six competitions attempted per click. A 429/disabled gateway stops subsequent calls immediately. There is no automatic polling, reload, retry, prefetch, or background request.
- Successfully validated results are temporarily cached **in memory** by KST date and league (up to 18 league-day responses). Revisiting a date or using match details/back reuses those results, with original source timestamp and attribution. Nothing is saved to localStorage or deployed.
- Sections have individual status labels for not loaded, unavailable, no fixtures, and verified fixtures; partial success is never overwritten with fictional data.
- Fixture cards link to the existing verified M6 match details and M7 same-day insights with exact per-league validated response and state; use existing provider attribution/delayed labels.
- Production build remains fictional only and cannot mount the real-data all-leagues component.

## Budget and known limitations

The private gateway still imposes **6 per 60 seconds, 100 per gateway session, one concurrent call, 8-second request timeout**. Loading six leagues consumes six calls when no cache exists. Any previous gateway use during the same 60-second window can prevent loading every league; remaining sections stay not loaded. There is no timer-based retry and no new API routes or keys.

**Automatic requests on opening the homepage are intentionally disabled** to protect Free-plan quotas. True background auto-loading requires a separately approved entitlement and production cache/aggregation design; it is not implemented or implied by the displayed league sections. Public data redistribution is not authorized; private development only.

## Acceptance checklist

1. Open Matches in local development: six league titles appear before any data request; selected KST date defaults to today; there are no network requests until pressing Load all fixtures.
2. Click Load all fixtures: requests occur in sequence, never concurrently, and the gateway is not bypassed. Each verified league displays its matches and attribution.
3. Select another KST date: no automatic request; select an already visited date and confirm cached league responses reappear without refetching.
4. Manually visit a date with no matches: the specific league shows a compact empty line rather than a giant empty page.
5. If quota 429 occurs, remaining leagues stay visibly not loaded; no automatic retry or fictional substitution.
6. With two leagues saved via Favorites, verify they appear first. Favorites -> league Matches shortcut prioritizes the chosen league, without auto-fetching.
7. Click a fixture; open M6 Match Centre; Previous/Next and Back preserve its correct league, day, attribution and M7 insights without additional upstream traffic.
8. Test 320px/375px/390px/768px/1440px, date bar horizontal fit, readable club names, keyboard navigation, focus ring, and fixed mobile navigation.
9. Run `npm run lint && npm run typecheck && npm run test && npm run build && npm run audit:public && npm run build:server` and review CI.
10. Public static preview still displays fictional data; no credentials or real provider results are bundled or published.

## Deferred

Fully automated multi-league fetching, public deployment of real data, live scores, multi-day historical match caching, external logo/media assets, and new paid services are outside M11's approved $0 scope.
