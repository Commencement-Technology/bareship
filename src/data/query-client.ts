import { QueryClient } from '@tanstack/react-query';

const MINUTE = 60_000;

/**
 * One QueryClient for the app. Transport retries live in the HTTP client (backoff, circuit breaker),
 * so TanStack's own retries are off to avoid multiplying them.
 *
 * Offline: queries pause and keep showing cached data. Writes fail fast by default (`networkMode:
 * 'always'`), so a sign-in or a payment never runs later by surprise; only writes defined with
 * `defineQueuedMutation` (./offline.ts) wait for the connection.
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // Must be at least the persister's maxAge, or restored data is collected right away.
        gcTime: 24 * 60 * MINUTE,
        retry: false,
      },
      mutations: { retry: false, networkMode: 'always' },
    },
  });
}

export const queryClient = createQueryClient();
