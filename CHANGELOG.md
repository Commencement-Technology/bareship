# Changelog

Notable changes to the template. Versions follow [Semantic Versioning](https://semver.org) once the template
is published; until then everything is under Unreleased.

## Unreleased

### Phase 5: packaging

- `pnpm strip-examples` removes the demo (feed, posts mocks, showroom) and leaves a blank Home tab;
  `scripts/ci/check-strip-examples.sh` checks the stripped app.
- npm template for the React Native CLI (`pnpm pack-template`), checked end to end by
  `scripts/ci/check-template-init.sh`.
- `pnpm bootstrap` checks for the Ruby gems before renaming anything.
- MIT license, contributing and security guides, issue templates.
- The tab navigator's route is `Main` (was `Home`), so an app's own Home tab doesn't clash with it.

### Phase 4: quality tooling

- Lint sweep: no barrel files, React Compiler lint rules, ARIA accessibility props.
- `pnpm gen feature|screen|endpoint` and the `add-feature`, `add-screen`, `add-endpoint` agent skills.
- fastlane lanes for version bumps, release builds, match signing, TestFlight and Play uploads.
- Postponed: Maestro end-to-end tests, Reassure, startup metrics, bundle report.

### Phase 3: production

- Offline write queue (patterns A–D), offline banner and "waiting to sync" states.
- Optional Firebase: Crashlytics, Analytics, Remote Config, FCM push with local notifications.
- Deep links and universal / App Links, force update and maintenance mode, demo APK.

### Phases 0–2: foundation and app layer

- Decisions (ADRs), three environments, splash, icons, `pnpm bootstrap`, CI.
- API client with Zod, TanStack Query persisted to MMKV, React Navigation static API, Unistyles design
  system, English and Arabic (RTL), forms, auth, feed and settings, MSW mock backend.
