# M14 — Nine-competition homepage polish

Scope: compact, accessible presentation of existing verified local data; no gateway, token, endpoint, permission, quota, or API request changes.

- Shorter truthful development/public demo banner; removes the tall warning banner.
- One-line automatic loading summary with optional explanatory details. Failure remains visible with explicit manual fallback.
- Per-league verified match counts, compact loading/empty/error treatment; favorites and national-team grouping preserved.
- Skip redundant refresh if a user selects the currently active date. Do not add polling, retries or new automatic provider requests.
- Scoreless match detail uses **VS** rather than a misleading score; a real final score is displayed only when supplied by the validated fixture.
- Keyboard focus rings and reduced spacing across 320px–desktop.

## Manual review checklist
1. On a 320px viewport, inspect date strip, toolbar, all nine headings, saved leagues, and pinned bottom navigation.
2. On desktop, check the top banner and match cards; no horizontal overflow at 200% zoom.
3. On a day with no fixtures, verify a compact truthful empty state. On a mixed day, match counts agree with shown cards.
4. Change KST dates and navigate to details/back; no duplicate provider calls for a repeatedly selected day.
5. Trigger an unavailable aggregate response and ensure the manual fallback remains usable, without automatic retries.
6. Check scheduled match detail says VS; finished match shows exact verified score.
7. Run lint, typecheck, tests, build, public audit, and gateway build.

Real-data display remains private localhost only. Public production retains fictional fixtures. The Free-plan and $0 restrictions are unchanged.
