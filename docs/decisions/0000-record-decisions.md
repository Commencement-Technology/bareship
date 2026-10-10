# 0000. Record architecture decisions

- Status: Accepted
- Date: 2026-10-10

## Context

The template will be used by people who weren't in the room when its choices were made. Without a record, every choice gets re-litigated or silently undone.

## Decision

Keep lightweight ADRs in `docs/decisions/`, numbered, one decision per file, using `template.md`. Every pull request that changes a recorded decision adds a new ADR that supersedes the old one.

## Consequences

Contributors and AI agents can find the reason behind a choice by reading one short file. `AGENTS.md` points here.
