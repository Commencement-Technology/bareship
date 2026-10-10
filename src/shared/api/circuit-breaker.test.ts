import { CircuitBreaker } from './circuit-breaker';

describe('CircuitBreaker', () => {
  let now = 0;
  const breaker = () =>
    new CircuitBreaker({ failureThreshold: 3, cooldownMs: 1000, now: () => now });

  beforeEach(() => {
    now = 0;
  });

  it('opens after the threshold and stays open during the cooldown', () => {
    const cb = breaker();
    cb.recordFailure('a');
    cb.recordFailure('a');
    expect(cb.allow('a')).toBe(true);
    cb.recordFailure('a');
    expect(cb.isOpen('a')).toBe(true);
    expect(cb.allow('a')).toBe(false);
    expect(cb.allow('b')).toBe(true); // per host
  });

  it('lets one probe through after the cooldown and closes on success', () => {
    const cb = breaker();
    ['a', 'a', 'a'].forEach(host => cb.recordFailure(host));
    now = 1500;
    expect(cb.allow('a')).toBe(true);
    expect(cb.allow('a')).toBe(false); // only one probe at a time
    cb.recordSuccess('a');
    expect(cb.allow('a')).toBe(true);
    expect(cb.isOpen('a')).toBe(false);
  });

  it('reopens if the probe fails', () => {
    const cb = breaker();
    ['a', 'a', 'a'].forEach(host => cb.recordFailure(host));
    now = 1500;
    cb.allow('a');
    cb.recordFailure('a');
    expect(cb.isOpen('a')).toBe(true);
  });
});
