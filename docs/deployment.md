# Free deployment runbook (planned)

No deployment is configured yet.

## Preferred static-host option
Cloudflare Pages free plan or GitHub Pages. For Cloudflare Pages, verify current free limits and use provided `.pages.dev` subdomain, not a purchased domain. A static SPA needs build output configuration and fallback route handling.

## Before enabling CI or production
1. Verify free hosting usage hard limits and no automatic paid billing/overages.
2. Set branch preview, build command and artifact directory after frontend bootstrap.
3. Store sensitive provider credentials **only** in server-only secrets; never in Vite client environment.
4. Configure secret-free sample mode first, then thoroughly vet any backend function pricing and request caps before activation.
5. Run lint/typecheck/test/build and manual mobile/browser checks.
6. Deploy preview; inspect routes/404, network calls, data attribution, no secrets.
7. Promote production with versioned release and manual smoke check.

## Rollback
Re-deploy last known-good commit through hosting provider or revert merged commit. Document exact commands after provider is selected. If a provider becomes paid or quota insufficient, disable external adapter and display clear outage notice rather than incur cost.
