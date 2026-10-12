# 0001. Scope, audience and the two-track plan

- Status: Accepted
- Date: 2026-10-10
- Questions: A1–A7

## Context

Existing templates each solve part of the problem (see `docs/research.md`). We want one template that keeps their strengths and fixes their gaps, for both the bare React Native CLI and Expo.

## Decision

- **Two tracks.** Track A (this repo) is a bare React Native CLI template. Track B ports the same `src/` to Expo with Continuous Native Generation after Track A ships. Native and vendor capabilities sit behind ports so Track B swaps adapters, not features.
- **Audience (A1): everyone.** A core that suits solo developers, agencies and product teams, with extras opt-in.
- **Distribution (A2): both** a GitHub template repository and an npm template for `npx @react-native-community/cli init MyApp --template …`, built from the same source.
- **Opinionation (A3): fixed core + opt-in modules.** Core is always on; modules are added by recipe.
- **Example code (A4): full demo** (auth, feed, settings, component showroom) that a script can remove.
- **Backend (A5): REST + OpenAPI**, with an MSW mock server so the app runs with no backend.
- **License (A7): MIT.**
- **Name (A6):** working name `rn-template` until a final name is chosen. Renaming is one `pnpm bootstrap` run.

## Consequences

- The demo features must stay removable: `scripts/strip-examples.ts` is part of the deliverable. Built
  2026-10-12: it removes the feed, posts mocks and showroom (marked `// @example` in the code) and keeps
  sign-in, onboarding and settings, which most apps need. `scripts/ci/check-strip-examples.sh` checks the
  stripped app.
- Ports add a small indirection everywhere a native library is used. In exchange, Track B and vendor swaps stay cheap.

## Alternatives considered

- Expo first: faster, but hides the native decisions this template wants to make explicit.
- Pick-everything CLI: maximum flexibility, but the maintenance matrix explodes.
