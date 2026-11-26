# M17 — MVP release verification and handoff

**Status: automated verification candidate, NOT public real-data approval.** M17 is stacked after M14, M15 and M16. Four draft PRs must be merged in that order. The user will review and merge them; this PR neither deploys nor changes repository visibility.

## What CI verifies
- Existing ESLint, frontend/server TypeScript, Vitest unit tests, Vite static build, generated-output secret-marker guard, and gateway compilation.
- New `npm run verify:release` checks code-level release boundaries: real match, standings, and team components remain behind `import.meta.env.DEV`; local gateway and Vite bind loopback only; provider secret remains server-environment sourced; the nine competition allowlist remains explicit; aggregate fixture requests remain on our local gateway route.
- These are **regression checks**, not a proof of absence of all vulnerabilities, data rights, or visual defects. Build and test outcomes are recorded in GitHub Actions.

## Human verification — complete before merging/deploying

| Area | Checks | Evidence |
| --- | --- | --- |
| Home (M14) | At 320/375/390/768/1440px, compact top bar, date strip and fixed mobile navigation are usable, no horizontal overflow, full KST date selection | Browser screenshots |
| Loading (M14) | One automatic consolidated request when appropriate; cache revisits; a provider 429, 403, malformed payload, no fixtures and partial manual response never invent results or trigger automatic retries | Chrome Network response/error categories |
| Club discovery (M15) | Manually load supported standings, filter a club, open its official ID, use nearby table club, Back restores source data; no extra calls | Browser + network |
| Comparisons (M16) | Confirm official points (including possible deductions), group/stage isolation, goal rates and zero-played Not available against table | Browser + example arithmetic |
| Accessibility | Tab and Shift+Tab flow, visible focus, Skip to main content, 200% zoom, system/user reduced motion, VoiceOver labels, contrast, 44px mobile action reach | Manual assistive-tech check |
| Performance | Actual mobile Lighthouse and slow-network run; no repeated requests after normal navigation; check static JS size and console output | Lighthouse/Network |
| Security | Confirm no real provider fixtures or keys in static dist; no externally reachable gateway, no cookies/account data; no unlicensed crest artwork | Bundle audit and network |
| Public static preview | Only fictional fixtures and third-party outbound news links; browser favorites only; deep link reload works on selected static host; CSP/safe headers tested | Staging smoke check |

**A CI success does not substitute for these manual checks.** Do not describe M17 as fully production-ready until they are completed.

## $0 release decision
- Private localhost MVP: development use only, delayed and attributed provider data, the existing strict per-minute/session gateway quotas.
- Public fictional demo: may be feasible on a verified free-tier static host, but needs account/hosting terms review, manual QA, and explicit user authorization; **not deployed in M17**.
- Public real-data launch: **BLOCKED** until written provider authorization for public display, retention, caching, derived statistics and redistribution; production backend architecture, safe quotas, abuse controls, accessibility/legal/privacy requirements and reliable operating costs remain unresolved.
- Live scores or prediction claims remain prohibited under the current delayed-data MVP.

## Merge sequence
1. Merge **M14** draft PR #37 into `main`.
2. Retarget **M15** #38 from `feat/m14-home-polish-reliability` to `main`, verify the diff and CI, then merge.
3. Retarget **M16** #39 from `feat/m15-competition-team-discovery` to `main`, verify and merge.
4. Retarget **M17** to `main`, verify CI and complete manual checklist before merging.

**Do not merge all four at once.** Because PRs are stacked, retarget bases after their predecessor merges. Review any unexpected diff before continuing.

## Local commands
```bash
cd frontend
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run audit:public
npm run verify:release
npm run build:server
```

## Rollback
Record last verified main commit. If a merged feature regresses, use a new GitHub revert PR for the specific milestone and retest. Never copy `frontend/.env.server` into hosting or browser build. Restart the old localhost gateway on port 8787 after server code changes; do not open its port to external traffic.

## Outstanding decisions
Hosting provider and Free eligibility; data rights and permitted use; human mobile/accessibility checks; static preview approval. No payments or deployment actions are authorized by this roadmap.
