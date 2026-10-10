# 0004. Environments and configuration

- Status: Accepted
- Date: 2026-10-10
- Questions: B4, B5

## Context

Most templates bake one `.env` into the JS bundle. Real apps need dev, staging and prod builds installed side by side, each with its own bundle id, name, icon, backend and Firebase project.

## Decision

- **Three environments (B4): dev, staging, prod.**
- **Android:** a `environment` flavor dimension with `dev`, `staging`, `prod`. dev and staging use `applicationIdSuffix` (`.dev`, `.staging`), and each flavor sets its own `app_name` and icon in `src/<flavor>/res`.
- **iOS:** one target with configurations `Debug-Dev`, `Release-Dev`, `Debug-Staging`, `Release-Staging`, `Debug-Prod` and `Release-Prod`, each backed by `ios/Config/<Env>.xcconfig` (bundle id suffix, display name, app icon set). One shared scheme per environment.
- **Config (B5):** `react-native-config` reads `.env.dev`, `.env.staging` and `.env.prod` on both the native and JS sides. In JS, `src/shared/config/env.ts` is the only file that reads it, and it parses the values with Zod so a missing or malformed value fails at startup with a clear message.
- `.env.*` files hold public configuration only. Secrets never go in the app.

## Consequences

- iOS configuration names must be passed to `run-ios` (`--mode Debug-Dev`). The `package.json` scripts hide this.
- Adding an environment touches Gradle, xcconfig, the scheme list and `.env.*`. `docs/environments.md` lists the steps.

## Alternatives considered

- JS-only env file: cannot change bundle ids, names or Firebase projects per environment.
