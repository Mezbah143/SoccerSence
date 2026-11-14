# Changelog

Format: Keep a Changelog-inspired. Future release notes will follow semantic versions when application code is shipped.

## [Unreleased]
### Added
- M3 disabled local-only fixtures/standings gateway with free-plan/rights/key gates, request limits and offline tests.
- Standings normalization preserving official positions/deductions and excluding artwork.
- Vitest 4.1.12 and a scoped patched minimatch override to address dependency audit findings.
- Frontend lockfile; CI now uses npm ci, checks server types/build and a browser secret sentinel.
- Local gateway setup, provider terms findings, quota boundaries and remaining rollout gates.
- Milestone 1 initial documentation set: requirements, user stories, architectural proposal, provider evaluation, free-cost guardrails, accessibility/security/testing/deployment/operations plans.
- Contributor guide, GitHub issue templates, pull request template and decision log.
### Not yet implemented
- Real data in the UI, authenticated provider verification, public backend/deployment and user authentication.
- Fictional React frontend and CI already exist; the local backend remains disabled by default.

## [0.0.0] — 2026-11-14
- Planning baseline for project reboot; not a published application release.
