# M19 — TheSportsDB free V1 artwork development integration

**Goal:** Add TheSportsDB to SoccerSense as a **manual, development-only badge discovery test** using its public shared free V1 API key `123`, without silently publishing third-party club crests or changing the rights-gated M18 registry.

## How to test
1. Pull this branch locally or merge its PR.
2. Run `cd frontend && npm run dev`. TheSportsDB preview uses a Vite-only local development proxy; it does **not** require the football-data.org gateway to test this separate artwork lookup.
3. Open **Settings → TheSportsDB — artwork test → Test Arsenal badge**.
4. The app makes one manual `GET /sportsdb-preview` request. Vite forwards only to `https://www.thesportsdb.com/api/v1/json/123/searchteams.php?t=Arsenal`. No user-entered URL, arbitrary club search, private token, browser-side API key or dynamic provider proxy.
5. Verify the preview identifies Arsenal (TheSportsDB ID `133604`), displays the badge URL from a tightly allowlisted TheSportsDB host/path, and credits TheSportsDB. If the API is inaccessible or returns unexpected data, show a safe error. Do not invent another club badge.
6. Open a real match, profile, standing or Favorites: existing **neutral M18 initials badges remain unchanged**. The user must authorize real crest-use rights separately before they can appear in the publicly released version.
7. Run `npm run lint && npm run typecheck && npm test && npm run build && npm run audit:public && npm run verify:release`. Production build must not expose any TheSportsDB artwork UI or local proxy.

## Why only Arsenal?
TheSportsDB free V1 team-name search is documented as a limited example for Arsenal rather than unlimited team-search access. The free public key `123` is not an account secret. Its pricing page shows a 30-request/minute free tier, but this feature makes **no automatic requests** and performs no loop or polling.

Official resources:
- Free API and endpoint documentation: https://www.thesportsdb.com/free_sports_api
- Terms: https://www.thesportsdb.com/docs_terms_of_use.php

TheSportsDB terms authorize lookup of artwork for **development projects**, but additionally say that third-party content needs permission or another legal basis. App-store publishing requires a paid plan and paying alone does not automatically clear the team's trademark. For a public SoccerSense release, check the provider's agreement and the individual badge's applicable third-party rights first.

## Current limitations
- TheSportsDB's `idTeam` **is not the same ID namespace** as football-data.org's `team.id`. The example above is not mapped into real fixtures to avoid false match identity.
- No club badge downloads, new icons, public hotlinking, user telemetry, API auto-refresh, new account or paid service.
- Local private preview is **not a public-rights grant** and must never be used as evidence that crests are cleared for deployment.
