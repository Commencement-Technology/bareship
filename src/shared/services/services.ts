import { createConsoleLogger } from '@/shared/adapters/console-logger';
import { createKeychainSecureStore } from '@/shared/adapters/keychain-secure-store';
import { createMmkvKeyValueStore } from '@/shared/adapters/mmkv-key-value-store';
import {
  createLoggingAnalytics,
  createLoggingCrashReporter,
  createNoopUpdates,
  createStaticFlags,
} from '@/shared/adapters/noop-adapters';
import { env } from '@/shared/config/env';
import type {
  Analytics,
  CrashReporter,
  FeatureFlags,
  KeyValueStore,
  Logger,
  SecureStore,
  Updates,
} from '@/shared/ports';

/**
 * Service registry: one place that picks an adapter for every port.
 * App code calls `services()`; tests call `setServices()` with fakes.
 * Phase 3 swaps the logging/no-op adapters for Firebase ones without touching callers.
 */
export type Services = {
  kv: KeyValueStore;
  secure: SecureStore;
  logger: Logger;
  crash: CrashReporter;
  analytics: Analytics;
  flags: FeatureFlags;
  updates: Updates;
};

function createDefaultServices(): Services {
  const logger = createConsoleLogger(env.LOG_LEVEL);
  return {
    kv: createMmkvKeyValueStore(),
    secure: createKeychainSecureStore(`app.${env.APP_ENV}`),
    logger,
    crash: createLoggingCrashReporter(logger),
    analytics: createLoggingAnalytics(logger),
    flags: createStaticFlags(),
    updates: createNoopUpdates(),
  };
}

let current: Services | undefined;

export function services(): Services {
  current ??= createDefaultServices();
  return current;
}

/** Replace some or all services. For tests and for wiring vendor adapters at boot. */
export function setServices(overrides: Partial<Services>): void {
  current = { ...services(), ...overrides };
}

/** Test helper: forget the registry so the next services() call builds fresh adapters. */
export function resetServices(): void {
  current = undefined;
}
