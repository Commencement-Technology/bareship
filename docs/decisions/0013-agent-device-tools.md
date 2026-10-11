# 0013. Agent device tools: agent-device by default, Argent for profiling

- Status: Accepted
- Date: 2026-10-11

## Context

Coding agents need to run the app, tap through it, check a change on screen and profile it. Two tools do
this: Callstack's [agent-device](https://github.com/callstackincubator/agent-device) (a CLI plus skills,
already vendored here as `agent-device` and `dogfood`) and Software Mansion's
[Argent](https://github.com/software-mansion/argent) (an MCP server plus skills and a rule file).

A comparison on a React Native 0.87 app
([Coding agents drive the simulator](https://www.praveensingh.co.in/blog/coding-agents-drive-the-simulator),
Claude Code, iOS simulator, 12 scored runs) found:

- Both solved every task: reproduce a bug, fix and verify a layout, profile and fix slow typing.
- agent-device cost about a third as much per run ($0.41 against $1.27 median) and processed about 5× fewer
  tokens. It returns text snapshots with short element refs; Argent returns a screenshot and the full
  accessibility tree after every action, and the images stay in the conversation.
- agent-device's snapshot showed a `[selected]` state as text; Argent's tree left it out, so its agent needed
  a screenshot.
- Argent's React and CPU profiler worked with no project changes and pointed straight at the slow code.
  agent-device's React profiling installs `agent-react-devtools`, which edits `index.js`, `metro.config.js`
  and `package.json`; one call hung.
- Argent's global rule file loads into every Claude Code session, including non-mobile projects, and leaked
  into agent-device sessions.

The evidence is small: two runs per task, iOS only, one model, one app.

## Decision

- **Driving the app and QA:** agent-device is the default (`agent-device`, `dogfood` skills). Screenshots
  only when the layout itself is the question.
- **Profiling:** Argent's profiler skills (`argent-react-native-profiler`, `argent-native-profiler`), because
  they need no project changes. React Native DevTools (Metro `j`) stays the tool for humans.
- **No profiler setup in the project:** don't run `agent-react-devtools init` or anything else that edits
  `index.js`, `metro.config.js` or `package.json` to profile. Those files carry the release mock guard
  (`index.demo.js`, `scripts/ci/check-no-mocks-in-release.sh`) and the pinned-install policy.
- **Saved end-to-end tests:** still Maestro (ADR 0012). Neither agent tool replaces a CI test suite.
- Both tools are developer-machine installs, not template dependencies. Tested with agent-device 0.21.25 and
  Argent 0.28.0.

## Consequences

- Routine agent sessions are cheaper and last longer before the context fills.
- Two tools to keep current. Argent's global rule file stays out of the global Claude rules; `argent update`
  copies it back, so move it again after each update.
- Both tools read the accessibility tree. Interactive elements need `aria-label`, and toggles and tabs need
  `aria-checked` / `aria-selected`, or agents fall back to screenshots and coordinates.
- The comparison covered iOS only. Confirm agent-device on the Android emulator before relying on it there.

## Alternatives considered

- Argent for everything: about 3× the cost per routine run, and its global rule loads into every session.
- agent-device for everything: its React profiling edits project files this template guards, and was the
  slowest path in the comparison.
- Both loaded by default: conflicting instructions and wasted context, as the comparison found.
