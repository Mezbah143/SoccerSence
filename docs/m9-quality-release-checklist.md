# M9 — Quality, accessibility, security and release acceptance

Date: 2026-11-19. Scope: React/Vite football MVP local development, fictional public static preview only.

## Automated checks (CI)
- `npm ci --no-audit --no-fund`, ESLint, TypeScript frontend and gateway, Vitest, Vite production build, local server compilation.
- Static `npm run audit:public` checks generated public HTML/CSS/JS for server-side secret patterns and an **uncompressed JS 900KB budget**. It does not claim to prove absence of all secret leaks or grant data display rights.
- Existing CI sentinel scan remains in place.
- New focusable main content / keyboard skip link and descriptive 404 state.
- Production real-data routes remain gated by `import.meta.env.DEV`, provider HTTP gateway binds 127.0.0.1 only. No new data endpoints or costs.

## Human QA checklist (NOT automatically verified by CI)

| Gate | Acceptance check | Evidence/status |
| --- | --- | --- |
| Navigation | All five tabs and quick actions route correctly; nested matches/standings/team keep correct parent active | Manual browser verification required |
| Mobile | 320, 375, 390, 768, 940, 1440px; no horizontal document scroll, fixed tab bar never hides the last action | Manual verification required |
| Keyboard | Start with Tab: visible Skip to main content link; Enter focuses main landmark; every action reachable, focus visible | Manual verification required |
| Reduced motion | User-selected Reduce animations works after reload; system reduced-motion is also respected | Manual verification required |
| Favorites | Save, search, reorder, remove, clear confirmation and persistence in same browser; no account, no network call | Automated logic tests + browser verification required |
| Fixture navigation | Select competition, KST day, Load manually; match detail Previous/Next/Back preserves loaded results and date | Unit tests + browser verification required |
| Standings/team | Select league, Load manually, open verified team ID; absent state fails closed | Unit tests + browser verification required |
| Fault states | Gateway disabled, 429 quota, empty fixtures, invalid responses, direct refresh on team/match routes show safe, useful messages | Unit tests + browser verification required |
| Accessibility | Contrast of text/buttons/badges, semantic headings, VoiceOver readout, zoom to 200%, touch targets | Human assistive-technology testing required |
| Performance | Check Lighthouse mobile report, network requests, bundle size, no console errors, low-end device navigation | Static JS budget automated; Lighthouse/browser unverified |
| Security | No secrets in production build, 127.0.0.1 gateway, no automatic polling, malformed requests rejected, no public real-data route | Existing tests & bundle guard; production hosting review required |

## What automated success does NOT mean
- Browser visual review, VoiceOver, Lighthouse scores, real-device compatibility and security penetration testing are **not** automatically performed in this milestone.
- Provider licensing, public hosting, legal compliance, and permission to display delayed results publicly remain **unverified**.
- A static site may be released as a **fictional demo only**, subject to verifying hosting terms and public content.
- Do **not** turn on real-data modes through public environment variables or expose the localhost gateway publicly.

## Rollback
If the interface breaks, revert the latest merged PR/commit on `main` and redeploy only the last passing fictional production build. Keep the backend private, with API credentials only in ignored `.env.server`. Avoid storing real-data API responses in localStorage or deployed static assets.

## Release handoff
M10 must distinguish (a) fictional public preview feasibility from (b) licensed real-data product launch. Neither public hosting nor licensing can be declared complete based on green CI.
