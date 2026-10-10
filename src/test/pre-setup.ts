// Runs before the libraries' own Jest setup files (see jest.config.js `setupFiles`).
//
// Gesture Handler 3 installs UI-runtime bindings on import by calling worklets' getUIRuntimeHolder(),
// which the Jest (web) build of react-native-worklets 0.13 throws on. Jest has no UI runtime, so
// report "none" and let Gesture Handler skip the bindings. Everything else in worklets stays real.
jest.mock('react-native-worklets', () => ({
  ...jest.requireActual('react-native-worklets'),
  getUIRuntimeHolder: () => undefined,
}));
