# 0014. Native CI builds are opt-in

- Status: Accepted
- Date: 2026-10-12
- Supersedes: the "Labelled PRs and `main` also build Android and iOS" part of
  [0012](0012-testing-and-delivery.md)

## Context

ADR 0012 builds Android and iOS on every push to `main`. Every repository made from the template inherits
that workflow, switched on. The first run showed the cost:

- A cold Android build on a standard GitHub runner takes 30–60 minutes, and on a private repository's 8 GB
  runner it ran out of memory and was killed.
- macOS minutes count ten times against a private repository's free quota, so an iOS build on every push to
  `main` uses it up quickly.

A team that just created its app from the template gets slow, costly builds it didn't ask for.

## Decision

- The checks job (types, lint, format, boundaries, tests) runs on every pull request and push to `main`, as
  before.
- The Android and iOS builds run only when asked:
  - on a pull request labelled `native` (adding the label starts them)
  - from a manual run (Actions → CI → Run workflow)
  - on every push to `main` once the repository variable `NATIVE_BUILDS` is `true`
- The Android job gets swap and at most two Gradle workers so it fits a standard runner; every job has a time
  limit.

## Consequences

- A change that breaks a native build can reach `main` unnoticed unless someone labels the pull request or
  turns on `NATIVE_BUILDS`. Teams that can afford it should turn it on.
- This repository sets `NATIVE_BUILDS=true` when CI is switched back on.

## Alternatives considered

- Keep native builds on every push to `main`: the cost lands on every new project by default.
- Android on `main`, iOS opt-in: halves the cost but keeps the slowest, most memory-hungry job on by default.
- Nightly scheduled builds: catches breakage a day late and still costs minutes every day, even with no
  changes.
