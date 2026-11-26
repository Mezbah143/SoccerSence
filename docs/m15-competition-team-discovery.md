# M15 — Competition & team discovery

Built on M14. No additional provider requests or entitlements.

- Standings search filters only the **already-loaded, verified table** by official club name.
- Competition summary reflects official stage/group and provider row positions; does not infer a champion or full season ranking.
- A link back to Matches preselects that competition, without new fetching beyond existing explicit/automatic app behavior.
- Club profiles link to nearby table positions from the **same verified standings response** through revalidated route state, preserving exact team IDs and competition.
- Knockout and national-team tournaments show real stage/group rows when supplied; empty standings stay empty rather than invented.
- Mobile/keyboard CSS added for search, stage summary and nearby club links.

## Manual acceptance
Test league and World Cup/Euro/Champions League standings, filter text case-insensitively, open a club, use a nearby club link, and return. Compare official table position and points. Verify no extra provider requests from filtering or club-to-club navigation, and inspect 320px/390px/1440px and keyboard focus. CI must pass; production remains fictional; provider credentials and quotas unchanged.
