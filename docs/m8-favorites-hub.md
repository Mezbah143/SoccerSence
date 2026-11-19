# M8 — Favorites Hub

## Purpose
Extend the existing browser-only saved leagues and clubs into a usable personal football dashboard. **No account, backend, remote storage, notification service, paid tools or automatic football API requests.** Public football-data redistribution remains blocked.

## Features
- Favorites summary cards count all, league and club favorites.
- All / Leagues / Clubs tabs and local search over saved names, competition codes and league names.
- Saved league **Matches** link opens the local Matches view with the league preselected through an allowlisted query value. Existing manual **Load real fixtures** is still required.
- Saved league **Standings** and saved club **Find in standings** open the appropriate competition through its existing query parameter; users manually load a verified standings table before opening a club profile. No made-up/unsafe direct team navigation state.
- Up/down ordering of saved items (All tab with empty search), persisted in existing `soccersense-favorites-v1` localStorage format.
- Remove-one action, plus explicit confirmation before clearing all; empty and no-filter-matches states.
- Accessibility: visible focus, pressed tab state, accessible move and remove buttons, phone and desktop layout.

## Constraints and honesty
- Saved club name and provider ID originally come only from a verified standings profile. Saving never stores full provider fixtures or standings.
- LocalStorage is limited to 30 validated favorites; the app doesn't sync with other devices. If browser storage is blocked, changes may not persist.
- No new provider API endpoint, token, quota adjustment, polling, background fetch, new asset or paid plan.
- Keep real provider display development-only with delayed attribution; public build remains fictional.

## Manual acceptance checklist
1. Load local league standings manually, open club, Save; confirm it appears under Favorites -> Clubs.
2. In Leagues, save two competitions. Favorites counts should reflect saved items, even after browser refresh.
3. Filter by name/league; All, Leagues and Clubs tabs update without fetching provider data.
4. In All with no search, move an item up/down; order stays after refresh. Reorder controls are hidden when filtering so movement can't be confusing.
5. Click **Matches** on a saved league: league should be preselected, with no automatic call to the local gateway; click Load only when intended.
6. Click **Standings** on a saved league and **Find in standings** on a saved club: right league is preselected but table is not auto-fetched.
7. Remove one item; others retain order. Clear-all first asks for confirmation; Cancel makes no changes.
8. Validate 320px / 390px / 768px / desktop, keyboard navigation and fixed mobile tab bar. No buttons obscured.
9. CI lint, typecheck, unit tests, build, server compilation, secret scan pass.
10. No public hosting of real data; $0 budget preserved.

## Future
Account sync, personalized match notifications and direct club navigation from cold start require later work and verified data rights. They are not implied by this M8 release.
