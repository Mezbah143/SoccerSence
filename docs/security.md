# Security and privacy plan

Status: design requirements, not a security audit.

## Threat model
Assets: provider keys, source quotas, visitor session, favorites data (future), deployment credentials. Threats: leaked tokens, malicious API responses, abuse causing quota exhaustion, injection/XSS, auth misconfiguration, and inadvertent collection of personal information.

## Controls
- Store API keys only in server-side secrets; commit only `.env.example` with placeholders.
- Never use `VITE_*` variables for secrets: Vite injects these into public browser bundles.
- Validate incoming parameters (dates, IDs), sanitize/escape dynamic content, use HTTPS, apply Content Security Policy as appropriate.
- API adapter rate-limit and cache; return bounded errors and avoid logging tokens.
- Pin dependencies with lockfiles; automated dependency alerts and package review.
- Before Supabase: enable row-level security, deny by default, restrict public keys appropriately, document account deletion, minimal storage and privacy statement.
- Do not scrape restricted sites or redistribute third-party brand assets without permission.
- If secret exposed: revoke at provider, rotate, scan history and document incident. Removing from current commit is insufficient.

## Security acceptance checklist
[ ] No real keys in repository or frontend build
[ ] Input validation and bounded requests
[ ] Caching and rate-limits survive abusive use
[ ] Test source-failure behavior
[ ] No user PII collected without documented purpose and deletion flow
[ ] LICENSE and third-party attribution reviewed
