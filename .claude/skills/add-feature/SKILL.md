---
name: add-feature
description: Adds a new feature module to this template (src/features/<name>) with its schema, API, list screen, mock endpoint, strings, navigation and tests. Use when asked to add a feature, a new section of the app, or a new resource the app lists (orders, messages, products).
---

# Add a feature

Scaffold with the generator, then make it real. Don't hand-write the boilerplate: the generator already
follows AGENTS.md (layers, imports, ARIA, i18n, offline, mocks).

## 1. Generate

```bash
pnpm gen feature <name>                 # kebab-case, plural: orders, order-history
pnpm gen feature people --item person   # when the singular isn't <name> minus "s"
```

It creates:

| File | What |
| --- | --- |
| `src/features/<name>/schema.ts` | DTO schema (snake_case, as the server sends it), the app model, a transform |
| `src/features/<name>/api.ts` | Query keys and `<name>QueryOptions` (`GET /<name>`) |
| `src/features/<name>/screens/<Name>Screen.tsx` + test | FlashList with loading, empty, error/retry and pull to refresh |
| `src/features/<name>/index.ts` | Public API: the only thing `src/app` may import |
| `src/mocks/<name>.ts` | Mock table (reseeded with the mock db) and handler, registered in `handlers.ts` |
| `en.json`, `ar.json` | `<name>.title`, `emptyTitle`, `emptyBody`, `errorTitle` |
| `RootNavigator.tsx`, `scripts/links-files.ts` | A `<Name>` stack screen with the deep link `<name>` |

## 2. Make it real

1. **Fields.** Replace the sample `title` in `schema.ts` (DTO, model, transform) and in `src/mocks/<name>.ts`.
   The model is camelCase; only `schema.ts` knows the server's names.
2. **Strings.** Translate the new keys in `ar.json` (the generator copied English).
3. **Entry point.** Link to the screen from somewhere (`navigation.navigate('<Name>')`, a Settings row, a
   tab). For a tab, move the route into `Tabs` in `RootNavigator.tsx`.
4. **Endpoints.** Add each one with `pnpm gen endpoint` (see the `add-endpoint` skill), and screens with
   `pnpm gen screen` (`add-screen` skill).
5. **Shared code.** If another feature needs this feature's model, move it down to `src/entities/`;
   features never import each other.

## 3. Check

```bash
pnpm check
```

Then open the screen in the app with agent-device (AGENTS.md › Driving the app) and confirm the list,
empty state and an error (set `API_MOCKS=false` or override the handler).

## Don't

- Call `http` from a screen: screens use the feature's query options and hooks.
- Put server data in Zustand: it belongs to TanStack Query.
- Import `src/mocks` from app code.
