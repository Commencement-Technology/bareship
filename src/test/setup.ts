// Global Jest setup. Native modules are replaced with deterministic fakes; the MSW mock backend
// (src/mocks) answers HTTP. Each test starts with a fresh database, services and session.
import 'react-native-unistyles/mocks';

// Firebase isn't set up in tests: services() picks the logging adapters (src/shared/adapters/firebase-app.ts).
jest.mock('@react-native-firebase/app', () => ({ getApps: () => [] }));

jest.mock('react-native-device-info', () =>
  require('react-native-device-info/jest/react-native-device-info-mock'),
);

jest.mock('react-native-notify-kit', () => require('react-native-notify-kit/jest-mock'));

jest.mock('react-native-config', () => ({
  __esModule: true,
  default: {
    APP_ENV: 'dev',
    API_URL: 'https://api.test',
    LOG_LEVEL: 'error',
    API_MOCKS: 'false',
    APP_SCHEME: 'bareshipapp-dev',
    APP_LINK_DOMAIN: '',
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
jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock.js'),
);
jest.mock('react-native-keyboard-controller', () =>
  require('react-native-keyboard-controller/jest'),
);
jest.mock('@gorhom/bottom-sheet', () => require('@gorhom/bottom-sheet/mock'));
jest.mock('react-native-localize', () => require('react-native-localize/mock'));

jest.mock('react-native-keychain', () => {
  const store = new Map<string, { username: string; password: string }>();
  return {
    ACCESSIBLE: { WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'AccessibleWhenUnlockedThisDeviceOnly' },
    setGenericPassword: jest.fn(
      async (username: string, password: string, options?: { service?: string }) => {
        store.set(options?.service ?? 'default', { username, password });
        return { service: options?.service, storage: 'mock' };
      },
    ),
    getGenericPassword: jest.fn(async (options?: { service?: string }) => {
      const entry = store.get(options?.service ?? 'default');
      return entry ? { ...entry, service: options?.service, storage: 'mock' } : false;
    }),
    resetGenericPassword: jest.fn(async (options?: { service?: string }) =>
      store.delete(options?.service ?? 'default'),
    ),
    __reset: () => store.clear(),
  };
});

jest.mock('@d11/react-native-fast-image', () => {
  const React = require('react');
  const { Image } = require('react-native');
  const FastImage = (props: object) => React.createElement(Image, props);
  FastImage.priority = { low: 'low', normal: 'normal', high: 'high' };
  FastImage.cacheControl = { immutable: 'immutable', web: 'web', cacheOnly: 'cacheOnly' };
  FastImage.resizeMode = {
    contain: 'contain',
    cover: 'cover',
    stretch: 'stretch',
    center: 'center',
  };
  FastImage.preload = jest.fn();
  return { __esModule: true, default: FastImage };
});

require('react-native-reanimated').setUpTests();

// The app's themes must be registered with the Unistyles mock before any component renders.
require('@/shared/ui/theme/unistyles');

const { server } = require('@/mocks/node');
const { resetDb } = require('@/mocks/db');
const { setMockLatency } = require('@/mocks/helpers');
const { resetTestApp } = require('./app');

beforeAll(() => {
  setMockLatency(0);
  server.listen({ onUnhandledRequest: 'error' });
});

beforeEach(() => {
  resetDb();
  resetTestApp();
});

afterEach(() => {
  server.resetHandlers();
  // Tests that go offline must not leak it into the next test.
  require('@tanstack/react-query').onlineManager.setOnline(true);
  // Query GC timers (gcTime is 24 h in the app) and toast timers would keep Jest alive.
  require('@/data/query-client').queryClient.clear();
  require('@/shared/ui/toast/toast-store').useToastStore.getState().dismiss();
});

afterAll(() => server.close());
