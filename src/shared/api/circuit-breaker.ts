type State = { failures: number; openedAt: number | null; probing: boolean };

export type CircuitBreakerOptions = {
  /** Consecutive transient failures that open the circuit. */
  failureThreshold: number;
  /** How long the circuit stays open before one probe request is let through, in ms. */
  cooldownMs: number;
  now?: () => number;
};

/**
 * Per-host circuit breaker. After `failureThreshold` consecutive transient failures the host is
 * "open": requests fail immediately for `cooldownMs`, then a single probe decides whether to close
 * it again. Stops a struggling backend from being hammered by retries.
 */
export class CircuitBreaker {
  private readonly hosts = new Map<string, State>();
  private readonly now: () => number;

  constructor(private readonly options: CircuitBreakerOptions) {
    this.now = options.now ?? Date.now;
  }

  /** Returns false when the request must fail fast. */
  allow(host: string): boolean {
    const state = this.state(host);
    if (state.openedAt === null) return true;
    if (this.now() - state.openedAt < this.options.cooldownMs) return false;
    if (state.probing) return false;
    state.probing = true; // half-open: let exactly one request through
    return true;
  }

  recordSuccess(host: string): void {
    this.hosts.set(host, { failures: 0, openedAt: null, probing: false });
  }

  recordFailure(host: string): void {
    const state = this.state(host);
    state.failures += 1;
    if (state.probing || state.failures >= this.options.failureThreshold) {
      state.openedAt = this.now();
      state.probing = false;
    }
  }

  isOpen(host: string): boolean {
    const state = this.state(host);
    return state.openedAt !== null && this.now() - state.openedAt < this.options.cooldownMs;
  }

  private state(host: string): State {
    let state = this.hosts.get(host);
    if (!state) {
      state = { failures: 0, openedAt: null, probing: false };
      this.hosts.set(host, state);
    }
    return state;
  }
}
