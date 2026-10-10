import { QueryClient } from '@tanstack/react-query';

const MINUTE = 60_000;

/**
 * One QueryClient for the app. Transport retries live in the HTTP client (backoff, circuit breaker),
 * so TanStack's own retries are off to avoid multiplying them.
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
      mutations: { retry: false },
    },
  });
}

export const queryClient = createQueryClient();
