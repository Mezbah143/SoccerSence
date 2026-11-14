# Operations and maintenance (planned)

## Monitoring
Review deployment failures, browser errors, source freshness, provider quota/rate-limit warnings and uptime using included free logs. Avoid paid monitoring or tracking.

## Runbook
- Missing scores: validate source and last update; show delayed or unavailable label.
- 401/403: check revoked key server-side, attribution and plan terms; never paste secrets into issues.
- 429: respect retry-after, increase caching/reduce requests; no client polling loops.
- Hosting free limit: stop new builds or reduce site traffic/requests; never upgrade automatically.
- Database paused: restore through free dashboard if permitted; make favorites gracefully unavailable.

## Maintenance cadence
Weekly dependency and issue review while actively developing; monthly recheck of free-tier limits and data rights. Document dated findings in [zero-cost policy](zero-cost-policy.md). Every release gets CHANGELOG entry and a rollback plan.

## Incident template
Time, impact, affected versions, provider/source status, mitigation, user-visible data freshness, follow-up, owner. No credentials in public incident records.
