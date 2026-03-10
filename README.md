# Dota Scope (Android-first)

React + TypeScript + Capacitor app for Dota 2 analytics with OpenDota integration and local dev adapters.

## Run (dev)

1. Install dependencies:

```bash
npm i
```

2. Create env file:

```bash
cp .env.example .env
```

3. Put your OpenDota key into `.env` (`VITE_OPENDOTA_API_KEY`).

4. Start dev server:

```bash
npm run dev
```

## Architecture (dev/prod split)

- `src/app/core/authService.ts`: local auth (register/login/forgot/reset/refresh abstraction)
- `src/app/core/dataSyncService.ts`: sync orchestration + rule-based build recommendations
- `src/app/core/opendotaClient.ts`: typed OpenDota client with retry/backoff
- `src/app/core/steam.ts`: Steam profile URL binding (`/id/...` and `/profiles/...`)
- `src/app/core/staticsService.ts`: OpenDota constants loader/cache
- `src/app/data/runtimeData.ts`: local persistence + runtime snapshot adapter for existing UI
- `src/app/context/AppContext.tsx`: app-level state management and feature orchestration

## Capacitor / Android

Capacitor config is defined in `capacitor.config.ts` with app id/name for `Dota Scope`.

Typical flow to build APK:

```bash
npm run build
npx cap sync android
npx cap open android
```

