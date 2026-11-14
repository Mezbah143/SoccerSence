# Testing strategy

Status: proposed; no app tests exist yet.

## Tools
Vitest + React Testing Library for logic/UI; Playwright for browser smoke and accessibility checks; ESLint, TypeScript compiler and production build for static checks. Use free CI within GitHub quota.

## Test layers
- Unit: date/timezone formatting, match status, score-null handling, standings transformations, provider adapters, stale cache labels.
- Component: keyboard filters, match card accessible name, loading/error/empty/sample state, accessible table.
- Contract: fixture JSON schema and adapter normalization, 429 retry-after, delayed data timestamp, unknown provider fields.
- End-to-end: open homepage, select date, filter competition, open match, inspect standings, back navigation, responsive 320px screen.
- Security: no provider key in assets, invalid IDs rejected, no uncontrolled polling, rate limit failures handled.
- Manual: screen reader navigation, dark/light contrast, hover/focus, slow network, offline demo disclosure.

## Definition of passing
PR cannot be merged for application code unless lint/typecheck/build/unit checks pass; failures should block. Tests are added with the relevant feature. CI will be introduced when frontend tooling exists; do not claim current passing checks.

## Test data
Use explicitly synthetic fixture JSON with fictitious teams for routine tests, isolated from production provider data.
