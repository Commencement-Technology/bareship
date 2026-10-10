# AGENTS.md

Guide for AI agents and new contributors. Read this before changing code.

## What this is

A bare React Native 0.87 template (Track A). Decisions and their reasons are in `docs/decisions/` (ADRs).
Never change a recorded decision silently: propose a new ADR.

## Commands

| Task | Command |
| --- | --- |
| Install | `pnpm install` (pnpm only; supply-chain policy in `pnpm-workspace.yaml`) |
| iOS pods | `pnpm pods` |
| Run | `pnpm android` / `pnpm ios` (dev); `:staging`, `:prod` variants |
| All checks | `pnpm check` (typecheck, lint, format, depcruise, tests) |
| Rename the app | `pnpm bootstrap --name Acme --bundle-id com.acme.app` |
| Icons / splash | `pnpm icons`, `pnpm splash` |

## Architecture rules

- `src/` layers, imports go downward only: `app → features → entities → data → shared` (ADR 0005).
- A feature never imports another feature. Move shared code down to `entities/` or `shared/`.
- Import with the `@/` alias. No deep relative imports, no `react-native/Libraries/*` imports.
- Configuration is read only in `src/shared/config/env.ts`. `.env.*` values are public; no secrets.
- Server data belongs to TanStack Query; Zustand holds only small client state (ADR 0006).
- Screens never call the HTTP client directly; they use feature hooks.
- Native or vendor libraries are used only through ports in `src/shared/ports`, via `services()`.
- Icons come from `@/shared/ui/icons` (add new ones there). Never import values from the `lucide-react-native` root.
- UI text comes from `t('…')` with keys in `src/shared/i18n/locales/en.json` (and `ar.json`). Lint rejects
  hard-coded JSX text. Use `start`/`end`, never `left`/`right`, so right-to-left layouts work.
- Style with Unistyles (`StyleSheet.create(theme => …)`) and theme roles (`theme.colors.text`), never hex values.

See [docs/architecture.md](docs/architecture.md) for data flow and the reference mutation pattern.

ESLint (`eslint-plugin-boundaries`) and `dependency-cruiser` enforce the layer rules. Fix the import, never
disable the rule.

## Styling

Unistyles 3 with the React Compiler on. For styles that depend on props or state, use a **dynamic function**
(`field: (state: FieldState) => ({ … })`, used as `style={styles.field(state)}`), not `variants` +
`styles.useVariants()`. The compiler memoizes `style={[styles.x, …]}` without knowing that `useVariants`
changed `styles.x`, so the old variant stays on screen (a focus border that never clears, a stale selected
tab). A dynamic function's arguments are ordinary dependencies, so it stays correct and memoized. ESLint
rejects `useVariants`. Theme switches don't re-render either way: Unistyles updates native views directly.

## Native changes

Any edit under `android/` or `ios/`: mark it with a `[rn-template]` comment and add a row to
`docs/native-changes.md` with its Expo equivalent.

## Adding a dependency

Check it builds with RN 0.87, the New Architecture, AGP 9 and Xcode 27, and record it in `docs/version-matrix.md`.
New versions younger than 3 days are refused by pnpm; don't bypass this without a reviewed exclude entry.

## Tests

Jest + React Native Testing Library 14. `render`, `fireEvent` and `userEvent` are async: always `await` them.
Prefer `userEvent.setup()` and `getByRole` / `getByLabelText` queries.

- HTTP is answered by the MSW mock backend in `src/mocks` (the same handlers power `API_MOCKS=true` in dev).
  Override a response in one test with `server.use(http.get('*/posts', () => …))`.
- `src/test/setup.ts` mocks native modules and resets services, session, DB and query cache before each test.
- `src/test/app.ts`: `signInDemoUser()`, in-memory SecureStore. `src/test/render.tsx`: `renderWithProviders()`.
- Coverage gate: 80% lines/functions on `src/shared/` and `src/data/`.

## Mock backend

`API_MOCKS=true` in `.env.dev` serves the API from `src/mocks` inside the app (development builds only; release
bundles drop it). Demo account: `demo@example.com` / `password123`. Set `API_MOCKS=false` to hit `API_URL`.

- In the app, `src/mocks/native.ts` is an axios adapter that runs the MSW handlers with `getResponse()`. It
  doesn't patch XHR/fetch, so other traffic (images, Metro) is untouched. Unmatched requests go to the network.
- The mock DB resets on every JS reload. Tokens are self-describing, so a signed-in session survives reloads.
- Add an endpoint: a handler in `src/mocks/handlers.ts`, snake_case DTOs, and a test against it.

## Intl on Hermes

Hermes ships only `Intl.Collator`, `DateTimeFormat` and `NumberFormat`. `src/shared/i18n/intl-polyfills.ts`
adds `PluralRules` (i18next plurals) and `RelativeTimeFormat` (`formatRelative`). Adding a language means adding
its locale data there too; a test fails if you forget. Jest runs Node's full Intl, so device-only Intl bugs
don't show up in tests: check new Intl APIs on a device.

## Commits

Conventional Commits (`feat:`, `fix:`, `chore:` …), enforced by commitlint.
