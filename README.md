# rn-template (bare)

A production-ready **bare React Native 0.87** template. It keeps the best ideas from Ignite, Obytes,
TheCodingMachine and the large open-source React Native apps, and fixes what each one leaves out.
This is Track A; an Expo (CNG) version that shares the same `src/` follows.

> Status: **Phase 1 (foundation) complete.** Environments, tooling, CI and the rename script are in place.
> The app layer (navigation, data, UI system, auth) arrives in Phase 2. See [Roadmap](#roadmap).

## Quick start

Requirements: Node ≥ 22.11 (`.nvmrc`), pnpm ≥ 11, Ruby + Bundler, Xcode 27, Android Studio with SDK 37 and NDK 27.1.

```bash
pnpm install
bundle install
pnpm bootstrap --name Acme --bundle-id com.acme.app --display-name "Acme"
pnpm android          # or: pnpm ios
```

`bootstrap` renames the Xcode project, targets and schemes, the Android package, bundle ids and display names
in one step, then runs `pod install`. Run it once on a fresh copy.

## What you get

- **Three environments**: dev, staging and prod, installed side by side with their own app id, name, icon badge
  and `.env` file. Android product flavors; iOS build configurations, xcconfig files and schemes.
  See [docs/environments.md](docs/environments.md).
- **Validated config**: `src/shared/config/env.ts` parses `.env.*` with Zod and names any missing key at launch.
- **Enforced architecture**: `app → features → entities → data → shared`, checked by ESLint
  (`eslint-plugin-boundaries`) in your editor and by `dependency-cruiser` in CI.
- **Strict TypeScript 6**, React Compiler on, `@/` imports.
- **Supply-chain policy**: pnpm refuses packages younger than 3 days, denies install scripts unless
  allowlisted, and fails on trust downgrades. Renovate keeps dependencies current in groups.
- **Native splash** (react-native-bootsplash) and **icon generation** for every environment from one SVG.
- **Release-ready Android**: R8 and resource shrinking on, signing from properties or CI secrets, a 16 KB
  page-alignment check.
- **CI** (GitHub Actions): types, lint, format, boundaries and tests on every PR; Android and iOS builds on
  `main` or PRs labelled `native`.
- **Docs for people and agents**: [AGENTS.md](AGENTS.md), [ADRs](docs/decisions/README.md),
  [native change log](docs/native-changes.md).

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm android`, `pnpm android:staging`, `pnpm android:prod` | Run a debug build of that environment |
| `pnpm ios`, `pnpm ios:staging`, `pnpm ios:prod` | Same on iOS |
| `pnpm pods` | `pod install` through Bundler |
| `pnpm build:android:prod` | Release App Bundle for Play |
| `pnpm check` | Typecheck, lint, format check, boundaries, tests |
| `pnpm icons` | Regenerate app icons from `assets/brand/icon.svg` |
| `pnpm splash` | Regenerate the splash screen from `assets/brand/logo.svg` |
| `pnpm bootstrap` | Rename the app (see above) |

## Release signing (Android)

Put these in `~/.gradle/gradle.properties` locally, or in CI secrets:

```properties
RN_UPLOAD_STORE_FILE=/absolute/path/to/upload.keystore
RN_UPLOAD_STORE_PASSWORD=…
RN_UPLOAD_KEY_ALIAS=…
RN_UPLOAD_KEY_PASSWORD=…
```

Without them, release builds are signed with the debug key and the build prints a warning.

## Roadmap

| Phase | Scope | Status |
| --- | --- | --- |
| 0 | Decisions (ADRs), version matrix, library build check | Done |
| 1 | Foundation: tooling, environments, splash, icons, rename, CI | Done |
| 2 | Core: ports and adapters, API client (axios), TanStack Query + MMKV, React Navigation 7, Unistyles design system, i18n, forms, example features with MSW mocks | Next |
| 3 | Production: offline queue and UI, Firebase (Crashlytics, Analytics, Remote Config, FCM), force update, deep links, OTA port | |
| 4 | Quality: Maestro, Reassure, startup metrics, generators, Fastlane lanes | |
| 5 | Package: GitHub template + npm `--template`, example stripping, then Track B (Expo) | |

## License

MIT
