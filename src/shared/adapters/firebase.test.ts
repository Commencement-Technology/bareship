import { resetServices, services } from '@/shared/services/services';

const crashlytics = { name: 'crashlytics' };
const analytics = { name: 'analytics' };
const remoteConfig: { defaultConfig?: unknown; settings?: unknown } = {};
const remoteValues: Record<string, { source: string; raw: string }> = {};

jest.mock('@react-native-firebase/crashlytics', () => ({
  getCrashlytics: () => crashlytics,
  log: jest.fn(),
  recordError: jest.fn(),
  setUserId: jest.fn(async () => null),
}));
jest.mock('@react-native-firebase/analytics', () => ({
  getAnalytics: () => analytics,
  logEvent: jest.fn(),
  logScreenView: jest.fn(async () => {}),
  setUserId: jest.fn(async () => {}),
}));
jest.mock('@react-native-firebase/messaging', () => ({
  getMessaging: () => ({ name: 'messaging' }),
  getToken: jest.fn(async () => 'fcm-token'),
  onMessage: jest.fn(() => () => {}),
  onTokenRefresh: jest.fn(() => () => {}),
  onNotificationOpenedApp: jest.fn(() => () => {}),
  getInitialNotification: jest.fn(async () => null),
}));
jest.mock('@react-native-firebase/remote-config', () => ({
  getRemoteConfig: () => remoteConfig,
  fetchAndActivate: jest.fn(async () => true),
  getValue: (_config: unknown, key: string) => {
    const value = remoteValues[key] ?? { source: 'static', raw: '' };
    return {
      getSource: () => value.source,
      asBoolean: () => value.raw === 'true',
      asNumber: () => Number(value.raw),
      asString: () => value.raw,
    };
  },
}));

const firebaseApp = jest.requireMock<{ getApps: jest.Mock }>('@react-native-firebase/app');
const crash = jest.requireMock<{ log: jest.Mock; recordError: jest.Mock }>(
  '@react-native-firebase/crashlytics',
);
const events = jest.requireMock<{ logEvent: jest.Mock; logScreenView: jest.Mock }>(
  '@react-native-firebase/analytics',
);
const config = jest.requireMock<{ fetchAndActivate: jest.Mock }>(
  '@react-native-firebase/remote-config',
);

describe('Firebase adapters', () => {
  beforeEach(() => {
    firebaseApp.getApps = jest.fn(() => [{ name: '[DEFAULT]' }]);
    resetServices();
  });

  afterEach(() => {
    firebaseApp.getApps = jest.fn(() => []);
    resetServices();
  });

  it('are used when the native app started Firebase', () => {
    const { crash: reporter, analytics: tracker } = services();
    reporter.recordError(new Error('boom'), { screen: 'Feed' });
    tracker.track('like_post', { post_id: 'p_1' });
    tracker.screen('Feed');

    expect(crash.log).toHaveBeenCalledWith(crashlytics, '{"screen":"Feed"}');
    expect(crash.recordError).toHaveBeenCalledWith(crashlytics, new Error('boom'));
    expect(events.logEvent).toHaveBeenCalledWith(analytics, 'like_post', { post_id: 'p_1' });
    expect(events.logScreenView).toHaveBeenCalledWith(analytics, {
      screen_name: 'Feed',
      screen_class: 'Feed',
    });
  });

  it('use FCM for push tokens', async () => {
    await expect(services().push.getToken()).resolves.toBe('fcm-token');
  });

  it('wrap non-Error values so Crashlytics gets a stack', () => {
    services().crash.recordError('plain string');
    expect(crash.recordError).toHaveBeenLastCalledWith(crashlytics, new Error('plain string'));
  });

  it('read Remote Config values, defaults, then the caller fallback', async () => {
    remoteValues.maintenance_mode = { source: 'remote', raw: 'true' };
    remoteValues.min_supported_version = { source: 'default', raw: '0.0.0' };
    const { flags } = services();

    expect(remoteConfig.defaultConfig).toMatchObject({ maintenance_mode: false });
    expect(flags.getBoolean('maintenance_mode', false)).toBe(true);
    expect(flags.getString('min_supported_version', '9.9.9')).toBe('0.0.0');
    expect(flags.getNumber('not_defined_anywhere', 42)).toBe(42);
    await flags.refresh();
    expect(config.fetchAndActivate).toHaveBeenCalledWith(remoteConfig);
  });

  it('keep the last values when a fetch fails (offline)', async () => {
    config.fetchAndActivate.mockRejectedValueOnce(new Error('offline'));
    await expect(services().flags.refresh()).resolves.toBeUndefined();
  });
});

describe('without Firebase', () => {
  it('fall back to logging adapters and the flag defaults', () => {
    resetServices();
    const { flags } = services();
    expect(flags.getBoolean('maintenance_mode', true)).toBe(false); // FLAG_DEFAULTS wins over fallback
    expect(crash.recordError).not.toHaveBeenCalledWith(crashlytics, new Error('never'));
  });
});
