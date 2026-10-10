# 0007. Navigation

- Status: Accepted
- Date: 2026-10-10
- Question: D1

## Context

React Navigation 8 is still in alpha (8.0.0-alpha.58 on 2026-09-29). Version 7 is stable and its static API is the shape v8 builds on.

## Decision

React Navigation 7 with the **static configuration API**, `native-stack` and `bottom-tabs` on `react-native-screens`. Routes are typed with the static API's type inference. One linking config serves custom schemes, universal links and app links. Route params arriving from links are validated with Zod. Auth and onboarding are gated with `if` conditions on screens.

## Consequences

- All route definitions live in `src/app/navigation/`, so the v8 upgrade touches one folder.
- No file-based routing in Track A. Expo Router is evaluated in Track B.

## Alternatives considered

- Dynamic JSX navigators: more flexible, but weaker type inference and a bigger v8 migration.
- React Navigation 8 alpha: the API may still change.
