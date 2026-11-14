# SoccerSense — project reboot documentation

> **Status:** Milestone 1 planning. No runnable SoccerSense application, score feed, backend, or deployment is implemented yet.

SoccerSense is a proposed mobile-first football companion for fixtures, reported/delayed results, standings and match context. It will prioritize honest freshness indicators, predictable graceful failure, and a strict **$0 recurring budget**. This repository currently keeps its original README intact; this file is the new project landing page until the owner chooses to replace the main README during review.

## Documentation
Start at [docs/README.md](docs/README.md). Key references: [requirements](docs/product-requirements.md), [architecture](docs/architecture.md), [roadmap](docs/roadmap.md), [zero-cost policy](docs/zero-cost-policy.md), [football data research](docs/data-sources.md), [security](docs/security.md), and [testing](docs/testing.md).

## Planned MVP
1. Date-based match fixtures and recorded results.
2. Competition filtering and standings.
3. Match details limited to legitimately obtainable data.
4. Explicit data source, freshness, loading, quota and failure states.
5. Responsive accessible site and optional PWA.

No guarantee of true live scores under free-tier services. No betting, streaming, scraping or purchased imagery.

## Planned stack
React / TypeScript / Vite / Tailwind CSS; GitHub; static free hosting; provider adapter with server-side key protection when free hosting/terms are confirmed. Supabase Auth and favorites are **optional and deferred**. No paid accounts, credit card or purchased domain required for planned MVP.

## Local development
Not yet available. Development will begin under frontend scaffolding issue. Do not confuse documentation with a working app.

## Working agreements
Use GitHub Issues, short-lived branches, pull requests, verifiable tests, documentation updates, and CHANGELOG entries. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Ownership and licensing
No open-source license has been selected or committed; code is not automatically licensed for reuse just because the repo is public. Choose an explicit license in a dedicated issue after owner review. Third-party football data and logos have independent rights that must be checked.
