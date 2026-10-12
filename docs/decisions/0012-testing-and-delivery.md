# 0012. Testing, CI and delivery

- Status: Accepted
- Date: 2026-10-10
- Questions: F1–F7

## Decision

- **Unit and integration:** Jest with `@react-native/jest-preset`, React Native Testing Library, and MSW 3 handlers shared with the dev mock server.
- **Coverage (F2):** 80% gate on `src/shared/` and `src/data/`. No gate elsewhere.
- **Performance (F3):** Reassure render baselines on key screens, and startup-time measurement (time to first screen and to interactive) logged in release builds. **No bundle-size budget** (differs from the recommendation).
- **E2E (F1):** Maestro flows in `.maestro/`, run on an Android emulator in CI and on iOS on a nightly schedule.
- **Component docs (F4):** a built-in showroom screen in dev builds.
- **CI (F5):** GitHub Actions. PRs run lint, types, tests and dependency-cruiser. Labelled PRs and `main` also build Android and iOS.
- **Release (F6):** Fastlane (`match` for iOS signing; lanes for build, version bump and upload).
- **Beta distribution (F7):** TestFlight and the Google Play internal testing track.

## Status of the decision (2026-10-12)

- Release (F6): built. `fastlane/Fastfile` has `bump`, `android build|beta`, `ios build|certs|beta`; see
  docs/releasing.md. Checked 2026-10-12: `bump` on both platforms, the missing-credential messages, and a
  dry run of the build lanes' Gradle tasks and Xcode schemes. A full release build through fastlane and the
  uploads haven't run yet (no store accounts).
- Performance (F3) and E2E (F1): postponed by the maintainer; Reassure, startup metrics and Maestro come
  after Phase 4.

## Consequences

- Fastlane needs Ruby and Bundler on CI, as CocoaPods already does.
- iOS CI builds run on macOS runners, which cost more. They are triggered by label or on `main` only.
