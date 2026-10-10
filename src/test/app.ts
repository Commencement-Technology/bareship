import { queryClient } from '@/data/query-client';
import { refreshTokens, useSession } from '@/entities/session';
import { configureHttp, resetSessionTokens, sessionTokens } from '@/shared/api';
import type { SecureStore } from '@/shared/ports';
import { resetServices, setServices } from '@/shared/services/services';

/** In-memory SecureStore for tests. */
export function createMemorySecureStore(): SecureStore {
  const values = new Map<string, string>();
  return {
    get: async key => values.get(key) ?? null,
    set: async (key, value) => {
      values.set(key, value);
    },
    remove: async key => {
      values.delete(key);
    },
  };
}

export const silentLogger = { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} };

/** Fresh services, token store, session and HTTP client, as boot() would set them up. */
export function resetTestApp() {
  resetServices();
  resetSessionTokens();
  setServices({ secure: createMemorySecureStore(), logger: silentLogger });
  // services() built a fresh in-memory MMKV mock; start from an empty one anyway.
  require('@/shared/services/services').services().kv.clearAll();
  queryClient.clear();
  // Unmounting after each test schedules GC timers (24 h for queries); with Infinity none are scheduled,
  // so Jest can exit. Tests never rely on garbage collection.
  queryClient.setDefaultOptions({
    queries: { ...queryClient.getDefaultOptions().queries, gcTime: Infinity },
    mutations: { ...queryClient.getDefaultOptions().mutations, gcTime: Infinity },
  });
  useSession.setState({ status: 'signedOut', user: null });
  configureHttp({
    baseURL: 'https://api.test',
    tokens: sessionTokens(),
    logger: silentLogger,
    refreshTokens,
    onSessionExpired: () => {
      useSession.getState().signOut('expired');
    },
    getLanguage: () => 'en',
    wait: async () => {}, // no real backoff delays in tests
  });
}

/** Signs in the demo user through the real login endpoint. */
export async function signInDemoUser() {
  const { login } = require('@/features/auth/api') as typeof import('@/features/auth/api');
  const session = await login({ email: 'demo@example.com', password: 'password123' });
  await useSession.getState().signIn(session);
  return session;
}
