# SoccerSense frontend — Milestone 2 (proposed)

The first responsive React/TypeScript/Vite UI uses entirely **fictional sample data**. No live results, authentication, backend, or paid resource has been enabled.

## Getting started
Requires a compatible current Node.js LTS (Node 22 recommended) and npm.
```bash
cd frontend
npm install
npm run dev
```
Open the localhost URL shown by Vite.

## Validation
```bash
npm run typecheck
npm run test
npm run build
```
These commands are supplied but have **not yet been run in an authenticated build environment**. A `package-lock.json` must be generated with `npm install` and committed before Issue #2 can be considered done. Add lint/CI afterward under Issue #4.

## Features
- Match cards, competition filter, previous/next date controls, detail route
- Standings and About placeholder routes
- Visible sample-data banner and no false live data claims
- Dark mobile-first visual design

See root `docs/` for requirements, security and zero-cost policy.
