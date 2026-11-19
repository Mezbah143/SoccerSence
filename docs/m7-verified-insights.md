# M7 — Verified match insights, first milestone

SoccerSense uses existing validated local data only. No extra API calls, remote services, credentials, expenses, polling, prediction models, or public rights assumptions.

## Data audit and scope

The existing local fixtures response has match identifiers, home/away names, scheduled kickoff, status, and optional full-time home/away scores. It covers a **single selected calendar day** and **one competition**. It does not supply season-wide form, reliable home/away team IDs, head-to-head history, player ratings, xG, shots or possession.

Existing normalized standings have verified club IDs and season-to-date aggregate matches played, W/D/L, goals, official points and goal difference. Standings DO NOT tell us the order of recent matches or last-five results.

Therefore M7 intentionally provides only:
- On the verified match-detail page: number of fixtures returned for that specific selected day, number of FINISHED fixtures with both final scores, count with no complete final result, goals scored in verified finished matches, home-win/draw/away-win counts and goals-per-finished-match average.
- On a verified club profile: season-to-date W/D/L percentages, goals scored per played game and goals conceded per played game, clearly labeled as table-derived aggregates, not last-five match form.
- Zero played/finished matches: percent or average is **unavailable**, not 0, fake form or inferred outcome.
- Provider attribution, fetched-at timestamp and delayed label remain on the parent verified views.

## Data correctness

A result contributes to the score and result counts **only if status FINISHED and both scores are nonnegative validated integers**. Partial scores, in-progress games, awarded games and scheduled fixtures never contribute. Count of all other records is explicitly labeled "Other / no final score" rather than asserting every such game is scheduled.

Standing percentages are denominated by the official number of matches played. Official negative points and deductions are preserved; points are never recomputed from wins. No team identity is guessed from match names.

## Verification

1. Start the existing private gateway and Vite locally. Load a date with at least one match; opening its detail page shows a *Match-day snapshot*.
2. Check numbers against only the manually loaded fixtures for that same KST day and competition; Previous/Next reuses the same day snapshot, with no new requests.
3. If all matches are scheduled, the average and result distribution should be **not calculated**.
4. From Leagues -> Standings, click a club. Season-to-date performance appears using existing table data; all rates show unavailable if played is zero.
5. Check mobile 320px/390px, desktop, keyboard focus and no overflow or inaccurate live labels.
6. GitHub Actions must pass lint/typecheck/unit tests/production build/local gateway build/secret guard with fictional test data and without any API key.

## Deferred M7 stages

Recent form (last 5), verified head-to-head, or team-to-team comparisons require approved historical match data and reliable team IDs. Confirm Free-plan entitlement and provider redistribution rights before introducing additional calls; for now these remain explicitly unavailable.

**$0 target. Real data private/local and delayed only; public builds remain fictional.**
