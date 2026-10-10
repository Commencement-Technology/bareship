# 0002. Native baseline: RN 0.87, pure bare

- Status: Accepted
- Date: 2026-10-10
- Questions: B1, B2, B6–B9

## Context

React Native 0.87.1 is the latest stable release (26 Aug 2026). It makes the strict TypeScript API the default and requires Node 22.11+, Gradle 9 / AGP 9 and Kotlin 2.2. Expo modules can run in a bare app, but `install-expo-modules` currently targets RN 0.86 (Expo SDK 57).

## Decision

- **RN 0.87.1 (B1), React 19.2.3**, started from `react-native-community/template` 0.87-stable so native diffs match the Upgrade Helper.
- **No Expo modules (B2).** Community libraries only, which keeps Track A genuinely bare and different from Track B.
- **Minimum OS (B6):** the RN 0.87 template defaults (Android minSdk 24, RN's iOS minimum). Android compile SDK 37, target SDK 36.
- **Devices (B7):** phones and tablets, with responsive layout tokens and portrait as the default orientation.
- **Build CLI (B8):** `@react-native-community/cli` 20.2.0. Rock's remote build cache is documented as an upgrade.
- **iOS dependencies (B9):** CocoaPods through Bundler (`Gemfile`). SwiftPM stays off while experimental.

## Consequences

- No expo-image, expo-secure-store or expo-updates. Their bare equivalents sit behind ports (ADR 0008, 0010).
- Deep imports from `react-native/Libraries/*` fail type-checking. Lint bans them.
- Building with Xcode 27 (iOS 27 SDK) requires the UIScene life cycle. The 0.87 template doesn't have it, so this template backports RN's upcoming SceneDelegate (docs/native-changes.md#uiscene).
- Every native library must build on AGP 9 and Xcode 27. The library compatibility check in `docs/version-matrix.md` is required before adding one.

## Alternatives considered

- RN 0.86.3 with Expo modules: better image, secure-store and OTA libraries, but ties the RN version to the Expo SDK cadence.
