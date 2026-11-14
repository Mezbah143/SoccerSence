# Roadmap and milestones

Estimates are targets, not guarantees. All features must run on truly free/open-source resources.

## M1 — Documentation and governance (current)
Deliverables: documentation index, product requirements, architecture, $0 policy, source assessment, security/testing/deployment/operations, issue and PR templates, contributor guide, initial prioritized issues.
Exit: docs interlinked, initial tasks tracked, proposed decisions and open risks clearly labeled; no application features falsely claimed completed.

## M2 — Frontend foundation
Bootstrap React/TypeScript/Vite, routing, lint, tests, responsive shell, accessible navigation, sample fixtures data, documented local setup and CI checks.
Exit: clean local install, builds pass, mobile/keyboard UI verified.

## M3 — Football data MVP
Research/approve a licensed $0 provider; add secure adapter and caching if free deployment supports it; deliver dates, filters, fixtures/delayed results, standings, match details with timestamps and full failure states.
Exit: reproducible demo against permitted provider or clearly labeled offline demo fallback; stays within free quota.

## M4 — Beta release
Deploy on free subdomain; PWA manifest/service worker only after offline-state correctness; audit accessibility, errors, rate limits, privacy, deployment and monitoring. Release v0.1.0 beta.
Exit: public URL; smoke tests; rollback instructions; documented limitations.

## M5 — Optional extensions
User accounts, favorites, teams/players, news, insights. Each requires evidence of permitted free coverage, lawful content, sustainable free limits and privacy safeguards.
Exit: independent product decision per feature.

## Initial backlog order
1. Repo hygiene / GitHub templates / docs baseline (M1)
2. Frontend scaffold + CI (M2)
3. Design system + homepage + sample fixtures (M2)
4. Free API licensing / coverage spike (M3)
5. Secure proxy and cache feasibility (M3)
6. Fixtures/standings/match detail (M3)
7. Public preview, smoke tests and release notes (M4)

Scope freeze: never prioritize unaffordable “real time” claims over a transparent functioning delayed-score product.
