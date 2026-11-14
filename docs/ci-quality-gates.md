# Continuous integration and quality gates

Status: proposed automation in PR (not yet proven green).

## Purpose
Every frontend push and pull request should validate source quality before merge. Free GitHub Actions runs on public repositories under applicable GitHub quotas and policies; no paid hosting, football data, secrets or credit card is used.

## Workflow
`.github/workflows/frontend-ci.yml` runs on relevant frontend changes and can be started manually. It uses a read-only token, 12-minute timeout, concurrency cancellation, Node.js 22, npm dependency install, lint, TypeScript checks, Vitest tests, production Vite build and a basic known-secret-marker scan.

## Reproducibility gap
The repo currently lacks a `frontend/package-lock.json`. Until generated and committed, CI uses `npm install`, which may resolve different versions between runs. This is a temporary exception: locally run `npm install` in `frontend/`, commit the resulting `package-lock.json`, then change CI to `npm ci` and turn on npm cache using the lockfile. Track this in Issue #2. Do not claim a build passed until a GitHub Actions run reports success.

## Review checklist
- [ ] Workflow appears in Actions tab and PR check runs
- [ ] npm dependency installation succeeds
- [ ] Lint passes
- [ ] Typecheck passes
- [ ] Tests pass
- [ ] Production build passes
- [ ] No key leaked into dist
- [ ] Lockfile committed and npm ci enforced
- [ ] Accessibility and mobile browser checks completed before merging
