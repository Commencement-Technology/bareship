# Research behind this template

Before writing code (October 2026) we studied the popular React Native starters and two large open-source
apps. Each finding below comes from the project's code, not its README, as of 10 October 2026. The
decisions that follow from them are in [decisions/](decisions/README.md) (ADRs 0001–0012).

## Templates

| Template | Kept from it | What it leaves out | What this template does instead |
| --- | --- | --- | --- |
| Ignite | Generators, dependency-cruiser in CI, an on-device component showroom, RTL | Expo-based, so bare apps must prebuild; no server-cache library or schema validation; no app CI, crash reporting, flags or OTA | Bare CLI; TanStack Query, Zustand and Zod; a showroom; a full CI pipeline |
| Obytes | Feature folders, `@/` imports, a typed multi-environment `env.ts`, an icon badge per environment, agent docs | Expo only; auth tokens in MMKV rather than the Keychain; screens call query hooks with no data layer; no crash reporting, flags or OTA | The same environment discipline with native flavors; tokens in the Keychain; a data layer; observability ports |
| TheCodingMachine | Bare CLI, domain services, structure lint, TanStack Query, MMKV, Zod | Atomic design spreads one feature over four folders; JS stack navigator; environment values inlined by Babel, so no per-environment app ids or icons; no E2E, app CI, keyboard handling or secure storage | Feature folders; native stack; real Android flavors and iOS schemes; keyboard-controller and the Keychain |
| Community template | The canonical native project for each RN version | Hello-world only, no structure | The starting point (0.87-stable), so native diffs stay comparable in the Upgrade Helper |
| create-t3-turbo, create-expo-stack | Shared packages with web; choosing the stack at creation | Need a tRPC backend or Expo; scaffolding without architecture | Works with any REST backend; a fixed core with opt-in modules |

None of them had an offline write queue, token refresh with Keychain storage, an observability seam, OTA,
typed i18n keys or a supply-chain policy. These are the template's main additions.

## Apps

- **Bluesky (social-app):** state split by kind (server cache, persisted, session, preferences, UI chrome),
  a persisted query cache so the app opens on the last content, its own small design system, and a vendor
  seam for logging, analytics, flags and crash reporting.
- **Expensify:** the UI never calls the network; write responses return the updated data, so there is no
  write-then-refetch; and named offline patterns, which became patterns A–D here.

## Other references

The Android app architecture guide (unidirectional data flow, single source of truth, layers), Bulletproof
React's project structure, Feature-Sliced Design's import rule, Expensify's philosophy docs, and a mobile
system-design guide that maps concepts (retry, idempotency, caching, offline sync) to code.
