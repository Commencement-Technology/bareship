// Global Jest setup. Native modules are replaced with deterministic fakes here.
jest.mock('react-native-config', () => ({
  __esModule: true,
  default: {
    APP_ENV: 'dev',
    API_URL: 'https://api.dev.example.com',
    LOG_LEVEL: 'debug',
  },
}));

jest.mock('react-native-bootsplash', () => ({
  __esModule: true,
  default: {
    hide: jest.fn(() => Promise.resolve()),
    isVisible: jest.fn(() => false),
    useHideAnimation: jest.fn(() => ({ container: {}, logo: {}, brand: {} })),
  },
}));

jest.mock(
  'react-native-safe-area-context',
  () => jest.requireActual('react-native-safe-area-context/jest/mock').default,
);
