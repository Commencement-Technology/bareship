import { backoffDelay, parseRetryAfter } from './retry';

const policy = { maxAttempts: 5, baseDelayMs: 100, maxDelayMs: 1000 };

describe('backoffDelay', () => {
  it('grows exponentially up to the cap, with full jitter', () => {
    expect(backoffDelay(1, policy, undefined, () => 1)).toBe(100);
    expect(backoffDelay(2, policy, undefined, () => 1)).toBe(200);
    expect(backoffDelay(3, policy, undefined, () => 1)).toBe(400);
    expect(backoffDelay(10, policy, undefined, () => 1)).toBe(1000);
    expect(backoffDelay(3, policy, undefined, () => 0)).toBe(0);
    expect(backoffDelay(3, policy, undefined, () => 0.5)).toBe(200);
  });

  it('prefers Retry-After, capped at maxDelayMs', () => {
    expect(backoffDelay(1, policy, 300)).toBe(300);
    expect(backoffDelay(1, policy, 60_000)).toBe(1000);
  });
});

describe('parseRetryAfter', () => {
  it('reads seconds and HTTP dates', () => {
    expect(parseRetryAfter('3')).toBe(3000);
    const now = Date.parse('2026-10-10T10:00:00Z');
    expect(parseRetryAfter('Sat, 10 Oct 2026 10:00:05 GMT', now)).toBe(5000);
  });

  it('ignores missing or invalid values', () => {
    expect(parseRetryAfter(undefined)).toBeUndefined();
    expect(parseRetryAfter('')).toBeUndefined();
    expect(parseRetryAfter('soon')).toBeUndefined();
  });
});
