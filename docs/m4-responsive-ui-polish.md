# M4 — responsive match-centre UI polish

Scope: presentation only for the **local real fixtures** interface and existing standings help text. No API, gateway, KST-date, router, rate-limit, fixture data, score or licensing changes.

## Screenshot-driven fixes
- Korean calendar explanatory text is one wrapping inline sentence in a flex child, not multiple independent flex items (which caused large visible gaps around bold text).
- Desktop league/date/load controls align consistently; tablet widths move the Load control to a full-width second row.
- On mobile, league occupies full width; previous/today/next are evenly distributed; KST date and Load each use a clear full-width row. Tap targets are at least 44px.
- Match cards have long-name wrapping and a bottom-aligned kickoff/detail footer; no crests, premium assets or external logos added.
- Existing standings explanation wraps as normal prose.

## Local acceptance checklist
1. At 1440px, 1024px, 768px, 390px, 375px and 320px, check that explanatory text is continuous, not scattered across columns.
2. At 390px and 320px, verify date buttons, calendar input, league selector and Load button remain usable without horizontal page scrolling.
3. Confirm fixture names and status badges do not overlap scores, and match cards remain fully clickable.
4. Confirm date changes and league changes never auto-fetch; only the explicit Load button calls the local gateway.
5. Confirm match detail/back navigation restores selected league, KST day and results; standings continue to work.
6. Continue to label source as delayed, show provider attribution and keep public preview fictional. No provider credentials in browser.

GitHub Actions validates lint/typecheck/unit tests/build with mocked data. Browser screenshots still require manual verification on a Mac or browser. Maintain strict **$0** cost and keep public redistribution/hosting approvals blocked.
