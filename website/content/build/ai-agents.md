---
title: Built for AI agents
description: "How coding agents learn the project's rules, which skills and generators they use, and how they check their work."
---

Coding agents such as Claude Code, Cursor and Copilot read the same rules your team does, use the same
generators, and are checked by the same linter. You ask for an outcome; the agent follows the project's
conventions to get there, and `pnpm check` tells you whether it did.

## Creating the app

An agent can create the app itself. With every answer passed as a flag and `--yes`, `create-bareship` asks
nothing, so it runs in an agent's shell or in CI:

```bash
npx create-bareship Acme --bundle-id com.acme.app --display-name "Acme" --yes
```

It checks the tools first and stops with a fix for each missing one, before creating anything. Add
`--dry-run` to see the commands it would run. It exits with a non-zero code on any failure, so the agent
knows to stop.

## Where agents find the rules

| File | Read by | What it holds |
| --- | --- | --- |
| [`AGENTS.md`](/build/project-rules/) | Every agent | Commands, architecture rules, offline patterns, styling, tests, conventions |
| `CLAUDE.md` | Claude Code | Points to AGENTS.md and the skills |
| `.cursor/rules/react-native.mdc` | Cursor | Points to AGENTS.md and the skills |
| `.github/copilot-instructions.md` | GitHub Copilot | Points to AGENTS.md and the skills |
| `docs/decisions/` | Every agent | Why each library and pattern was chosen ([decisions](/reference/decisions/)) |

When a convention changes, change it in AGENTS.md; the other files point there.

## Skills

Skills are step-by-step instructions an agent loads for a kind of task. They live in `.claude/skills/`.

**The template's own skills** start from the [generators](/build/generators/), then walk the agent through
the parts the generator can't know:

| Skill | Use it for |
| --- | --- |
| `add-feature` | A new section of the app that lists or manages something |
| `add-screen` | A screen in an existing feature, with a typed, checked deep link |
| `add-endpoint` | An API call, with its response schema, offline pattern, mock and test |

**React Native skills from Callstack** are included, pinned to a tested version:

| Skill | Use it for |
| --- | --- |
| `react-native-best-practices` | Any React Native code: lists, renders, animations, bundle size, startup |
| `react-navigation` | Stacks, tabs, headers, sheets and safe areas |
| `react-native-testing` | Component tests with React Native Testing Library |
| `upgrading-react-native` | Moving to a newer React Native version |
| `agent-device`, `dogfood` | Driving the app on a simulator or emulator, and exploratory testing |

Where a skill and AGENTS.md disagree, AGENTS.md wins; it lists the known differences. Update the Callstack
skills with `pnpm skills:sync <ref>` and review the change like any dependency update.

## What the checks catch

An agent's code goes through the same checks as yours. These rules are enforced, not just documented:

- Imports go downward through the layers, and features never import each other.
- Imports come from the file that defines something, not from folder index files.
- User-facing text comes from translations; hard-coded text in screens fails lint.
- Accessibility uses ARIA props (`role`, `aria-label`), not the older `accessibility*` props.
- The React Compiler's rules apply, and patterns that break under it are rejected.
- Icons are imported one at a time, never the whole icon library.

Run everything with:

```bash
pnpm check
```

## Agents that use the app

An agent that drives the app on a simulator or emulator reads the screen as an accessibility tree: text,
roles, labels and states. Screens in the template label their buttons and mark toggles and tabs as selected or
checked, so an agent can find and verify elements as text instead of guessing from screenshots.

The template recommends [agent-device](https://github.com/callstackincubator/agent-device) for running and
checking the app, and Argent for profiling. Both are separate tools you install; the reasons are in
[decision 0013](/reference/decisions/0013-agent-device-tools/).

## Ask for outcomes

Describe what you want, not the files to touch:

- "Add an orders feature: a list of orders and a detail screen, with a cancel button that works offline."
- "Add a Settings row that opens the privacy policy in the browser."
- "The feed should show the author's avatar; the API sends `avatar_url`."

Then review the change, run `pnpm check`, and open the screen. If the agent did something the rules should
have stopped, add the rule to AGENTS.md or the linter so it doesn't happen again.
