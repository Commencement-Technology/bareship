# features/

One folder per feature: `screens/`, `components/`, `hooks/`, `api/`, `schema.ts`, and a public `index.ts`.
Features never import each other. Shared code moves down to `entities/` or `shared/`.
See docs/decisions/0005-architecture-and-boundaries.md.
