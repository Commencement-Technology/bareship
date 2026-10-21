---
title: How to choose a React Native template
description: 'Eight questions to ask before you start from any React Native template: Expo or bare, offline writes, token storage, accounts, enforced rules, AI agents, releases and removing the demo.'
---

A React Native template decides more about your app than any single library: how the native side is built,
what happens to data without a connection, where tokens are kept, and which rules the code follows. Before
you pick one, answer the eight questions below. Each says what to look for in **any** template, then what
Bareship does, so you can compare like with like.

## The short answer

- Want Expo Go, a managed native side and over-the-air updates out of the box? Start from an Expo template.
- Want the smallest possible starting point and to add everything yourself? Start from a minimal template.
- Want a bare app that already handles offline writes, secure tokens, environments and releases, with rules a
  linter enforces for people and AI agents alike? That's what Bareship is for.

## 1. Expo or bare?

**Why it matters.** It decides who owns `ios/` and `android/`. With Expo's managed workflow, native projects
are generated for you and you change them through config plugins. In a bare project, they're in the repository
and you edit them directly.

**How to check any template.** Is there an `ios/` and `android/` folder in the repository? If there is, are
the changes made to them listed anywhere, or do you have to diff against a fresh project to find them?

**Bareship.** Bare React Native CLI. Every native change is marked `[bareship]` in the code and listed with its
Expo equivalent in [Native changes](/production/native-changes/), so moving to Expo's prebuild later means
following a list. See [Why bare and not Expo](/start-here/introduction/#why-bare-and-not-expo).

## 2. What happens to a write without a connection?

**Why it matters.** Most templates cache data for reading. Few say what happens when a user likes, edits or
pays while offline. If the answer is "the request fails," every feature you build has to solve it again.

**How to check any template.** Turn on airplane mode, make a change, then kill the app and reopen it online.
Was the change sent? Was it sent once? Did the screen tell you it was waiting?

**Bareship.** Every write chooses one of four behaviours: send later silently, send later marked "Waiting to
sync", disable the form, or replace the screen. Queued writes survive the app being killed, are sent in order,
and carry an `Idempotency-Key` so a retry is applied once. See [Offline](/build/offline/).

## 3. Where are sign-in tokens stored?

**Why it matters.** Tokens in plain storage can be read from a backup or a rooted device.

**How to check any template.** Search the code for where the access and refresh tokens are written. Look for
the Keychain on iOS and the Keystore on Android, not a plain key-value store.

**Bareship.** Tokens go to the Keychain and Keystore. The HTTP client refreshes once on a 401 for all
requests waiting at that moment, and signs you out if the refresh fails. See
[Architecture](/build/architecture/).

## 4. Can you run it before signing up for anything?

**Why it matters.** A template that needs Firebase, an Apple account and a backend before it starts costs you
a day before you see a screen, and makes it hard to try two templates side by side.

**How to check any template.** Clone it and run it with no `.env` changes and no accounts. Does it reach a
working screen?

**Bareship.** Yes. A mock backend inside the app serves sample data with a demo account, and each service has
a fallback: crash reports go to the console without Firebase, notifications stay local without push. You add
accounts when you go live. See [Going live](/production/going-live/).

## 5. Are the architecture rules enforced?

**Why it matters.** Folder conventions written in a README drift within months, faster with several people or
agents writing code.

**How to check any template.** Break a rule on purpose (import one feature from another, hard-code a
user-facing string) and run the lint. Does it fail?

**Bareship.** ESLint and dependency-cruiser fail the checks when layers import upward, features import each
other, text skips translations or accessibility uses the older props. `pnpm check` runs everything. See
[Project rules](/build/project-rules/).

## 6. Does it work with AI coding agents?

**Why it matters.** Agents such as Claude Code, Cursor and Copilot write code that looks right and ignores
local conventions unless the rules are in files they read, and unless something checks their output.

**How to check any template.** Is there an `AGENTS.md` (or a tool-specific rules file)? Are there generators
an agent can call instead of copying files? Does the same check run on an agent's code as on yours?

**Bareship.** `AGENTS.md` holds the commands and conventions, the repository ships agent skills and
generators (`pnpm gen feature`, `pnpm gen screen`, `pnpm gen endpoint`), and `create-bareship` runs without
prompts so an agent can create the app itself. See [Built for AI agents](/build/ai-agents/).

## 7. Is it set up for releases?

**Why it matters.** Development, staging and production builds with different API URLs, app IDs and icons are
needed by almost every team, and are painful to add to a native project later.

**How to check any template.** Count the environments, and look for a release script that bumps versions and
builds signed binaries for both stores.

**Bareship.** Three environments (dev, staging, prod) that install side by side, and fastlane lanes that bump
versions and build for both stores. See [Environments](/start-here/environments/) and
[Releasing](/production/releasing/).

## 8. Can you remove the demo?

**Why it matters.** A template's sample screens are useful for a day and in the way after that. Deleting them
by hand leaves dead routes, strings and tests.

**How to check any template.** Is there a documented way to remove the sample content, and does the app still
pass its checks afterwards?

**Bareship.** `pnpm strip-examples` removes the feed, its sample data and the showroom, and leaves sign-in,
onboarding, settings and a blank Home tab that pass `pnpm check`. See
[Quick start](/start-here/quick-start/).

## Checklist

Copy this table and fill in the X and Y columns for the templates you're comparing.

| Question | What to look for | Bareship | Template X | Template Y |
| --- | --- | --- | --- | --- |
| Expo or bare | Native folders you own, changes listed | Bare, every change listed with its Expo equivalent | | |
| Offline writes | Change survives a kill and is sent once | Four patterns, queued writes persist, idempotent | | |
| Token storage | Keychain and Keystore | Keychain and Keystore | | |
| Runs with no accounts | Working screen on first run | Mock backend and fallbacks for every service | | |
| Enforced rules | Lint fails when a rule is broken | ESLint and dependency-cruiser | | |
| AI agents | Rules file, generators, same checks | `AGENTS.md`, skills, generators | | |
| Releases | Environments and a release script | Dev, staging, prod; fastlane | | |
| Remove the demo | One command, checks still pass | `pnpm strip-examples` | | |

## When Bareship isn't the right choice

- You want Expo Go or the managed workflow. Start from an Expo template.
- You need a backend. Bareship is the app; it ships a mock backend to build against, not a server.
- You want a large UI kit. It has about 15 accessible primitives, themed for light and dark.
- You need device-level end-to-end tests or over-the-air updates today. Neither is wired in; see
  [What's not included](/start-here/introduction/#whats-not-included).

## Questions

### Is Bareship an Expo template?

No. Bareship is a bare React Native CLI template: `ios/` and `android/` are in the repository and you edit
them directly. Every native change is listed with its Expo equivalent, so you can move to Expo's prebuild
later by following that list.

### Which React Native template works offline?

Look for one that says what happens to a write, not only a read, without a connection. Bareship queues writes
on the device, keeps them when the app is killed, sends them in order when the connection returns, and uses an
`Idempotency-Key` so a retried write is applied once.

### Which React Native template works best with AI coding agents?

One that keeps its rules in files agents read, such as `AGENTS.md`, gives agents generators to call, and runs
the same lint and tests on an agent's code as on yours. Bareship does all three, and its installer runs
without prompts so an agent can create the app.

### Can I try a template without creating any accounts?

With Bareship, yes. It runs on a simulator or emulator with a mock backend and a demo account, and needs no
Firebase, Apple or Google account until you go live.

### Is Bareship free?

Yes. It's open source under the MIT license, and the apps you build with it are yours.

## Next

[Quick start](/start-here/quick-start/) creates an app with `npx create-bareship Acme` and runs it on a
simulator or emulator.
