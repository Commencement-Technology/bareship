# 0006. State, data layer and offline

- Status: Accepted
- Date: 2026-10-10
- Questions: C5–C10

## Context

Most app state is a cache of server data. Mixing it with client state in one store is the most common architecture mistake in React Native apps.

## Decision

- **Server state:** TanStack Query 5, persisted to MMKV so a cold start shows the last data immediately (stale-while-revalidate).
- **Client state (C5):** Zustand 5 for small UI and session stores only.
- **HTTP client (C6): axios** (differs from the recommendation, which was a fetch wrapper). One configured instance in `shared/api/client.ts`. Cross-cutting behaviour is implemented as interceptors we own:
  - auth header, and single-flight token refresh on 401 that queues concurrent requests
  - retry with exponential backoff and jitter for idempotent requests, plus a per-host circuit breaker
  - `Idempotency-Key` on every mutation
  - normalisation into a typed `ApiError`
  - response bodies parsed with Zod at the edge of each feature's `api/`

  axios also gives upload progress, which React Native's fetch lacks.
- **OpenAPI codegen (C7): Orval**, opt-in, generating axios clients, TanStack Query hooks, Zod schemas and MSW handlers from a spec.
- **Offline (C8): persisted cache plus an offline mutation queue in core.** Every mutation declares an offline pattern (None, A, B, C, D — from Expensify's offline philosophy). Queued writes carry their idempotency key and replay when the network returns.
- **Local database (C9):** op-sqlite + Drizzle ORM as an **opt-in module** (`modules/offline-db`), for apps that need SQLite as their source of truth.
- **Realtime (C10):** an opt-in module. A `Realtime` port with a reconnecting WebSocket adapter (backoff, heartbeat, pauses in the background).

## Consequences

- Screens never call axios. They call feature hooks.
- axios adds about 13 kB gzipped and an XHR-based transport. Behaviour like streaming responses is out of scope.

## Alternatives considered

- Own fetch-based client: no dependency, but we'd re-implement interceptors and upload progress.
- Redux Toolkit / Jotai / Legend State: heavier, or solving problems TanStack Query already solves.
