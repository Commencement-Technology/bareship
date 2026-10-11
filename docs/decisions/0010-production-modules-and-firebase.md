# 0010. Production modules and the Firebase suite

- Status: Accepted
- Date: 2026-10-10
- Questions: E1–E7

## Context

Production apps (Bluesky, Expensify) ship observability, remote config, push, force-update and offline UI. Templates almost never do.

## Decision

**Built-in modules (E1):** email/password auth with refresh, deep and universal links, crash reporting, analytics, feature flags and remote config, force-update and maintenance screens, onboarding, push notifications, network banner and offline UI, OTA updates (port only).

**Vendors (E2–E7): one Firebase suite**, all `@react-native-firebase/*` 26.x:

| Port | Adapter |
| --- | --- |
| Crash | Crashlytics (E2) |
| Analytics | Firebase Analytics (E3) |
| Flags / remote config | Firebase Remote Config (E4) |
| Push | Firebase Cloud Messaging, with `react-native-notify-kit` to display foreground and rich notifications on Android (E6) |
| SecureStore | `react-native-keychain` (E7) |
| Updates | none: the `Updates` port ships with a no-op adapter (E5, clarified 2026-10-10) |

**Firebase is optional at build time.** The template must build and run before anyone has a Firebase project:

- Android applies the Google Services and Crashlytics Gradle plugins only when `android/app/src/<flavor>/google-services.json` exists.
- iOS copies `ios/Config/Firebase/<Env>/GoogleService-Info.plist` in a build phase only when it exists.
- At runtime, each Firebase adapter falls back to a console or no-op adapter when Firebase isn't configured.

**Not built in; become recipes:** Apple and Google sign-in, biometric unlock, standalone local notifications, in-app review, in-app purchases, SSL pinning, jailbreak/root detection, screenshot blocking.

## Consequences

- One vendor SDK family instead of three. It's free, but JS crash grouping is weaker than Sentry's. Source maps for Hermes must be uploaded in CI so Crashlytics can symbolicate JS stacks.
- Firebase on iOS needs static frameworks (`use_frameworks! :linkage => :static` or `$RNFirebaseAsStaticFramework`). This is verified in the Phase 0 native build check (`docs/version-matrix.md`).
- With no OTA provider, every fix ships through the stores until a provider recipe (hot-updater, Revopush) is applied.
- Firebase stops publishing new iOS SDK versions to CocoaPods after October 2026 (found 2026-10-11 during `pod install`). React Native Firebase still recommends CocoaPods with static frameworks, because its SPM mode needs dynamic frameworks that each embed a private Firebase copy. The template pins RNFB 26.4.0 / Firebase 12.18.0, which stay installable; move with React Native Firebase when it changes its iOS distribution.

## Alternatives considered

- Sentry + PostHog (the recommendation): richer JS error and analytics tooling, but two more vendors.
