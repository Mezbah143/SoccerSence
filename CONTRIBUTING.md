# Contributing to SoccerSense

All contributions must respect the [zero-cost policy](docs/zero-cost-policy.md), security requirements and third-party content rights.

## Workflow
1. Find or create a GitHub Issue with goal, scope, dependencies and measurable acceptance criteria.
2. Start a branch: `feat/issue-number-short-name`, `fix/issue-number-short-name`, or `docs/issue-number-short-name`.
3. Make small commits using `type(scope): message` (types: feat, fix, docs, test, chore, refactor).
4. Add tests, user-facing states, documentation and CHANGELOG entry where relevant.
5. Open a pull request using the template; link issues with `Closes #N` only when all criteria pass.
6. Review automated checks, preview and accessibility before merge.

## Getting started
Milestone 1 is documentation-only: **no runnable app exists yet**. Frontend setup will be defined in the scaffolding issue. Do not instruct users to run `npm install` at repository root until package files exist.

## Definition of done
- Issue acceptance criteria met with evidence.
- Tests and manual checks appropriate to change recorded.
- No secrets, unlicensed imagery, unsafe scraping or paid dependencies.
- Accessible empty, error and loading states implemented if applicable.
- Docs and CHANGELOG reflect implemented behavior; screenshot or demo evidence linked.
- Only merge through reviewed PR into `main`.

## Conduct and reporting
Be respectful and constructive. For sensitive security reports, avoid filing exploitable details or tokens in public issues; contact maintainers privately using GitHub's repository security reporting where enabled.
