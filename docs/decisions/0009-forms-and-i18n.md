# 0009. Forms and i18n

- Status: Accepted
- Date: 2026-10-10
- Questions: D7, D8

## Decision

- **Forms (D7):** react-hook-form 7 with `@hookform/resolvers/zod`. The same Zod schema validates the form and the API payload. Field primitives in `shared/ui/form` handle labels, errors, hints, keyboard avoidance (keyboard-controller) and next-field focus. Forms that must not submit offline use offline pattern C (input kept, submit disabled).
- **i18n (D8):** i18next + react-i18next with `react-native-localize` for the device locale and a manual override in Settings. Translation keys are typed from `en.json`. ICU-style plurals and `Intl` formatting. A lint rule flags hard-coded user-visible strings. RTL is supported (ADR 0008).

## Alternatives considered

- TanStack Form: type-first, smaller ecosystem.
- Lingui: excellent extraction workflow, less common in templates.
