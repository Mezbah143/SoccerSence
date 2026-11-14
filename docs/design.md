# UI and UX specification

Proposed visual direction: dark charcoal base, vibrant pitch-green accent, clean typography, strong data hierarchy. Do not use copyrighted league/team logos until licensing is verified. Build a distinctive SoccerSense identity, not a clone of third-party UI.

## Screens
1. Home: featured match list, date selector, competition filters, delayed-data indicator.
2. Competitions: standings and competition navigation.
3. Match detail: score/status, kickoff, available event/summary statistics.
4. Later: team and player details; sign-in/favorites.

## Responsive behavior
320–767px: bottom or compact nav, stacked match rows; 768px+: sidebar/top navigation and larger content grid. Large tap targets, proper focus rings, meaningful alt text, accessible tables and no color-only signals.

## Design states
Skeleton, empty, API error, quota exhausted, stale, and sample data each have unique visible labels. Data timestamps are readable and always tied to their source. Team identity text works without image/logo assets.

## Design tokens (proposed; confirm through contrast testing)
Background #101418, surface #1B2228, foreground #F5F7F8, secondary #BAC3C9, accent #75E69C, danger #FF7B7B. Contrast must be tested before release.
