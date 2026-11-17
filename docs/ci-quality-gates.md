# Continuous integration and quality gates

## Verified baseline

On 2026-11-15 KST, [PR #12 CI](https://github.com/Mezbah143/SoccerSence/actions/runs/43608349376) and the [merged main run](https://github.com/Mezbah143/SoccerSence/actions/runs/43608636346) succeeded. Those runs predate the local gateway and lockfile change and do not validate it.

## Reproducible install

`frontend/package-lock.json` is now committed. `.github/workflows/frontend-ci.yml` requires `npm ci --no-audit --no-fund` and uses the lockfile for npm caching. Missing or inconsistent lockfiles fail; there is no fallback to `npm install`. This addresses the dependency reproducibility gap tracked under #2, not every acceptance criterion of that issue.

The read-only workflow runs on relevant frontend/CI changes, uses Node 22, a 12-minute timeout and concurrency cancellation. It runs lint, frontend/server typechecks, Vitest, Vite production build, a separate server build and a known-marker/browser sentinel check. No provider key or network access to a football service is needed. Only the HTTP test opens a loopback port. Public GitHub Actions is used within applicable free quotas; no paid runner is selected.

## Required review evidence

Record the new PR's actual check result before merging. Local validation does not substitute for GitHub status. UI changes additionally need browser, mobile and keyboard verification; this backend step leaves the UI unchanged. A bundled marker check helps catch accidental server imports but is not a general secret scan.

See [Milestone 3 local gateway](m3-local-gateway.md) for endpoint tests, rights/key controls, cost limits, and pending public deployment gates.

## Dependency audit during lockfile generation

The initial dependency tree inherited Vitest 3 and reported 10 development dependency findings (2 critical, 8 moderate); production-only audit reported zero. This change moves Vitest to 4.1.12, which removes the affected Tinypool dependency and updates the mocker. It also scopes a `minimatch: 11.0.1` override to `@typescript-eslint/typescript-estree` to address [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249). The override is a deliberate transitive major-version change, compatible with our Node 22/24 target; lint/typecheck/tests/build are rerun. Remove the override once typescript-eslint supports a patched version itself. ESLint 9 remains in place to avoid an unrelated configuration migration; its registry deprecation notice is not a successful security audit.

After these updates, the full `npm audit` reported **0 vulnerabilities** on 2026-11-15 KST. This is the registry advisory result at that time, not a guarantee of no vulnerabilities. Clean npm ci, 51 tests, typechecks, lint and both builds passed locally on Node 24.22.2/npm 11.19.1. GitHub CI separately checks Node 22.
