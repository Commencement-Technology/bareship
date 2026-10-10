import { z } from 'zod';

/**
 * Cursor pagination: the default for feeds, because it stays correct while items are inserted or
 * deleted (offset pagination skips or repeats items). The server returns `nextCursor: null` at the end.
 */
export function cursorPageSchema<Item extends z.ZodTypeAny>(item: Item) {
  return z.object({ items: z.array(item), nextCursor: z.string().nullable() });
}

export type CursorPage<T> = { items: T[]; nextCursor: string | null };

/** For useInfiniteQuery: `getNextPageParam: nextCursor`. */
export const nextCursor = <T>(page: CursorPage<T>): string | undefined =>
  page.nextCursor ?? undefined;
