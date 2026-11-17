# Phase 1 / Step 1 — local gateway verification

Review date: 2026-11-17. Scope: source review + latest GitHub Actions result only. **No authenticated provider request, local runtime experiment, or browser integration test was performed during this review.**

## Evidence
- Gateway implementation: [gateway.ts](../frontend/server/gateway.ts), [http.ts](../frontend/server/http.ts), [index.ts](../frontend/server/index.ts).
- Tests: [gateway.test.ts](../frontend/server/gateway.test.ts), [http.test.ts](../frontend/server/http.test.ts).
- [Successful main CI run](https://github.com/Mezbah143/SoccerSence/actions/runs/44021018759).
- [Frontend app](../frontend/src/App.tsx) imports fictional fixture data from `frontend/src/data.ts`; it does **not** use the gateway.
- [Existing gateway documentation](m3-local-gateway.md) records the original local-only security model.

## Verified from source
1. `GET /api/fixtures?competition=PL&date=YYYY-MM-DD` and `GET /api/standings?competition=PL` are the only supported route shapes; unknown/extra/duplicate parameters and invalid dates fail before a network request.
2. Upstream is fixed to the football-data.org v4 HTTPS host; credentials are passed only in the server-side header and not emitted in normalized responses.
3. Gateway is disabled by default; enabling requires a free-plan acknowledgement, rights-review record and key. These are **operator attestations** and not automatic verification of rights or coverage.
4. Six attempted upstream calls per rolling minute, maximum one simultaneous call, 100 calls per process, provider 429 cooldown and blocking after 401/403 are implemented and exercised in unit tests.
5. Network and provider failures are sanitized; request timeout is 8 seconds, response body capped at 512 KiB; HTTP listener is restricted to loopback and requests are not CORS-enabled.
6. Main branch CI passed. Test suite uses mocks for provider calls. A real free plan, rights, billing safety and real fixtures remain unverified.

## Limits and residual risks
- **No UI integration:** frontend uses invented results and a standings placeholder. This remains the expected safe behavior; do not label the feature complete.
- **Not public-ready:** gateway rate budgets are in-memory and reset on restart; they do not support shared quotas across instances.
- **No cache:** gateway sends `Cache-Control: no-store`. A hosted design will need permitted caching and provider-specific terms.
- **Restricted coverage:** hardcoded Premier League only; wider competition support depends on free-plan tests and legal redistribution rights.
- **No local real-provider test** without the owner's own free credential. Never paste tokens into issues, source or chat.
- Latest CI confirms pipeline outcome only, not a production deployment or independent network audit.

## Step 1 disposition
**Local gateway implementation review complete; no code changes requested by this audit.** Keep issue #6 open: its proposed secure production adapter and shared cache/rate limits are not complete.

## Next step (separate work item)
Phase 1 / Step 2: verify the provider's terms for the intended use, owner-controlled Free account, allowed API coverage, quotas, billing safety, source attribution and required proxy deployment plan. Only then perform a bounded authenticated local trial; do not wire live data into the UI until authorization and licensing are clear.
