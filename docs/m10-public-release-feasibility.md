# M10 — Public release feasibility and decision register

Reviewed 2026-11-19. **This is a release assessment, not deployment authorization.** M9 PR #31 must be merged and human QA completed before adopting this release plan.

## Release decision

| Candidate | Decision | Reasons |
| --- | --- | --- |
| Local developer MVP with delayed football-data.org via loopback gateway | **Allowed only in existing private developer setup** | Existing allowlisted endpoint, manual fetching, fixed request budget and private key, never Internet exposed |
| **Public fictional static preview** with no provider data or backend | **Conditionally feasible ($0 hosting)** | Vite production builds remove local real mode; preview has no API secret; a static host with SPA fallback and available Free tier could serve its assets. **Do not auto-deploy this PR.** |
| Public delayed-real football MVP | **NOT APPROVED / blocked** | Written provider permission for public display/republication, caching and any commercial use still not confirmed; production-grade shared quotas, rate-limits, security, operational funding and domain restrictions are unresolved |
| Public live-scores app | **NOT AVAILABLE on this Free plan** | Published Free tier lists delayed scores; do not market the MVP as live |

## External facts and evidence (checked 2026-11-19)

1. **Provider Free pricing**: https://www.football-data.org/pricing lists €0/month, 12 competitions, delayed scores/fixtures/league tables and 10 calls/minute as advertised provider capacity (our **own gateway remains stricter at 6/min and 100 per process**). Paid add-ons advertise deeper statistics. Free plan does not by itself grant unambiguous permission to republish provider data for a public audience.
2. **Provider terms**: https://www.football-data.org/client/register — single application/domain subscription restriction (2.3), fair-use (3), credentials must not go in open repositories (6), exact attribution (7), no continued use of previously obtained data after subscription cancellation (9.1), images/logos subject to rights holders (9.2). T&C version on registration page states 2018; ask provider to confirm applicable current terms. Provider's terms do **not** establish unrestricted raw redistribution or caching for this product.
3. **Cloudflare Pages Free static candidate**: https://developers.cloudflare.com/pages/platform/limits/ currently documents 500 builds/month, 20,000 static files and 25 MiB per file; https://developers.cloudflare.com/pages/configuration/serving-pages/ documents SPA fallback without a top-level 404; https://developers.cloudflare.com/pages/configuration/headers/ documents a `public/_headers` file. This does **not** guarantee the account's billing/availability status or perpetual pricing.
4. **GitHub Pages static alternative**: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages — available for public repositories with Free; project sites normally mount under `/<repo>`, so Vite base and BrowserRouter need adjustment. Its usage restrictions must be reviewed; it is not the default candidate for this app.

## Architecture split

### Public fictional static preview (candidate only)

Source main + React/Vite production build `npm ci && npm run build && npm run audit:public`, deployed **ONLY** from `frontend/dist`. Build-time `import.meta.env.DEV` must be false. No worker/functions, secret environment variables, real provider responses, server bundle, or `serve:data`. Browser favorites remain localStorage. News sends users to original publishers.

Cloudflare Pages project fields once approved:
- Git integration: this GitHub repository (with repository owner authorization)
- Root directory: `frontend`
- Build command: `npm ci && npm run build && npm run audit:public`
- Build output directory (relative to root): `dist`
- Runtime environment: none; do not add `FOOTBALL_API_KEY`, `DATA_MODE` or private `.env.server`
- Functions and Workers: **none**
- Domain: platform-managed `*.pages.dev` avoids a paid custom domain
- For static assets only, `frontend/public/_headers` installs restrictive security headers on Cloudflare Pages (not Github Pages); inspect CSP/browser console in staging
- Test hard-refresh on `/favorites`, `/settings`, `/news`; never ship a top-level `404.html` unless SPA routing is reconfigured

### Public real-data service (future, blocked)

A new back end must isolate credentials, use production authentication/abuse prevention where appropriate, bound global rather than per-process quotas and concurrent traffic, tolerate service outages, add cache only if explicitly permitted, log safely, support takedown/revocation, verify user privacy/legal requirements, and have a spending/traffic cap. Existing loopback gateway **must not** be made public or copied into Workers/Functions without separate design and review.

## Owner approval and evidence still missing

- [ ] Provider written confirmation: web-app display/derived insights, attribution, caching/storage periods, redistributing fixture/standing results, whether multi-user public app fits Free, commercial/public domain rules, logos and team identifiers
- [ ] Actual provider account entitlements checked privately; no secrets sent to GitHub issues/PRs
- [ ] Hosting account Free eligibility, usage/billing controls, project name, terms, and region verified by owner
- [ ] M9 human navigation/mobile/VoiceOver/performance checks completed
- [ ] Privacy disclosure and external link disclaimer reviewed for deployment jurisdiction
- [ ] Static build files inspected: only fictional fixtures, no private gateway or provider data, no API key
- [ ] Static SPA deep links, CSP, accessibility and browser console verified on a preview
- [ ] Rollback to last good static deployment rehearsed

**Decision:** Ready for a **manual fictional static-preview deployment exercise only after the checkboxes are satisfied**. Real-data public release stays blocked.

## How to seek provider approval

Contact the provider using the contact on https://www.football-data.org/pricing or FAQ; identify the single domain/app and Free account, intended public audience, exact endpoints and derived stats, attribution, expected traffic, caching retention and whether adverts/monetization may eventually be used. Seek explicit written permission. Do not interpret silence as approval.

## Rollback

Revert the newest preview deployment to the previous tested `main` commit in the hosting dashboard. Keep `FOOTBALL_API_KEY` only on the private developer computer, never on public CI/hosting. No subscription purchases or paid upgrades are authorized under the $0 constraint.
