# 0005. Folder architecture and import boundaries

- Status: Accepted
- Date: 2026-10-10
- Questions: C1–C4, C11, C12

## Context

Templates organised by type (Ignite) or by atomic size (TheCodingMachine) spread one feature across many folders. Rules that only live in a README get broken within weeks.

## Decision

- **Feature folders with layers (C1).** `src/` has five layers. Imports go downward only:

  ```
  app → features → entities → data → shared
  ```

  - `app/`: composition only: entry, providers, navigation tree, boot sequence.
  - `features/<name>/`: screens, components, hooks (view-models), `api/`, `schema.ts`, and a public `index.ts`. Features never import each other.
  - `entities/<name>/`: business models shared by two or more features: Zod schema, model type, DTO mappers, query keys.
  - `data/`: query client and persister, offline mutation queue, repositories for multi-source entities.
  - `shared/`: no business knowledge: UI system, API client, storage, i18n, observability, config, ports and adapters.
- **Enforcement (C2): both** `eslint-plugin-boundaries` (feedback in the editor) and `dependency-cruiser` (graph check in CI, also catching circular imports).
- **Repository shape (C3):** a single app. No monorepo.
- **Data-layer strictness (C4): structured.** Each feature's `api/` owns its requests, DTO-to-model mapping and query options. A repository exists only when an entity has more than one source (for example, network plus SQLite). No use-case layer unless logic is shared.
- **TypeScript (C11):** `strict` plus `noUncheckedIndexedAccess`, on top of `@react-native/typescript-config`.
- **React Compiler (C12): on**, through `babel-plugin-react-compiler` 1.0, with the compiler lint rules from `eslint-plugin-react-hooks` 7.

## Consequences

- Something two features both need moves down to `entities/` or `shared/`, never sideways.
- `@/` path alias for `src/` (Babel module-resolver + `tsconfig` paths). Deep relative imports across layers are banned.

## Alternatives considered

- Full Feature-Sliced Design: its pages/widgets layers add ceremony a mobile app rarely needs.
- Atomic design: groups by size, not by what changes together.
