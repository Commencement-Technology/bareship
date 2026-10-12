---
name: add-screen
description: Adds a screen to an existing feature of this template, registered in the navigator with a typed, validated deep link, a translated title and a test. Use when asked to add a screen, page, detail view or form to the app.
---

# Add a screen

## 1. Generate

```bash
pnpm gen screen <feature> <name>               # e.g. pnpm gen screen orders order-history
pnpm gen screen <feature> <name> --param id    # a screen that takes a route param
```

It creates `src/features/<feature>/screens/<Name>Screen.tsx` and its test, exports the screen from the
feature's `index.ts`, adds `<feature>.<name>Title` to `en.json` and `ar.json`, and registers a `<Name>` stack
screen in `RootNavigator.tsx` (signed-in group) with the deep link `<feature>/<name>[/:param]`.

The feature must exist (`pnpm gen feature <feature>` first). Route names are global: pick one that isn't
taken.

## 2. Build it

- **Params come from deep links too.** The generated `ParamsSchema` (Zod) validates them; keep it and show
  `ErrorState` when they're invalid. Navigation is typed: `navigation.navigate('<Name>', { id })`.
- **Data:** `useQuery(<x>QueryOptions(id))` from the feature's `api.ts`. Handle pending (`LoadingState`
  or a skeleton), error (`ErrorState` with `onRetry`) and empty (`EmptyState`). Add the endpoint with
  `pnpm gen endpoint` (`add-endpoint` skill).
- **Forms:** react-hook-form + a Zod schema, `FormTextField`, `Screen scroll` for the keyboard. Writes are
  mutation hooks; choose the offline pattern (AGENTS.md › Offline). Sign-in-style forms use pattern C.
- **UI:** primitives from `@/shared/ui/primitives/*`, icons from `@/shared/ui/icons`, text through
  `t('…')`, styles from `StyleSheet.create(theme => …)` with theme roles, `start`/`end` not `left`/`right`.
- **Accessibility:** `role` and `aria-*` props; `aria-label` on icon-only buttons; `aria-selected` /
  `aria-checked` on toggles and tabs. Agents read the same tree.
- **Lists:** FlashList, never `ScrollView` + `map` for data that grows.
- **Header:** the generator sets a translated `headerTitle`. Change options in `RootNavigator.tsx`, not with
  `navigation.setOptions` in an effect.

## 3. Check

```bash
pnpm check
```

Extend the generated test: query by role or label (`getByRole('button', { name: … })`), `await` every
`render` and `userEvent` call, and override responses with `server.use(…)`. Then open the screen with
agent-device, including the deep link: `xcrun simctl openurl booted '<scheme>://<path>'` or
`adb shell am start -d '<scheme>://<path>'`.
