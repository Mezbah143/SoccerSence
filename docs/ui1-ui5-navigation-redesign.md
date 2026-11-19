# UI-1 to UI-5 — SoccerSense app-shell redesign

Implemented as one coordinated visual and navigation update. **No new provider API endpoint or background request is added. $0 incremental cost. Public preview remains fictional.**

## UI-1: Sticky premium header and five tabs
- SoccerSense logo on left; search, match calendar and settings quick links on right.
- Desktop: sticky top bar containing Matches, News, Leagues, Favorites, More.
- Mobile/tablet (<=940px): compact sticky top header + accessible fixed five-item bottom navigation, safe-area padding, active tab indication.
- Detail routes (team/standings, match details, settings/about) highlight their parent tab. Keyboard focus states preserved.

## UI-2: Leagues
- Six competition cards, links to the existing /standings?competition=CODE route and a Save button.
- Existing /standings route, provider gateway, team navigation, manual Load action and history/back navigation remain intact.
- No phantom competitions or licensed league artwork added.

## UI-3: Search + Calendar
- Header search routes to a functional, local-only search across the six allowed leagues and **saved** club identifiers/names. No API calls and no pretended comprehensive club index.
- Club search links to the relevant league; verified team profiles still require opening from freshly loaded standings because navigation state is validated.
- Calendar shortcut navigates to Matches and focuses the existing KST date control in development (or the demo date navigation in production). It does not trigger loading.

## UI-4: Favorites
- Leagues and already-verified team profiles have Save/Remove toggles, using browser localStorage with a strict allowlist and a 30-entry cap.
- Favorites page links back to leagues / standings and explains that account sync or direct team profiles are not available.
- No external requests, login, cookies, or stored full provider tables. If browser storage is unavailable, favorites may not persist.

## UI-5: News, More and Settings
- News provides official external-source **navigation** to FIFA, UEFA and Premier League websites, not copied articles, dynamic headlines, images, scraping, or a misleading live feed.
- More has real links to Settings, About and Search.
- Settings provides compact-card and reduce-motion preferences, scoped to the browser. KST data date behavior remains unchanged. The global bridge applies preferences at startup.

## Manual acceptance criteria
1. On desktop 1440px, verify logo left, five tabs centered, three utility icons right and sticky header when scrolling.
2. On mobile 320px, 375px, 390px and tablet 768px, verify the five-tab fixed bottom bar, visible active states, unobscured last cards, safe-area footer, and no horizontal overflow.
3. Keyboard Tab through all five tabs, quick actions, Save/Remove, search and settings. Focus ring should be visible.
4. Navigate Matches -> load delayed fixtures -> match detail -> back, confirming KST date/competition and **zero automatic network calls**.
5. Navigate Leagues -> select La Liga -> Standings, verify correct competition is preselected; load real standings manually; open club profile; Save; navigate Favorites; remove.
6. Search 'premier' returns Premier League; search an already saved club name returns its league route, **not an unverified direct club link**.
7. From News, external link opens official publisher in a new tab. No fetched article data is displayed.
8. Toggle compact cards and reduce motion; navigate away and refresh. Preferences should persist locally, and reset should restore defaults.
9. In production/static build, real fixtures/standings/team details remain unavailable as previously; News/Leagues/Favorites should explain limits accurately.
10. Lint, typecheck, unit tests, production build, local server compilation and secret scanning all pass CI.

## Deferred
- An automated news feed requires a rights-approved content source; not in this PR.
- Global team search requires an authorized local index/provider search entitlement; not in this PR.
- Cross-device favorites sync/accounts remain later milestones.
- No public real football-data API hosting, redistribution, paid services, logos, or live-score claims.
