export type RetryPolicy = {
  /** Total attempts including the first. */
  maxAttempts: number;
  /** Delay before the first retry, in ms. Doubles on each retry. */
  baseDelayMs: number;
  /** Upper bound for any single delay, in ms. */
  maxDelayMs: number;
};

export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 3,
  baseDelayMs: 400,
  maxDelayMs: 8000,
};

/**
 * Exponential backoff with "full jitter": a random delay between 0 and the exponential cap.
 * Spreads retries from many clients so a recovering server isn't hit in lockstep.
 * `retryAfterMs` (from a Retry-After header) wins when present.
 */
export function backoffDelay(
  attempt: number,
  policy: RetryPolicy = DEFAULT_RETRY_POLICY,
  retryAfterMs?: number,
  random: () => number = Math.random,
): number {
  if (retryAfterMs !== undefined && retryAfterMs >= 0)
    return Math.min(retryAfterMs, policy.maxDelayMs);
  const cap = Math.min(policy.maxDelayMs, policy.baseDelayMs * 2 ** (attempt - 1));
  return Math.round(random() * cap);
}

/** Parses Retry-After as seconds or an HTTP date. */
export function parseRetryAfter(header: unknown, now: number = Date.now()): number | undefined {
  if (typeof header !== 'string' || header.trim() === '') return undefined;
  const seconds = Number(header);
  if (Number.isFinite(seconds)) return seconds * 1000;
  const date = Date.parse(header);
  return Number.isNaN(date) ? undefined : Math.max(0, date - now);
}

export const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));
