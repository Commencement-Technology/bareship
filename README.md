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

> **Status:** Phases 0–4 are done, and Phase 5 (packaging) is nearly done: demo stripping, the npm template
> and the license are ready. Still to come: the final name, then making the repository public and publishing
> to npm. Postponed: Maestro end-to-end tests, performance tooling, and the Android CI fix (CI stays paused).
> See the [roadmap](#roadmap) and [known limitations](#known-limitations).

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

## Quick start

Requirements:

- Node ≥ 22.11 (`.nvmrc` pins 24)
- pnpm 12 (`corepack enable` picks up the pinned version)
- Ruby 3.2.2 (`.ruby-version`) with Bundler, Java 21
- iOS: macOS with Xcode 27
- Android: Android Studio with SDK 37 and NDK 27.1

Start from your own copy of this repository (GitHub's **Use this template**, or a clone), then:

```bash
pnpm install
bundle install
pnpm bootstrap --name Acme --bundle-id com.acme.app --display-name "Acme"
pnpm android          # or: pnpm ios
```

Once the template is on npm, the React Native CLI can create the copy instead. Its `init` can't use pnpm,
so skip its install, and leave out `--package-name` (it breaks the per-environment iOS bundle ids; set the id
with `bootstrap`):

```bash
npx @react-native-community/cli@20.2.0 init Acme --template rn-template --skip-install --install-pods false
cd Acme
pnpm install
bundle install
pnpm bootstrap --name Acme --bundle-id com.acme.app --display-name "Acme"
```

Start the emulator (or plug in a phone) before `pnpm android`: debug builds compile native code only for the
connected device's CPU. With no device connected they build all four Android CPU types, which takes about
four times as long.

`bootstrap` renames the Xcode project, schemes, Android package, bundle ids, display names and URL schemes
in one step, then runs `pod install`. Run it once on a fresh copy. To try the template without renaming,
run `pnpm pods` instead.

Sign in with **`demo@example.com` / `password123`**. To try it on an Android phone without a computer
attached, build the [demo APK](docs/demo-build.md).

When you're ready to build your own app, run `pnpm strip-examples` once. It removes the demo feed and
component showroom and leaves a blank Home tab, with sign-in, onboarding and settings still working. Then
add your own features, screens and API calls with `pnpm gen` ([generators](docs/generators.md)).

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
- fastlane lanes for release builds, version bumps, match signing, TestFlight and Play internal testing.
  Building needs no account; the upload lanes say what to add ([releasing](docs/releasing.md)).

**Quality**

- Strict TypeScript 6, React Compiler on, ESLint 9 flat config, Prettier, Conventional Commits.
- Lint enforces the React Compiler rules, imports from the defining module (no barrel files) and ARIA
  accessibility props (`role`, `aria-label`) over the legacy `accessibility*` ones.
- Jest and React Native Testing Library, with an 80% coverage gate on `shared/` and `data/`.
- pnpm refuses packages younger than 3 days and install scripts unless allowlisted. Renovate groups
  updates.
- GitHub Actions: types, lint, format, boundaries and tests on every PR. Android and iOS builds are opt-in:
  label a PR `native`, run the workflow by hand, or set the repository variable `NATIVE_BUILDS=true` to build
  on every push to `main` ([ADR 0014](docs/decisions/0014-opt-in-native-ci.md)). Paused in this repository
  for now, see [known limitations](#known-limitations).

**For AI agents**

- [AGENTS.md](AGENTS.md) holds the commands, rules and conventions. `CLAUDE.md` and
  `.github/copilot-instructions.md` point to it.
- [Callstack's agent skills](https://github.com/callstackincubator/agent-skills) are vendored in
  `.claude/skills/` and pinned to a commit. Update them with `pnpm skills:sync`.
- The template's own skills, `add-feature`, `add-screen` and `add-endpoint`, run the generators and walk
  an agent through the rest: fields, offline pattern, strings, tests.
- Agents drive the app with agent-device and profile it with Argent
  ([ADR 0013](docs/decisions/0013-agent-device-tools.md)).

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
| `bundle exec fastlane bump version:1.2.0` | Set the version on both platforms and raise the build number |
| `bundle exec fastlane android build`, `… ios build` | Release builds; `beta` lanes upload ([releasing](docs/releasing.md)) |
| `pnpm check` | Typecheck, lint, format check, boundaries, tests |
| `pnpm bootstrap` | Rename the app (see [quick start](#quick-start)) |
| `pnpm pack-template` | Build the npm template package into `dist/npm/` ([packaging](docs/packaging.md)) |
| `pnpm strip-examples` | Remove the demo (feed, posts, showroom) and leave a blank Home tab; sign-in, onboarding and settings stay |
| `pnpm icons` | Regenerate app icons from `assets/brand/icon.svg` |
| `pnpm splash` | Regenerate the splash screen from `assets/brand/logo.svg` |
| `pnpm gen feature\|screen\|endpoint` | Scaffold a feature, screen or endpoint that follows the rules ([AGENTS.md](AGENTS.md)) |
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
| [Packaging](docs/packaging.md) | How the npm template and the GitHub template are built and checked (maintainers) |
| [Generators](docs/generators.md) | Add features, screens and API calls with `pnpm gen` |
| [Releasing](docs/releasing.md) | fastlane lanes: release builds, version bump, TestFlight and Play uploads |
| [Demo build](docs/demo-build.md) | Installing the sample-data APK on an Android phone |
| [Decisions (ADRs)](docs/decisions/README.md) | Why each library and pattern was chosen |
| [Native changes](docs/native-changes.md) | Every edit to `ios/` and `android/`, with its Expo equivalent |
| [Version matrix](docs/version-matrix.md) | Toolchain and library versions, and what was checked |
| [Best-practices audit](docs/best-practices-audit.md) | Audit against the agent skills, and open items |
| [Research](docs/research.md) | The templates and apps studied, and what was taken from each |

## Known limitations

- **No end-to-end or performance tests yet.** Maestro flows, Reassure render baselines, startup metrics
  and a bundle report are postponed until after Phase 4.
- **CI is paused while the template is being built.** The checks job passes. The fixes for the native jobs
  (a `.ruby-version` for iOS; swap, two Gradle workers and time limits for the Android builds, which ran
  out of memory on 8 GB runners) are in the workflow but haven't run yet. GitHub's macOS image has Xcode
  26.x, not 27, so the iOS job is unproven too. Run `pnpm check` locally.
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
| 4 | Quality: lint sweep, generators with agent skills, fastlane, `.ruby-version` for CI. Postponed: Maestro, performance tooling (Reassure, startup metrics, bundle report), Android CI memory fix | Done |
| 5 | Packaging: example stripping, npm `--template` package, MIT license and community files (done). Final name, GitHub template setting, going public and npm publish wait for the go-ahead | In progress |
| Track B | Expo (CNG) version sharing the same `src/` | After Track A |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). In short: read [AGENTS.md](AGENTS.md), run `pnpm check`, use
Conventional Commits, and propose a new ADR rather than changing a recorded decision. Report security issues
privately ([SECURITY.md](SECURITY.md)).

## License

[MIT](LICENSE) © 2026 Praveen Singh.
