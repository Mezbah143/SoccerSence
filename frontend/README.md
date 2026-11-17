# SoccerSense frontend and local data gateway

The React/TypeScript/Vite UI uses **fictional sample data**. Match cards, filters, date controls, details, and a standings placeholder exist. No real feed or public deployment is enabled; an earlier illustrative image is not an implementation screenshot.

## Getting started

Use Node 22.12+ or Node 24 and npm:

```sh
cd frontend
npm ci
npm run dev
```

Open Vite's localhost URL. `package-lock.json` pins the dependency tree; use `npm ci` for repeatable installation. Change dependencies intentionally with `npm install`, reviewing the manifest and lockfile together.

## Validation

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run build:server
```

Tests use invented data and a local HTTP server; no API key or external provider connection is required. CI runs the same gates on Node 22.

## Optional local backend

`npm run serve:data` starts a gateway on `127.0.0.1:8787`. It returns `provider_disabled` by default and is not wired to the browser. See [local gateway setup, rights gates, request limits and remaining work](../docs/m3-local-gateway.md). Never put provider credentials in Vite variables. Do not deploy or expose this local-only server publicly.
