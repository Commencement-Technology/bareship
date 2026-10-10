import { createMemorySecureStore } from '@/test/app';

import { createId } from './id';
import { createTokenStore } from './token-store';

describe('createTokenStore', () => {
  it('saves, reads back across instances, and clears', async () => {
    const secure = createMemorySecureStore();
    const first = createTokenStore(secure);
    await first.set({ accessToken: 'a', refreshToken: 'r' });

    const second = createTokenStore(secure);
    await expect(second.get()).resolves.toEqual({ accessToken: 'a', refreshToken: 'r' });

    await second.clear();
    await expect(createTokenStore(secure).get()).resolves.toBeNull();
  });

  it('treats corrupt stored data as signed out', async () => {
    const secure = createMemorySecureStore();
    await secure.set('session.tokens', '{not json');
    await expect(createTokenStore(secure).get()).resolves.toBeNull();
  });
});

describe('createId', () => {
  it('produces v4-shaped ids without crypto.randomUUID', () => {
    const original = globalThis.crypto;
    Object.defineProperty(globalThis, 'crypto', { value: undefined, configurable: true });
    try {
      expect(createId()).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
    } finally {
      Object.defineProperty(globalThis, 'crypto', { value: original, configurable: true });
    }
  });
});
