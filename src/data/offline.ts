import {
  type MutationKey,
  useIsMutating,
  useMutation,
  useMutationState,
} from '@tanstack/react-query';

import { type ApiError } from '@/shared/api/errors';
import { createId } from '@/shared/api/id';
import { services } from '@/shared/services/services';

import { queryClient } from './query-client';

/**
 * Offline writes (ADR 0006). Most writes fail fast when offline (the query client's default), and
 * screens disable them (`useIsOnline`). Writes that should survive being offline are *queued*:
 *
 * - they pause while offline and run when the connection returns
 * - paused writes are saved with the query cache, so they also survive the app being killed
 * - every write carries one `idempotencyKey` for all its attempts, so a replay is never applied twice
 * - writes with the same scope run one at a time, in the order they were made
 *
 * Define the write once, at module level, and import that module from src/app/queued-writes.ts:
 * Metro loads modules lazily (inlineRequires), and a write restored after a restart needs its
 * definition registered before the saved cache is restored.
 *
 *   export const useToggleLike = defineQueuedMutation<Post, { postId: string; like: boolean }>({
 *     mutationKey: ['posts', 'like'],
 *     mutationFn: ({ postId, like, idempotencyKey }) => …,
 *     onMutate: …, onError: …, onSuccess: …,
 *   });
 *
 * Variables are saved as JSON: keep them small and plain (ids and flags, not whole models), and
 * do the cache work in these callbacks rather than in the screen, because after a restart the
 * screen that started the write is gone.
 */
export type Queued<TVariables> = TVariables & { idempotencyKey: string };

export type QueuedMutationOptions<TData, TVariables> = {
  /** Names the write in the saved queue. Keep it stable across app versions. */
  mutationKey: MutationKey;
  mutationFn: (variables: Queued<TVariables>) => Promise<TData>;
  /** Writes in one scope run in order, one at a time. Defaults to one scope per mutationKey. */
  scope?: string;
  onMutate?: (variables: Queued<TVariables>) => unknown;
  onError?: (error: ApiError, variables: Queued<TVariables>) => unknown;
  onSuccess?: (data: TData, variables: Queued<TVariables>) => unknown;
};

/** Registers a queued write and returns its hook. Call at module level, never inside a component. */
export function defineQueuedMutation<TData, TVariables extends object>(
  options: QueuedMutationOptions<TData, TVariables>,
) {
  const { mutationKey, mutationFn, scope, onMutate, onError, onSuccess } = options;
  queryClient.setMutationDefaults(mutationKey, {
    mutationFn,
    networkMode: 'online', // pause while offline instead of failing
    scope: { id: scope ?? JSON.stringify(mutationKey) },
    onMutate: variables => onMutate?.(variables as Queued<TVariables>),
    onError: (error, variables) => onError?.(error as ApiError, variables as Queued<TVariables>),
    onSuccess: (data, variables) => onSuccess?.(data as TData, variables as Queued<TVariables>),
  });

  return function useQueuedMutation() {
    const mutation = useMutation<TData, ApiError, Queued<TVariables>>({ mutationKey });
    return {
      ...mutation,
      /** Adds the idempotency key; the write itself (and its retries) happen in the background. */
      mutate: (variables: TVariables) =>
        mutation.mutate({ ...variables, idempotencyKey: createId() }),
    };
  };
}

const isWaiting = (mutation: { state: { isPaused: boolean } }) => mutation.state.isPaused;

/** How many queued writes are waiting for a connection. */
export function useWaitingWriteCount(): number {
  return useIsMutating({ predicate: isWaiting });
}

/** Variables of this write's copies that are waiting for a connection, e.g. to show them as pending. */
export function useWaitingWrites<TVariables>(mutationKey: MutationKey): Array<Queued<TVariables>> {
  return useMutationState({
    filters: { mutationKey, predicate: isWaiting },
    select: mutation => mutation.state.variables as Queued<TVariables>,
  });
}

/**
 * True when another copy of this write (same key, matching variables) is still queued or running.
 * Use it to skip adopting a server response that a later queued write is about to change.
 */
export function hasLaterWrite<TVariables>(
  mutationKey: MutationKey,
  matches: (variables: Queued<TVariables>) => boolean,
): boolean {
  const running = queryClient.getMutationCache().findAll({
    mutationKey,
    status: 'pending',
    predicate: mutation => matches(mutation.state.variables as Queued<TVariables>),
  });
  // The write calling this is itself still pending while its callbacks run.
  return running.length > 1;
}

/**
 * Replays queued writes restored from the saved cache. Call once at startup, after the HTTP client
 * and the session are ready. Each write gets its current definition first; a write with no
 * definition (its module isn't imported from src/app/queued-writes.ts, or it was removed in an app
 * update) is dropped and reported instead of failing with "No mutationFn found".
 */
export async function resumeQueuedWrites(): Promise<void> {
  const cache = queryClient.getMutationCache();
  for (const mutation of cache.getAll()) {
    if (!mutation.state.isPaused) continue;
    const { mutationKey } = mutation.options;
    if (!mutationKey || !queryClient.getMutationDefaults(mutationKey).mutationFn) {
      services().logger.error(
        'Dropped a queued write with no definition. Import its module from src/app/queued-writes.ts.',
        { mutationKey: JSON.stringify(mutationKey ?? null) },
      );
      cache.remove(mutation);
      continue;
    }
    mutation.setOptions(queryClient.defaultMutationOptions({ mutationKey }));
  }
  await queryClient.resumePausedMutations();
}
