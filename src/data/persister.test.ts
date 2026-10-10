import { QueryClient } from '@tanstack/react-query';

import { services } from '@/shared/services/services';

import { clearPersistedQueries, createPersistOptions } from './persister';
import { createQueryClient } from './query-client';

describe('query client defaults', () => {
  it('leaves retries to the HTTP client', () => {
    const client = createQueryClient();
    expect(client.getDefaultOptions().queries?.retry).toBe(false);
    expect(client.getDefaultOptions().mutations?.retry).toBe(false);
  });
});

describe('createPersistOptions', () => {
  it('persists only successful queries that did not opt out', () => {
    const { dehydrateOptions } = createPersistOptions();
    const client = new QueryClient();
    client.setQueryData(['kept'], 1);
    const cache = client.getQueryCache();
    cache.build(client, { queryKey: ['private'], meta: { persist: false } }).setData(2);

    const should = dehydrateOptions!.shouldDehydrateQuery!;
    expect(should(cache.find({ queryKey: ['kept'] })!)).toBe(true);
    expect(should(cache.find({ queryKey: ['private'] })!)).toBe(false);
    client.clear();
  });

  it('writes the cache to MMKV (throttled) and clears it', async () => {
    jest.useFakeTimers();
    const { persister, buster } = createPersistOptions();
    expect(buster).toBe('1:dev');
    await persister.persistClient({
      timestamp: 1,
      buster: buster ?? '',
      clientState: { mutations: [], queries: [] },
    });
    jest.advanceTimersByTime(1100);
    jest.useRealTimers();
    expect(services().kv.getString('query-cache')).toContain('"buster":"1:dev"');
    clearPersistedQueries();
    expect(services().kv.getString('query-cache')).toBeUndefined();
  });
});
