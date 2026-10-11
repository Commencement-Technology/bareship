# rn-template (bare)

![React Native 0.87](https://img.shields.io/badge/React_Native-0.87-61dafb)
![New Architecture](https://img.shields.io/badge/New_Architecture-only-2ea44f)
![TypeScript 6](https://img.shields.io/badge/TypeScript-6_strict-3178c6)
![iOS and Android](https://img.shields.io/badge/platforms-iOS_%7C_Android-lightgrey)

A production-ready **bare React Native CLI** template. It takes the best ideas from Ignite, Obytes,
TheCodingMachine and large open-source apps (Bluesky, Expensify), and adds what they leave out: an offline
write queue, Keychain token storage, enforced architecture, optional Firebase and a supply-chain policy.

**It runs with no accounts.** No backend, Firebase project or Apple Developer team is needed to build it,
run it, or install it on a phone: the dev build serves sample data from a mock backend inside the app. You
add each service when you need it ([going live](docs/going-live.md)).

> **Status:** Phases 0–3 are done (foundation, app layer, offline and production services). Phase 4
> (quality tooling) is next. See the [roadmap](#roadmap) and [known limitations](#known-limitations).

## Why this template

- **Bare, nothing hidden.** You own `ios/` and `android/`. Every native edit is marked in the code and
  logged with its Expo equivalent, so an Expo (CNG) version can share the same `src/` later.
- **Offline is designed in.** Each write picks one of four offline patterns. Queued writes survive a
  restart and replay in order, each with its own idempotency key.
- **The architecture is checked, not just described.** Layers import downward only, and ESLint and
  dependency-cruiser fail the build otherwise.
- **Production services that degrade gracefully.** Crashlytics, Analytics, Remote Config and push switch on
  when you add a Firebase file, and fall back to logging without one.
- **Built for AI agents too.** `AGENTS.md`, ADRs and Callstack's React Native agent skills give Claude
  Code, Copilot and other agents the same rules as your team.

### Compared with other templates

From each template's code as of 10 October 2026 ([research](docs/research.md)). They change, so check
before relying on a row.

| | Ignite | Obytes | TheCodingMachine | This template |
| --- | --- | --- | --- | --- |
| Bare CLI (no Expo prebuild) | – | – | ✓ | ✓ |
| Server-cache library (TanStack Query) | – | ✓ | ✓ | ✓ |
| Tokens in Keychain / Keystore | – | – | – | ✓ |
| Persisted offline write queue | – | – | – | ✓ |
| Crash reporting and feature flags | – | – | – | ✓ (optional) |
| Supply-chain install policy | – | – | – | ✓ |

## Quick start

Requirements:

- Node ≥ 22.11 (`.nvmrc` pins 24)
- pnpm 12 (`corepack enable` picks up the pinned version)
- Ruby with Bundler, Java 21
- iOS: macOS with Xcode 27
- Android: Android Studio with SDK 37 and NDK 27.1

```bash
pnpm install
bundle install
pnpm bootstrap --name Acme --bundle-id com.acme.app --display-name "Acme"
pnpm android          # or: pnpm ios
```

`bootstrap` renames the Xcode project, schemes, Android package, bundle ids, display names and URL schemes
in one step, then runs `pod install`. Run it once on a fresh copy. To try the template without renaming,
run `pnpm pods` instead.

Sign in with **`demo@example.com` / `password123`**. To try it on an Android phone without a computer
attached, build the [demo APK](docs/demo-build.md).

## What's inside

**App**

- Sign-in, registration, forgot password and onboarding, gated in the navigator.
- A feed with cursor pagination, pull to refresh, skeletons and optimistic likes, plus a post screen.
- Settings: theme (light, dark, system), language, notifications, sign-out and account deletion.
- Design system on Unistyles 3: tokens, light and dark themes, and about 15 accessible primitives (Button,
  Input, Sheet, Toast, ListItem…), with a component showroom in dev builds.
- English and Arabic with right-to-left layout, typed keys, and a lint rule against hard-coded text.
- React Navigation 7 (static API, native stack, tabs) and FlashList.

**Data and offline**

- An axios client with Zod-parsed responses, single-flight token refresh, retry with backoff and a circuit
  breaker.
- TanStack Query 5 with the cache persisted to MMKV, so a cold start shows the last data at once.
- An offline write queue (patterns A–D), an offline banner, and "waiting to sync" states.
- Tokens in the Keychain / Keystore. Zustand only for small client state.
- An MSW mock backend that powers dev builds, tests and the demo APK. A CI check keeps it out of release
  bundles.

**Production**

- Three environments (dev, staging, prod) installed side by side, each with its own app id, name, icon
  badge, URL scheme and `.env` file. Config is validated at launch ([environments](docs/environments.md)).
- Firebase (optional): Crashlytics, Analytics, Remote Config and FCM push, with local notifications through
  react-native-notify-kit.
- Deep links, plus `https://` links once you add a domain. `pnpm links:files` writes the files your website
  serves. A link that arrives while signed out opens after sign-in.
- Force update and maintenance mode from Remote Config.
- Native splash, icon generation from one SVG, and release-ready Android (R8, signing from properties or CI
  secrets, a 16 KB page-alignment check).

**Quality**

- Strict TypeScript 6, React Compiler on, ESLint 9 flat config, Prettier, Conventional Commits.
- Jest and React Native Testing Library, with an 80% coverage gate on `shared/` and `data/`.
- pnpm refuses packages younger than 3 days and install scripts unless allowlisted. Renovate groups
  updates.
- GitHub Actions: types, lint, format, boundaries and tests on every PR. Android and iOS builds run on
  `main` and on PRs labelled `native`.

**For AI agents**

- [AGENTS.md](AGENTS.md) holds the commands, rules and conventions. `CLAUDE.md` and
  `.github/copilot-instructions.md` point to it.
- [Callstack's agent skills](https://github.com/callstackincubator/agent-skills) are vendored in
  `.claude/skills/` and pinned to a commit. Update them with `pnpm skills:sync`.

## Project structure

```
src/
  app/        composition: providers, navigation, boot sequence
  features/   auth, feed, settings, onboarding, app-status, showroom
  entities/   models shared by features: user, session, push, app-status
  data/       query client, persisted cache, offline queue
  shared/     ui, api, ports and adapters, i18n, config, lib (no business logic)
  mocks/      MSW mock backend (dev builds, tests, demo APK)
```

Imports go downward only: `app → features → entities → data → shared`, and features never import each
other. Native and vendor libraries sit behind ports in `shared/ports`, so swapping a vendor changes one
adapter. See [architecture](docs/architecture.md).

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm android`, `pnpm android:staging`, `pnpm android:prod` | Run a debug build of that environment |
| `pnpm ios`, `pnpm ios:staging`, `pnpm ios:prod` | Same on iOS |
| `pnpm pods` | `pod install` through Bundler |
| `pnpm build:android:dev`, `pnpm build:android:staging` | Release APK of that environment |
| `pnpm build:android:prod` | Release App Bundle for Play |
| `pnpm build:android:demo` | Release APK with sample data, for trying the app on a phone ([guide](docs/demo-build.md)) |
| `pnpm check` | Typecheck, lint, format check, boundaries, tests |
| `pnpm bootstrap` | Rename the app (see [quick start](#quick-start)) |
| `pnpm icons` | Regenerate app icons from `assets/brand/icon.svg` |
| `pnpm splash` | Regenerate the splash screen from `assets/brand/logo.svg` |
| `pnpm links:files` | Files your website serves so its links open the app ([going live](docs/going-live.md)) |
| `pnpm skills:sync` | Update the vendored agent skills to another upstream commit |

## Going to production

[docs/going-live.md](docs/going-live.md) lists what to add before release and what each step switches on:
your API, release signing, Firebase, iOS push, a link domain and the Remote Config keys. Each step is
independent; the rest of the app keeps working without it.

## Documentation

| Doc | What it covers |
| --- | --- |
| [AGENTS.md](AGENTS.md) | Rules and conventions for contributors and AI agents |
| [Architecture](docs/architecture.md) | Layers, data flow, session, ports and adapters, boot |
| [Environments](docs/environments.md) | dev, staging and prod: ids, `.env` files, flavors and schemes |
| [Going live](docs/going-live.md) | API, signing, Firebase, push, links, force update |
| [Demo build](docs/demo-build.md) | Installing the sample-data APK on an Android phone |
| [Decisions (ADRs)](docs/decisions/README.md) | Why each library and pattern was chosen |
| [Native changes](docs/native-changes.md) | Every edit to `ios/` and `android/`, with its Expo equivalent |
| [Version matrix](docs/version-matrix.md) | Toolchain and library versions, and what was checked |
| [Best-practices audit](docs/best-practices-audit.md) | Audit against the agent skills, and open items |
| [Research](docs/research.md) | The templates and apps studied, and what was taken from each |

## Known limitations

- **No end-to-end tests or release automation yet.** Maestro, Reassure and Fastlane arrive in Phase 4.
- **Over-the-air updates have a port but no adapter.** Pick a provider (for example hot-updater) and add
  one.
- **The demo build is Android-only.** iOS needs a signed build, so use the simulator.
- **Firebase is tested without real projects.** The fallbacks are tested on devices; Crashlytics on iOS
  hasn't run against a real Firebase config yet.
- **Firebase stops publishing new iOS SDKs to CocoaPods after October 2026.** The pinned versions stay
  installable; the iOS setup moves when React Native Firebase changes how it ships
  ([ADR 0010](docs/decisions/0010-production-modules-and-firebase.md)).

## Roadmap

| Phase | Scope | Status |
| --- | --- | --- |
| 0 | Decisions (ADRs), version matrix, library build check | Done |
| 1 | Foundation: tooling, environments, splash, icons, rename, CI | Done |
| 2 | App layer: API client, TanStack Query + MMKV, navigation, design system, i18n, forms, auth, feed, mocks | Done |
| 3 | Production: offline queue and UI, Firebase, push, force update, deep links, OTA port | Done |
| 4 | Quality: Maestro, Reassure, startup metrics, bundle report, generators, Fastlane | Next |
| 5 | Packaging: GitHub template and `--template`, example stripping | |
| Track B | Expo (CNG) version sharing the same `src/` | After Track A |

## Contributing

Read [AGENTS.md](AGENTS.md) first. Run `pnpm check` before you open a PR, and use Conventional Commits
(`feat:`, `fix:`…); commitlint enforces them. Propose a new ADR rather than changing a recorded decision.

## License

Not chosen yet. A license file is added before the template is made public.
