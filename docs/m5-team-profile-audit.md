# M5-1: Standings-powered local Team Profiles

**Scope:** development-only navigation from verified league standings to read-only team profile. No new upstream requests, paid services, licenses, logo assets or new external dependencies.

## Team ID and access audit (2026-11-19)

- Existing `src/providers/standings.ts` validates numeric positive `row.team.id` and normalizes it as `teamId: string`; `src/localStandings.ts` validates that value again before display.
- Existing `src/providers/footballData.ts` match view keeps *team names only*, not IDs. Therefore match-card-to-team navigation is deliberately **not included**: matching names to IDs would be unreliable.
- Official provider docs describe `GET /v4/teams/{id}` and `/v4/teams/{id}/matches`: https://docs.football-data.org/general/v4/team.html
- The provider Free pricing lists delayed fixtures, scores and league tables, but it **does not prove this account is entitled to specific team endpoints or historical matches**: https://www.football-data.org/pricing
- No authorized live Free-key test was available in this workflow, so **do not claim team endpoints work**. This milestone uses an existing, already-confirmed standings response, making **zero additional provider calls**. Verify additional endpoints with the local account before any future feature that requires them.
- Provider attribution continues unchanged. Local-only usage is not public redistribution permission.

## UX and data contract

1. User opens Standings, selects one of the six allowed leagues, and explicitly clicks Load.
2. Club names in the loaded official table link to `/team/:id` with browser route state containing the normalized standings response, competition, exact team ID and index of the table.
3. `readVerifiedTeamState` **re-validates all navigation state** and requires route team ID, team ID in the table and allowed competition to match. It does not infer IDs from team names or query upstream.
4. Team page shows competition, stage/group, position, played, won/drawn/lost, points, goals for/against and official goal difference. Official deductions/negative points are preserved.
5. The page shows source attribution, fetch timestamp and *delayed* label. When navigation state is missing or invalid, it displays an explicit unavailable state, not fictional or stale data.
6. Back link restores the already-loaded standings table without refetching; no background requests are introduced.
7. Production builds keep this route unavailable.

## Testing and manual acceptance

- Unit tests exercise verified IDs, route mismatch, malformed navigation, unsupported competition, missing rows and official negative points.
- CI must pass `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` and `npm run build:server` without network credentials.
- Manual local flow: `npm run serve:data` in one terminal, `npm run dev` in another; open Standings, choose a league and Load. Click any club; verify the row metrics, KST retrieval timestamp and attribution. Return to standings; no extra provider request should appear in browser Network panel. A direct refresh on `/team/57` should show *unavailable*.
- Check mobile 320px, 390px, 768px and desktop, keyboard tab navigation and visible focus.
- All sample test names and numbers are fictional.

## Follow-on M5-2 (separate PR only after entitlement verification)

If permitted by the user's actual Free account, add a strictly allowlisted, quota-limited team endpoint and normalize only approved fields. Do not assume squads, player photos, crests, historic matches or redistribution rights are included. Prefer first introducing provider team IDs to existing match normalizers after careful compatibility testing.

**Launch block:** Real provider display remains local-only; public hosting, caching and redistributing data require independent rights and $0-cost assessment.
