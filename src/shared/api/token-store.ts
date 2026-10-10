import { z } from 'zod';

import type { SecureStore } from '@/shared/ports';

export const TokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});
export type Tokens = z.infer<typeof TokensSchema>;

const KEY = 'session.tokens';

/**
 * Keeps the current tokens in memory (read on every request) and in the SecureStore (survives restarts).
 * Never stored in MMKV or AsyncStorage.
 */
export function createTokenStore(secure: SecureStore) {
  let cached: Tokens | null | undefined;

  return {
    async get(): Promise<Tokens | null> {
      if (cached !== undefined) return cached;
      const raw = await secure.get(KEY);
      const parsed = raw ? TokensSchema.safeParse(safeJson(raw)) : null;
      cached = parsed?.success ? parsed.data : null;
      return cached;
    },
    async set(tokens: Tokens): Promise<void> {
      cached = tokens;
      await secure.set(KEY, JSON.stringify(tokens));
    },
    async clear(): Promise<void> {
      cached = null;
      await secure.remove(KEY);
    },
  };
}

export type TokenStore = ReturnType<typeof createTokenStore>;

function safeJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
