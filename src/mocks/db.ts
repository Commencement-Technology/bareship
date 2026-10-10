/** In-memory data for the mock backend. Deterministic, so tests and screenshots are stable. */

export type UserRecord = {
  id: string;
  email: string;
  name: string;
  password: string;
  avatar_url: string | null;
};
export type PostRecord = {
  id: string;
  author_id: string;
  body: string;
  image_url: string | null;
  like_count: number;
  created_at: string;
};

const BODIES = [
  'Shipped the new onboarding flow today. Three screens, zero config.',
  'Offline-first is a product decision before it is an engineering one.',
  'Reminder: cursor pagination stays correct while new posts arrive.',
  'Tried the dark theme on an OLED screen at night. Worth it.',
  'Small PRs, frequent releases, fewer surprises.',
  'The best loading state is the one your users never see.',
  'Wrote the ADR before the code. Review took five minutes.',
  'Right-to-left layouts: use start and end, never left and right.',
];

const AUTHORS: UserRecord[] = [
  {
    id: 'u_demo',
    email: 'demo@example.com',
    name: 'Demo User',
    password: 'password123',
    avatar_url: 'https://i.pravatar.cc/150?u=demo',
  },
  {
    id: 'u_ada',
    email: 'ada@example.com',
    name: 'Ada Lovelace',
    password: 'password123',
    avatar_url: 'https://i.pravatar.cc/150?u=ada',
  },
  {
    id: 'u_grace',
    email: 'grace@example.com',
    name: 'Grace Hopper',
    password: 'password123',
    avatar_url: 'https://i.pravatar.cc/150?u=grace',
  },
  {
    id: 'u_alan',
    email: 'alan@example.com',
    name: 'Alan Turing',
    password: 'password123',
    avatar_url: null,
  },
];

const START = Date.parse('2026-10-10T09:00:00Z');

function seedPosts(): PostRecord[] {
  return Array.from({ length: 60 }, (_, index) => ({
    id: `p_${index + 1}`,
    author_id: AUTHORS[index % AUTHORS.length]!.id,
    body: BODIES[index % BODIES.length]!,
    image_url:
      index % 3 === 0 ? `https://picsum.photos/seed/rn-template-${index + 1}/800/500` : null,
    like_count: (index * 7) % 23,
    created_at: new Date(START - index * 47 * 60_000).toISOString(),
  }));
}

export const ACCESS_TOKEN_TTL_MS = 2 * 60_000;

export function createDb() {
  return {
    users: AUTHORS.map(user => ({ ...user })),
    posts: seedPosts(),
    /** postId → userIds who liked it */
    likes: new Map<string, Set<string>>(),
    /**
     * Refresh tokens already used or signed out. Tokens themselves carry the user id and expiry
     * (see handlers.ts), so a session saved in the Keychain survives a JS reload or relaunch.
     */
    revokedTokens: new Set<string>(),
    /** Idempotency-Key → response body, so a replayed write returns the first result. */
    idempotency: new Map<string, Record<string, unknown>>(),
  };
}

export type Db = ReturnType<typeof createDb>;

export const db: { current: Db } = { current: createDb() };

export function resetDb() {
  db.current = createDb();
}
