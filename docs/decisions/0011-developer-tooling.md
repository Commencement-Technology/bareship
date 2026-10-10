# 0011. Developer tooling, docs and agents

- Status: Accepted
- Date: 2026-10-10
- Questions: E8, F8, F9, F11, F12

## Decision

- **Debugging (E8):** React Native DevTools with Rozenite plugins (network, TanStack Query, MMKV, performance). No Flipper, no Reactotron.
- **Lint and format (F8):** ESLint 9 flat config + Prettier 3. We use ESLint 9.39 (its maintenance line) because `@react-native/eslint-config` 0.87, `eslint-plugin-react` and `eslint-plugin-react-native` don't support ESLint 10 yet. Move to 10 when they do. Plugins: typescript-eslint, react-hooks 7 (with compiler rules), react-native, boundaries, import ordering, testing-library, and selected unicorn rules.
- **Commits (F9):** Conventional Commits enforced by commitlint through Husky. The changelog is generated from commits.
- **Agents (F11):** `AGENTS.md` (rules, commands, recipes) and `CLAUDE.md` (points to AGENTS.md), plus Claude skills in `.claude/skills/` for "add a feature", "add an endpoint" and "add a screen".
- **Docs (F12):** README + `docs/` + ADRs.
- **Generators:** `pnpm gen <feature|screen|component|entity|query>` create files in the agreed shape, with tests.

## Consequences

- Agent skills and generators must be updated whenever a convention changes. The PR template asks about it.
