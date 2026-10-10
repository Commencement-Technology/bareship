# 0008. UI system

- Status: Accepted
- Date: 2026-10-10
- Questions: D2–D6, D9–D12

## Context

A template's UI layer should be fast, themeable and easy to rebrand, without forcing a heavy component kit on its users.

## Decision

- **Styling (D2): Unistyles 3.** StyleSheet-compatible API, theming and breakpoints in C++ (Nitro), no re-renders on theme change. Requires `react-native-nitro-modules` and `react-native-edge-to-edge`.
- **Components (D3): our own primitives** in `shared/ui`: Text, Button, Input, Screen, Sheet, Toast, ListItem, Skeleton, Image, Icon, each with accessibility props built in.
- **Theming (D4):** light, dark and system, **plus brand themes**. Tokens are split into a brand palette and semantic roles, so a white-label rebrand edits one file.
- **Icons (D5):** `lucide-react-native` on `react-native-svg`.
- **Lists (D6):** FlashList 2.
- **RTL (D9): yes.** Layout uses `start`/`end`, never `left`/`right`.
- **Animation (D10):** Reanimated 4 + Gesture Handler 3 always; **Skia and Lottie are in core** (differs from the recommendation, which was none).
- **Bottom sheets (D11):** `@gorhom/bottom-sheet` 5.
- **Images (D12):** `@d11/react-native-fast-image` behind the `Image` port in `shared/ui/image`.

## Consequences

- Skia and Lottie add native libraries to every build and increase binary size. The size added is measured and recorded in `docs/performance.md`, together with instructions for removing them.
- FastImage's last release was July 2026. The `Image` port keeps a swap to `react-native-nitro-image` to a single file.

## Alternatives considered

- Uniwind or NativeWind: Tailwind classes, a different taste.
- Tamagui 3: compiler and UI kit, much larger surface.
