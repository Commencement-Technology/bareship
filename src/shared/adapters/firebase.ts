import {
  getAnalytics,
  logEvent,
  logScreenView,
  setUserId as setAnalyticsUserId,
} from '@react-native-firebase/analytics';
import {
  getCrashlytics,
  log,
  recordError,
  setUserId as setCrashlyticsUserId,
} from '@react-native-firebase/crashlytics';
import { fetchAndActivate, getRemoteConfig, getValue } from '@react-native-firebase/remote-config';

import type { Analytics, CrashReporter, FeatureFlags, Logger } from '@/shared/ports';

/**
 * Firebase adapters for the crash, analytics and flags ports (ADR 0010). services.ts loads this module
 * only when `isFirebaseConfigured()` (./firebase-app.ts), so apps without a Firebase project never
 * evaluate the Firebase modules.
 */

type FlagValue = string | number | boolean;

export function createFirebaseCrashReporter(logger: Logger): CrashReporter {
  const crashlytics = getCrashlytics();
  return {
    recordError: (error, context) => {
      // Context goes in as a log line just before the report; Crashlytics shows it with the issue.
      if (context) log(crashlytics, JSON.stringify(context));
      recordError(crashlytics, error instanceof Error ? error : new Error(String(error)));
      logger.error(error instanceof Error ? error.message : String(error), context);
    },
    log: message => log(crashlytics, message),
    setUser: userId => {
      setCrashlyticsUserId(crashlytics, userId ?? '').catch(() => {});
    },
  };
}

export function createFirebaseAnalytics(): Analytics {
  const analytics = getAnalytics();
  return {
    // Event names: letters, digits and underscores, up to 40 characters (Firebase's limits).
    track: (event, properties) => logEvent(analytics, event, properties),
    screen: name => {
      logScreenView(analytics, { screen_name: name, screen_class: name }).catch(() => {});
    },
    identify: userId => {
      setAnalyticsUserId(analytics, userId).catch(() => {});
    },
  };
}

/**
 * Remote Config flags. `defaults` are used until the first fetch and when a key isn't set remotely;
 * a key missing from both returns the caller's fallback.
 */
export function createRemoteConfigFlags(
  defaults: Record<string, FlagValue>,
  logger: Logger,
): FeatureFlags {
  const remoteConfig = getRemoteConfig();
  remoteConfig.defaultConfig = defaults;
  // Fetch on every launch in development; Firebase throttles release builds that fetch too often.
  remoteConfig.settings = {
    minimumFetchIntervalMillis: __DEV__ ? 0 : 60 * 60_000,
    fetchTimeoutMillis: 10_000,
  };

  const read = <T extends FlagValue>(key: string, fallback: T): T => {
    const value = getValue(remoteConfig, key);
    if (value.getSource() === 'static') return fallback;
    if (typeof fallback === 'boolean') return value.asBoolean() as T;
    if (typeof fallback === 'number') return value.asNumber() as T;
    return value.asString() as T;
  };

  return {
    getBoolean: read,
    getString: read,
    getNumber: read,
    refresh: async () => {
      try {
        await fetchAndActivate(remoteConfig);
      } catch (error) {
        // Offline or throttled: keep the last activated values.
        logger.warn('Remote Config fetch failed', { error: String(error) });
      }
    },
  };
}
