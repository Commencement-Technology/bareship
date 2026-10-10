# mocks/

A small fake REST backend built with MSW (Mock Service Worker). The same handlers serve:

- the app in development when `API_MOCKS=true` (`.env.dev`), through `mocks/native.ts`
- Jest tests, through `mocks/node.ts`

It is a stand-in for a real API, so it deliberately imports nothing from the app: it speaks JSON
(snake_case, like many real backends) and the app's feature `api/` modules map it to models.

Endpoints: `POST /auth/login|register|refresh|forgot-password|logout`, `GET|DELETE /me`,
`GET /posts?cursor&limit`, `GET /posts/:id`, `POST|DELETE /posts/:id/like`.
Demo account: `demo@example.com` / `password123`. Access tokens expire after 2 minutes to exercise refresh.
