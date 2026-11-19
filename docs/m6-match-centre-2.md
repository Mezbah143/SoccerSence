# M6 — Match Centre 2.0

November 2026. Private local delayed-data MVP, **$0** new cost.

## Scope

1. Reorganize an existing verified match into a professional responsive scoreboard with clear home/away names, monogram placeholders and kickoff in KST.
2. Conservative, unit-tested match status labels: finished, scheduled, postponed, cancelled, suspended, awarded and delayed in-progress; unknown stays "Status unavailable".
3. Render an actual score only if **both** numeric scores were supplied. Missing values show dashes with an explanation; no simulated score, timer or live animation.
4. Display competition, the selected KST (or legacy UTC) day, exact UTC kickoff, fixture ID, delayed freshness and source attribution.
5. Offer adjacent previous/next matches **only** from the existing validated same-day response, with the verified date, competition and zone preserved; no new provider call.
6. Link to the existing selected competition standings. Do **not** guess team IDs from match names: verified club profiles still require opening club names from standings.
7. Update fixture-card labels to use the same pure presentation function.

## Non-goals / constraints

- No gateway, new API, client-side token, additional paid service, background polling, retries, or external assets.
- No unsupported possession, heatmaps, timeline, lineup, player ratings, events, statistics, images or highlights.
- Real data is development-only, delayed, manually loaded. Production stays fictional. No public provider redistribution rights assumed.

## Manual acceptance

- Run existing private gateway and frontend using `npm run serve:data` and `npm run dev` in separate terminals.
- Load a fixture from Matches; verify status, score treatment, team names, kickoff KST, and clear provider attribution.
- If multiple matches exist, use Previous/Next. They must navigate without provider network requests, and preserve date, selected league, and result.
- Back to matches restores the loaded fixtures and KST day; competition standings opens preselected league, but requires manual Load.
- A direct refresh of the match-details route shows the honest unavailable state rather than fetching or substituting fictional data.
- Test widths 320, 375, 390, 768 and 1440px. Check focus rings and bottom navigation doesn't obscure controls.
- Confirm CI lint, typecheck, unit tests, production build, local gateway build and secret guard all pass.

## Follow-ups

The existing fixture normalizer intentionally does not preserve provider team IDs. Verified direct team links from match cards therefore remain a separate compatibility-tested enhancement, not part of M6. Rich live statistics would require a new licensed data source/entitlement assessment and are explicitly not claimed here.
