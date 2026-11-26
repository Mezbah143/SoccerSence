# M16 — Source-bound club comparisons

Stacked on M15, based exclusively on one **verified normalized standings table** already retrieved through the local private gateway.

A club profile can select any other team in the same stage/group table and compare: official position, played, official points, goals scored/conceded, goal difference, per-match goal rates and win percentage.

- No network calls, new provider endpoints, historical lookups, paid plan, or automatic refresh.
- Official points—including deductions—are never reconstructed from wins.
- Unequal matches played are explained; no claimed predictive power.
- Rates for zero played are shown as **Not available** rather than a made-up zero.
- No unsupported xG, head-to-head, recent-five form, player ratings, lineups, odds, or match outcome predictions.
- Tournament standings with multiple groups compare only the group/stage of the selected club.

## Human QA
Load a verified domestic table and a supported tournament stage if available. Select a club, change comparison opponent, confirm exact positions/points versus the source, test zero-played tables, keyboard/select controls, mobile horizontal scroll. Validate no new API requests are made by selecting opponents. Run lint, typecheck, tests, build, public audit and server compilation. Live data stays local only, and the fictional static preview remains fictional.
