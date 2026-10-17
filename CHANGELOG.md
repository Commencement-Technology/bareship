# Changelog

Notable changes to the template. Versions follow [Semantic Versioning](https://semver.org). Apps made from
the template own their copy of the code, so a new version reaches an app only when its authors apply the
changes.

## Unreleased

- Hindi replaces Arabic as the second language ([ADR 0017](docs/decisions/0017-languages-hindi-and-opt-in-rtl.md)).
  Right-to-left stays supported as `rtl: true` on a language in `LANGUAGES`; tests cover the direction
  switch and mirrored icons without shipping an RTL language.
- Lint rejects `left`/`right` style keys and `textAlign: 'left' | 'right'`; use `start`/`end`.
- `pnpm gen` and `pnpm strip-examples` work on every locale file, so adding a language needs no script
  changes.
- Fix: dates and relative times ("2 days ago") stayed in the old language after a switch in Settings,
  because the React Compiler cached the formatted text. Components now use `useFormat()` from
  `@/shared/lib/format`, and lint rejects plain `formatRelative`/`formatDate`/`formatNumber` calls in JSX.
- README and website: the screenshots show the feed in Hindi instead of Arabic.

## 0.1.2 (2026-10-17)

Screenshots on the npm page. No changes to the app's code.

- README and website: screenshots of the demo app on iOS and Android (feed, offline with a like waiting to
  sync, dark theme, Arabic right to left, settings, sign-in). The website shows them in iOS and Android tabs.
- The npm package leaves out the screenshots (`assets/screenshots/`), so apps made from it don't carry them.

## 0.1.1 (2026-10-17)

Fixes `pnpm bootstrap` for apps made with `init`, following the quick start.

- Docs and website: the React Native CLI (npm package `bareship`) is the first way to create an app; an
  npm link in the site header; FAQ answers on versions and updates.
- Fix `pnpm bootstrap` on an app made with `init`: a bundle id that extends the package `init` set
  (`com.acme` → `com.acme.app`, as in the quick start) crashed while moving the Android package folder,
  after the files were already rewritten. A second run then said "Nothing to rename" and skipped
  `pod install`, so the iOS build failed. Bootstrap now moves the folder through a temporary one, and
  still sets up the iOS configs and pods when there is nothing to rename.
- `pnpm bootstrap --name` is optional and defaults to the app's current name, since `init` already sets it.
  The quick start is now `pnpm bootstrap --bundle-id com.acme.app --display-name "Acme"`; a copy of the
  GitHub repository still passes `--name`. `scripts/ci/check-template-init.sh` runs that exact case.

## 0.1.0 (2026-10-14)

The first release, on npm as `bareship`
(`npx @react-native-community/cli@20.2.0 init Acme --template bareship --skip-install --install-pods false`)
and as a GitHub template repository. It collects everything below.

### App README and code of conduct

- Apps made with `init` get their own README (`scripts/app-readme.md`): how to run, customise and release
  the app, with no links to the template's own files. `scripts/ci/check-template-init.sh` checks it and the
  links in the app's docs.
- README: a new header with the logo, a tagline and quick links, and a direct **Use this template** link.
- `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1).

### Public, with a website

- The repository is public and a GitHub template repository.
- Website and docs live at https://bareship.praveensingh.co.in with a sitemap and `robots.txt`
  ([ADR 0016](docs/decisions/0016-website-on-a-subdomain.md)). Vercel deploys it on every push to `main`.
- The website builds without the app's packages installed (Vercel), and the Offline and AI agents pages
  are now committed (the root `.gitignore` hid them).

### Renamed to Bareship

- The template is now **Bareship** (was `rn-template`): npm package `bareship`, repository
  `psingh2907/bareship`, code markers `[bareship]` ([ADR 0015](docs/decisions/0015-name-bareship.md)).
- The app inside the template is renamed with `pnpm bootstrap`: bundle id `com.bareshipapp`, URL scheme
  `bareshipapp://`. Apps made with `init` get their own names, as before.
- Docs: run `pnpm pods` again after a `pnpm install` that changes `node_modules` (Skia's iOS binaries).

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
