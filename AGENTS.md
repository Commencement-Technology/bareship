# AGENTS.md

Guide for AI agents and new contributors. Read this before changing code.

## What this is

A bare React Native 0.87 template (Track A). Decisions and their reasons are in `docs/decisions/` (ADRs).
Never change a recorded decision silently: propose a new ADR.

## Commands

| Task | Command |
| --- | --- |
| Install | `pnpm install` (pnpm only; supply-chain policy in `pnpm-workspace.yaml`) |
| iOS pods | `pnpm pods` |
| Run | `pnpm android` / `pnpm ios` (dev); `:staging`, `:prod` variants |
| All checks | `pnpm check` (typecheck, lint, format, depcruise, tests) |
| Rename the app | `pnpm bootstrap --name Acme --bundle-id com.acme.app` |
| Icons / splash | `pnpm icons`, `pnpm splash` |

## Architecture rules

- `src/` layers, imports go downward only: `app → features → entities → data → shared` (ADR 0005).
- A feature never imports another feature. Move shared code down to `entities/` or `shared/`.
- Import with the `@/` alias. No deep relative imports, no `react-native/Libraries/*` imports.
- Configuration is read only in `src/shared/config/env.ts`. `.env.*` values are public; no secrets.
- Server data belongs to TanStack Query; Zustand holds only small client state (ADR 0006).
- Screens never call the HTTP client directly; they use feature hooks.
- Native or vendor libraries are used only through ports in `src/shared/ports` (from Phase 2).

ESLint (`eslint-plugin-boundaries`) and `dependency-cruiser` enforce the layer rules. Fix the import, never
disable the rule.

## Native changes

Any edit under `android/` or `ios/`: mark it with a `[rn-template]` comment and add a row to
`docs/native-changes.md` with its Expo equivalent.

## Adding a dependency

Check it builds with RN 0.87, the New Architecture, AGP 9 and Xcode 27, and record it in `docs/version-matrix.md`.
New versions younger than 3 days are refused by pnpm; don't bypass this without a reviewed exclude entry.

## Tests

Jest + React Native Testing Library 14 (`render` is async: `await render(...)`). Native modules are mocked in
`src/test/setup.ts`. Coverage gate: 80% on `src/shared/` and `src/data/`.

## Commits

Conventional Commits (`feat:`, `fix:`, `chore:` …), enforced by commitlint.
