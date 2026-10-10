import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import type { PersistQueryClientOptions } from '@tanstack/react-query-persist-client';

import { env } from '@/shared/config/env';
import { services } from '@/shared/services/services';

/** Bump when a cached response shape changes incompatibly; old caches are then discarded. */
export const QUERY_CACHE_VERSION = '1';
const STORAGE_KEY = 'query-cache';

/**
 * Persists successful queries to MMKV so a cold start renders the last data immediately, then
 * revalidates (stale-while-revalidate). Opt a query out with `meta: { persist: false }`.
 */
export function createPersistOptions(): Omit<PersistQueryClientOptions, 'queryClient'> {
  const { kv } = services();
  return {
    persister: createSyncStoragePersister({
      storage: {
        getItem: key => kv.getString(key) ?? null,
        setItem: (key, value) => kv.set(key, value),
        removeItem: key => kv.remove(key),
      },
      key: STORAGE_KEY,
      throttleTime: 1000,
    }),
    maxAge: 24 * 60 * 60_000,
    buster: `${QUERY_CACHE_VERSION}:${env.APP_ENV}`,
    dehydrateOptions: {
      shouldDehydrateQuery: query =>
        query.state.status === 'success' && query.meta?.persist !== false,
    },
  };
}

export function clearPersistedQueries(): void {
  services().kv.remove(STORAGE_KEY);
}
