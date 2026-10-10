/**
 * Ports: the only way app code touches native or vendor capabilities.
 * Track A (bare) and Track B (Expo) provide different adapters for the same ports, and
 * tests swap in fakes. See docs/decisions/0001 and docs/native-changes.md.
 */

/** Small, synchronous key-value storage for preferences and caches. Not for secrets. */
export interface KeyValueStore {
  getString(key: string): string | undefined;
  getBoolean(key: string): boolean | undefined;
  getNumber(key: string): number | undefined;
  set(key: string, value: string | number | boolean): void;
  remove(key: string): void;
  clearAll(): void;
}

/** Encrypted storage backed by the iOS Keychain / Android Keystore. Use for tokens and secrets. */
export interface SecureStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

export type LogContext = Record<string, unknown>;

export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
}

/** Crash and error reporting (Crashlytics in Phase 3). */
export interface CrashReporter {
  recordError(error: unknown, context?: LogContext): void;
  log(message: string): void;
  setUser(userId: string | null): void;
}

/** Product analytics (Firebase Analytics in Phase 3). */
export interface Analytics {
  track(event: string, properties?: Record<string, string | number | boolean>): void;
  screen(name: string): void;
  identify(userId: string | null): void;
}

/** Feature flags and remote config (Firebase Remote Config in Phase 3). */
export interface FeatureFlags {
  getBoolean(key: string, fallback: boolean): boolean;
  getString(key: string, fallback: string): string;
  getNumber(key: string, fallback: number): number;
  /** Fetches and activates the latest values. Resolves even when offline. */
  refresh(): Promise<void>;
}

export type UpdateStatus = 'up-to-date' | 'update-ready' | 'unsupported';

/** Over-the-air JS updates. No provider is configured yet (ADR 0010); the adapter is a no-op. */
export interface Updates {
  check(): Promise<UpdateStatus>;
  /** Restarts into the downloaded update. Only call after check() returned 'update-ready'. */
  apply(): Promise<void>;
}
