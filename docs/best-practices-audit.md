# Best-practices audit

The code written before the agent skills were adopted (Phases 0–3 offline), checked against the vendored
skills in `.claude/skills/`. Fix pending items when you touch the area, and move them to "Done" with the
commit. Started 2026-10-10.

Measure before and after any performance change (the skill's own rule). Bundle sizes below are release JS
bundles: `pnpm exec react-native bundle --platform android --dev false --minify true …`.

## Done

| Item | Skill reference | Result |
| --- | --- | --- |
| zod's locale barrel shipped ~60 languages the app never shows | `bundle-barrel-exports`, `bundle-library-size` | Metro resolves it to `metro/zod-locales.js` (English only): −295 KB |
| FormatJS Intl polyfills needed `Intl.Locale` (~390 KB) | `native-sdks-over-polyfills` ("remove Intl polyfills only after checking Hermes coverage") | `intl-pluralrules` + `relative-time-format`: −333 KB. Checked in Hermes: Arabic plurals and relative times correct |
| **Total** | | Android bundle 4,176 KB → 3,548 KB (−15%) |

## Pending: lint-enforced (one sweep, then lint keeps them fixed)

Deferred on 2026-10-10 (do as one sweep later). Until then, follow these rules by hand in new code.

| Item | Skill reference | Notes |
| --- | --- | --- |
| Barrel `index.ts` files in `shared/ui`, `shared/api`, `data`, `entities/*` | `bundle-barrel-exports` | Import from the defining module; keep feature `index.ts` as the public API for `app/`. Size gain is small (all of `src/` is 86 KB); the reasons are require cycles, HMR, and the pattern template users copy. Add a `no-restricted-imports` rule |
| React Compiler lint rules aren't enabled | `js-react-compiler` | ADR 0011 says react-hooks 7 compiler rules are on; `eslint.config.mjs` doesn't enable them. Also run `react-compiler-healthcheck` (pinned version) |
| Legacy `accessibility*` props | `react-native-testing` (rule 10) | Use `role`, `aria-label`, `aria-disabled`, `aria-live`, `aria-hidden`; `accessibilityHint` stays (no ARIA equivalent). 15 files |

## Pending: fix when touching the area

| Item | Skill reference | Notes |
| --- | --- | --- |
| Feed rows with and without images share one recycling pool | `js-lists-flatlist-flashlist` | Add `getItemType={post => (post.imageUrl ? 'image' : 'text')}` |
| Bottom sheets on iOS can render under native-stack modals | `js-bottomsheet` | `containerComponent` with `FullWindowOverlay` on iOS; check on device |
| Tests query by `testID` where an accessible role exists | `react-native-testing` | Prefer `getByRole(…, { name })`; keep `testID` for Maestro and non-semantic views |
| No startup (TTI) measurement | `native-measure-tti` | Phase 4: `react-native-performance` markers, cold starts only |
| Bundle size isn't tracked per PR | `bundle-analyze-js` | Phase 4: report the size in CI (no failing budget, per the questionnaire) |

## Reviewed, no change

- Controlled `TextInput` (react-hook-form): kept. The New Architecture removes the flicker the skill warns
  about, and the forms validate on every change (`js-uncontrolled-components`).
- FlashList v2 without `estimatedItemSize`, R8 on, 16 KB page alignment checked in CI, native-stack screens,
  Zustand only for client state, React Compiler on, React Navigation static API, one module per icon, MSW
  absent from release bundles: all match the skills.
- Hermes mmap (`bundle-hermes-mmap`) only applies to React Native 0.78 and earlier.
