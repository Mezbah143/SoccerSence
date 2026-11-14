# $0 policy and free-source register

**Hard requirement:** No spending money. No free trials that silently become paid, paid domains, premium APIs, card-required paid services, or overage charges. No deployment can be approved if it may charge automatically. A free tier has quotas and is not unlimited.

## Approved or candidate components (verify limits again before activation)
| Component | Candidate | Classification | Guardrail |
|---|---|---|---|
| Version control | GitHub public repository | Free | Standard free limits; no paid add-ons |
| UI | React / TypeScript / Vite / Tailwind / Lucide | Open source | Check individual licenses and lock dependencies |
| Static hosting | Cloudflare Pages Free / GitHub Pages | Free tier | Prefer provider subdomain; avoid paid upgrades |
| Football source | football-data.org Free | Free tier | **Scores delayed**, 12 competitions, 10 requests/minute as of 2026-11; attribution and reuse terms to verify |
| Data storage (deferred) | Supabase Free | Free tier | Up to 2 free projects; may pause on inactivity; never upgrade |
| CI | GitHub Actions free allowance for public repositories under applicable terms | Free within limits | Avoid large browser matrices; quota-check |
| Design | Mermaid / Markdown / Figma free or pen-and-paper | Free/open options | No purchased assets |
| Monitoring | Console + free hosting logs | Free allowance | Disable costly third-party tools |

## Provider documentation (checked 2026-11-14)
- https://www.football-data.org/pricing
- https://developers.cloudflare.com/pages/platform/limits/ (Free: 500 builds/month at check)
- https://supabase.com/pricing
- https://supabase.com/docs/guides/platform/free-project-pausing (free projects may pause)
- https://docs.github.com/en/billing

## Gate before activating any provider
1. Confirm API/SDK licensing and redistribution permissions, attribution rules, and competition branding/logo rights.
2. Confirm current free quota, region availability, whether billing details are necessary and whether hard caps stop usage without charges.
3. Confirm any request/response caching is permitted; calculate worst-case calls per visitor and shared global quota.
4. Record URL, check date, owner, limits, fallback, expected traffic and exit criteria in an issue.
5. If free usage is insufficient, lower update cadence/coverage or disable that feature; **never** silently upgrade.

## Budget ledger
| Item | Planned spend | Actual spend | Status |
|---|---:|---:|---|
| Software and development | $0 | $0 | No paid purchases authorized |
| Domain | $0 | $0 | Use free subdomain |
| Hosted data | $0 | $0 | Not activated |
| Football API | $0 | $0 | Not activated |
| Deployment | $0 | $0 | Not activated |

Actual spend is recorded as $0 for project actions covered by this repository plan, not a statement about the owner's unrelated accounts. Reassess limits before deployment, then monthly.
