# 0011. Developer tooling, docs and agents

- Status: Accepted
- Date: 2026-10-10
- Questions: E8, F8, F9, F11, F12

## Decision

- **Debugging (E8):** React Native DevTools with Rozenite plugins (network, TanStack Query, MMKV, performance). No Flipper, no Reactotron.
- **Lint and format (F8):** ESLint 9 flat config + Prettier 3. We use ESLint 9.39 (its maintenance line) because `@react-native/eslint-config` 0.87, `eslint-plugin-react` and `eslint-plugin-react-native` don't support ESLint 10 yet. Move to 10 when they do. Plugins: typescript-eslint, react-hooks 7, react-native, boundaries, import ordering and i18next. The react-hooks 7 compiler rules are enabled (2026-10-11); testing-library and selected unicorn rules were planned but aren't enabled yet.
- **Commits (F9):** Conventional Commits enforced by commitlint through Husky. The changelog is generated from commits.
- **Agents (F11):** `AGENTS.md` (rules, commands, recipes) and `CLAUDE.md` (points to AGENTS.md), plus Claude skills in `.claude/skills/` for "add a feature", "add an endpoint" and "add a screen" (added 2026-10-12: `add-feature`, `add-screen`, `add-endpoint`). They start from `pnpm gen` (`scripts/generate.ts`), which writes code that already passes lint and tests, so agents and people only fill in the specifics. The generator uses no template engine or extra dependency; it inserts into the navigator and the mock handlers at `// gen:` marker lines.
- **React Native agent skills (added 2026-10-10):** Callstack's skills ([callstackincubator/agent-skills](https://github.com/callstackincubator/agent-skills), MIT) are vendored in `.claude/skills/`, pinned to a commit in `skills-lock.json`. `pnpm skills:sync <ref>` updates them; the change is reviewed like any dependency bump. Profiler screenshots aren't copied (links point at the pinned commit upstream). `AGENTS.md` says which skill applies to which work and which template rules win where a skill disagrees. Cursor (`.cursor/rules/`) and Copilot (`.github/copilot-instructions.md`) point at the same files.
- **Docs (F12):** README + `docs/` + ADRs.
- **Generators:** `pnpm gen <feature|screen|component|entity|query>` create files in the agreed shape, with tests.

## Consequences

- Agent skills and generators must be updated whenever a convention changes. The PR template asks about it.
- Vendored skills are copies: they don't update themselves. Re-sync when upstream changes, and re-check the conflicts listed in `AGENTS.md`.
