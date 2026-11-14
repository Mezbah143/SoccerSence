# Architectural decision log

## ADR-001 — Zero-dollar constraint
Date: 2026-11-14. Status: **Accepted**. No purchase, billing-dependent overage, automatic paid upgrade or required domain. Tradeoff: limited coverage and possible service suspension. Any requested exception needs explicit owner approval; project defaults to $0.

## ADR-002 — PWA-first strategy
Date: 2026-11-14. Status: **Proposed**. React/TypeScript responsive web frontend before native apps. Reason: one codebase and free distribution; revisit if user chooses otherwise.

## ADR-003 — Football provider abstraction
Date: 2026-11-14. Status: **Proposed**. Dedicated adapter prevents vendor lock-in and keeps server secrets private. Cache/quotas by provider rules. No direct public client key.

## ADR-004 — No invented real-time claims
Date: 2026-11-14. Status: **Accepted**. Score freshness must be correctly labeled; free delayed feeds cannot be marketed as real time.

## Open decisions
- Whether GitHub Pages or Cloudflare Pages for initial static preview.
- Whether any zero-cost backend can reliably secure a provider token while respecting API terms.
- Which leagues/competitions free feed can actually display; what logo licensing permits.
- When (or if) Supabase is worth adding.

## ADR-005 — Local-only provider evaluation before hosting
Date: 2026-11-15. Status: **Accepted for development**. Implement a disabled-by-default loopback gateway for PL fixtures/current standings, no data cache or artwork, explicit Free-plan/rights/key gates and bounded requests. Preserve sample UI. Process-local counters are unsuitable for public/multi-instance hosting. [Details and rollout gates](m3-local-gateway.md).
