---
title: Introduction
description: "What rn-template is, what it believes, who it's for, and what it leaves out."
---

rn-template is a starting point for a production React Native app. You get a working app (sign-in,
onboarding, a feed, settings) built on the parts most apps need and most templates skip: writes that survive
being offline, tokens kept in the Keychain, three environments, crash reporting and feature flags, deep links,
and release automation. You keep what you need, remove the demo, and build your own features on top.

It's a bare React Native CLI project: `ios/` and `android/` are in the repository and yours to change.

## What it believes

**You own the native side.** Every change to `ios/` and `android/` is marked `[rn-template]` in the code and
listed in [Native changes](/production/native-changes/) with its Expo equivalent, so nothing native is hidden
from you.

**Offline is a design decision, not an afterthought.** Every write in the app chooses what happens without a
connection, and users always see the result: done, waiting to sync, or not possible right now.
[Offline](/build/offline/) explains the four patterns.

**Rules are checked, not just written down.** The layers of the app import downward only, features never
import each other, user-facing text goes through translations, and accessibility uses ARIA props. ESLint
and dependency-cruiser fail the checks when code breaks a rule.

**It runs before you sign up for anything.** A mock backend inside the app serves sample data, and every
service has a fallback: crash reports go to the console without Firebase, notifications stay local without
push. You add accounts when you need them ([Going live](/production/going-live/)).

**Decisions are written down.** Each library and pattern was chosen for a reason, recorded in a
[decision record](/reference/decisions/) with the alternatives that lost. When you disagree, you know what
you're trading.

**People and AI agents follow the same rules.** [AGENTS.md](/build/project-rules/) holds the commands and
conventions, and the template ships skills and generators so coding agents produce code that passes the same
checks. See [Built for AI agents](/build/ai-agents/).

## Who it's for

It suits you if you:

- want full control of the native projects, with every change visible
- build an app that has to keep working on a poor connection
- work in a team, or with AI agents, and want conventions enforced rather than reviewed by hand
- would rather delete what you don't need than assemble everything yourself

It doesn't suit you if you:

- want Expo's managed workflow or Expo Go. Start from an Expo template instead.
- need a backend. This is the app; it includes a mock backend to build against, not a server.
- want a large UI kit. It has about 15 accessible primitives (buttons, inputs, sheets, toasts, list items),
  themed for light and dark.

## Why bare and not Expo

Expo is a good default for many apps. This template targets teams who want to see and change every native
setting: signing, flavors, schemes, native modules, the build itself.

It doesn't lock you out of Expo later. The app code in `src/` reaches native libraries only through small
interfaces in `src/shared/ports`, so swapping how the native side is built changes adapters, not features. And
because every native change is logged with its Expo equivalent, moving to Expo's prebuild means following a
list rather than reverse-engineering the project.

## What's not included

- **A backend.** Point `API_URL` at yours; the mock backend shows every request the app makes.
- **End-to-end tests.** Unit and component tests cover the app (Jest and React Native Testing Library); there
  are no device-level end-to-end flows yet.
- **Over-the-air updates.** There's an interface for them but no provider wired in. Add one (for example
  hot-updater) behind it.
- **An iOS demo build.** The installable demo build is Android-only, because iOS needs a signed build; use
  the simulator.

## Next

[Quick start](/start-here/quick-start/) takes you from nothing to the app running on a simulator or emulator.
