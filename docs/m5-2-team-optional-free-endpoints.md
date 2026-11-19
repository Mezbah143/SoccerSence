# M5-2: Optional club information and recent finished results

Date: November 19, 2026. **Development-only, $0 maximum, public real-data redistribution forbidden until written permission and hosting feasibility are confirmed.**

## Access research: documented ≠ authorized

The provider's [v4 team documentation](https://docs.football-data.org/general/v4/team.html) documents `GET /teams/{id}` and `GET /teams/{id}/matches` (including date/status/limit filters). The [Free pricing page](https://www.football-data.org/pricing) lists fixtures, delayed scores, schedules and league tables, but does **not explicitly guarantee** both team endpoints for the specific Free account used here. We cannot inspect the owner's private key or verify the account entitlement through GitHub CI. **Do not claim actual Free access has passed.**

Accordingly, the two features are **off by default**. They do not become active merely by merging this PR.

Before trying either endpoint, the account owner must independently confirm that the endpoint is permitted on their current Free plan. No upgrade, paid trial or billing authorization is required or assumed. If not available on Free, **leave the setting off** and continue to use the existing standings-only team page.

### Safe private opt-in configuration

In the ignored **local** `frontend/.env.server`, keep existing Free-plan / rights-review / key settings unchanged. Only after confirming account eligibility for the specific resource, add one or both:

```dotenv
# OFF by default; set true only after confirming provider permission for each exact endpoint
FOOTBALL_TEAM_DETAILS_CONFIRMED=false
FOOTBALL_TEAM_MATCHES_CONFIRMED=false
```

Changing either to `true` requires restarting `npm run serve:data`; no client secret or browser variable is added. No real API keys should be printed, pasted into issues, or committed.

## What the implementation does

- Team profile includes **Load club details** and **Load recent results**. Each requires a separate deliberate click; no mount-time fetching, retries, polling or prefetching.
- Two strictly bounded loopback gateway routes:
  - `/api/team?competition=PL&id=57` → fixed provider `/v4/teams/57`
  - `/api/team-matches?competition=PL&id=57` → fixed `/v4/teams/57/matches?status=FINISHED&limit=5`
- The gateway only permits IDs it observed from a **successful, validated standings response in the same running gateway process**. This prevents arbitrary ID enumeration and makes data provenance explicit. After restarting the backend, **reload that competition's standings first**.
- Both routes share the original six calls/minute, 100/process budget, one in-flight, 8-second timeout, 512 KiB response limit, no follow redirects, sanitized errors and no automatic retries. Each click counts as one provider attempt (even if it fails). An optional 403 blocks that optional endpoint for the process, but **does not disable existing standings or fixtures**.
- Normalized club response contains only provider ID, name, optional short name, venue, founding year and region. No crest/logo, site URL, squad or personal data. Recent results contain at most five **finished** matches, explicit IDs, timestamps, club names and valid full-time scores. Invalid/mismatched records fail closed, not partial success.
- Client independently revalidates responses and shows the delayed label, retrieved-at time in KST and provider attribution. An unconfirmed or denied endpoint shows a clear unavailable message instead of invented data.
- Development-only team routes remain gated behind `import.meta.env.DEV` in React. Public build has no real-data team page. No new external packages or paid dependencies.

## Manual acceptance on Mac

1. Merge after CI and run `git pull origin main`. In `frontend/`, restart `npm run serve:data` and keep `npm run dev` running separately.
2. With both optional toggles at **false**, open Standings, load a league and click a club. Click each button: it should explain unconfirmed endpoints with **zero upstream provider calls**. Standings remain functional.
3. Only if your own Free-plan entitlement is confirmed, toggle the corresponding setting to `true`, restart the backend, load standings again and open the team page. Each click should result in exactly one local `/api/team*` request and (if authorized) only one upstream provider call.
4. Check team ID matches the clicked standings row, optional fields show Not supplied when absent, and match history is limited to genuine finished games. No crests, squad, or lineup data appears.
5. On a provider 403, the optional section becomes unavailable but the rest of the app remains functional; errors never reveal upstream credentials or response bodies.
6. Test 320px and 390px widths, keyboard focus and click-to-load; Back to standings still restores existing data without refetch.

## Validation

`npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, `npm run build:server` and GitHub Actions should pass using **fictional fixtures**, without account calls.

## Deliberately deferred

No full club squad, live statistics, logos, player information, infinite match-history pagination, automatic data refresh, public API proxy, paid-plan request or public provider-data hosting. Revisit only after entitlement and rights review.
