# M18 — Team IDs, logos & branding (single reviewable PR)

## Scope and legal boundary

Football-data.org v4 match records include `homeTeam.id`, `awayTeam.id` and sometimes a crest URL. See https://docs.football-data.org/general/v4/match.html . Football-data.org terms explicitly say all team logos and profile graphics remain copyrighted by the respective legal owners: https://www.football-data.org/about .

This release **does not download, bundle, proxy, scrape, hotlink or display unlicensed team crests**. Provider crest URL fields are intentionally discarded on the private gateway. No assumption is made that access to the API or a free tier grants permission to use logos.

## What is implemented
1. Match normalization preserves nullable positive numeric IDs as strings: `homeTeamId`, `awayTeamId`. For unassigned fixtures and TBD national teams, IDs remain null; the app **never guesses IDs from names**.
2. Client-side fixture parsing validates IDs, rejecting malformed values. Verified match navigation preserves IDs and revalidates the underlying fixture object, so the identity badge remains stable without additional requests.
3. `TeamLogo` renders a matching **rights-reviewed local asset** when present, or a neutral branded initials badge when absent/broken. Logos never depend on a network request to discover imagery.
4. Integration: nine-competition home match cards, individual fixture details, legacy manual Match Centre, standings, club profiles, saved clubs, and fictional demo home. National teams use the same ID/fallback system; no unsupported country flag attribution.
5. `teamLogoRegistry.ts` is a hardcoded **deny-by-default** allowlist. Its entries must include rights holder, permission reference and permitted use. Asset references must be same-origin paths of the exact shape `/logos/teams/<teamId>.(svg|png|webp)`. No arbitrary remote URL, dynamic external image service, or user-input path is loaded.
6. `frontend/public/logos/teams` is the intended home for approved assets. **No real-logo artwork is included in this pull request**.

## Activating a real crest *after permission*
1. Obtain and retain written permission for this specific crest, from the responsible rightsholder, explicitly covering SoccerSense's intended public display, geographic audience and redistribution/caching if applicable. A logo being on Wikipedia, Commons, a CDN, or in a sports API does not alone prove usable rights. Do not copy artwork merely because the URL is accessible.
2. Review provenance and asset format. Reject untrusted or executable SVG, external references, scripts, embedded URLs, and unexpectedly large files. Prefer a vetted PNG/WebP when practical.
3. Add reviewed static asset as `frontend/public/logos/teams/57.png` (example ID only; don't introduce a real crest without authorization).
4. Add an exact entry in `frontend/src/teamLogoRegistry.ts`:
   ```ts
   '57': {
     src:'/logos/teams/57.png',
     rightsHolder:'Legal name of rightsholder',
     permissionReference:'Internal document or formal license reference',
     permittedUse:'public-web-display',
   },
   ```
5. Document permission and expiry/termination requirements privately; do **not** commit confidential license agreements, access tokens or personal details. Revoke an expired entry immediately.
6. Run `npm run lint && npm run typecheck && npm test && npm run build && npm run audit:public && npm run verify:release`. Check all views, responsive sizes and image-error fallback. Confirm network only loads the reviewed local URL.

## QA after updating locally
- View a verified Premier League match with numeric team IDs; both logos are fallback badges until rights are granted.
- View a World Cup fixture where a participant may be TBD/null; do not infer a federation badge or country flag.
- Open match details, standings, club profile, Favorites, then production fictional demo; typography and match names should remain readable.
- Verify no `crests.football-data.org` URLs are requested and no external artwork is introduced.
- Verify pressing the back button does not trigger a new provider fetch, quotas unchanged, 320px/390px and desktop layouts, VoiceOver team-name labeling (the initials badge is decorative because its team name is visible).
- Review all CI checks and confirm no static real football data or provider secrets are published.

## Limitations and follow-up
This is the **complete logo infrastructure and UI integration**, not a claim that all real team logos are licensed. Obtaining such licenses is a separate approval step. No new paid service, background polling, extra provider request or public real-data release is included.
