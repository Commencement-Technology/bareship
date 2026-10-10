import type { ZodError } from 'zod';

export type ApiErrorKind =
  | 'network' // no response: offline, DNS, TLS
  | 'timeout'
  | 'cancelled'
  | 'unauthorized' // 401 after a refresh attempt, or no session
  | 'http' // any other non-2xx response
  | 'validation' // response body didn't match its schema
  | 'circuit_open' // too many recent failures for this host; failing fast
  | 'unknown';

/** The only error type the data layer throws. Screens branch on `kind`, never on axios internals. */
export class ApiError extends Error {
  override readonly name = 'ApiError';

  constructor(
    readonly kind: ApiErrorKind,
    message: string,
    readonly details: {
      status?: number;
      code?: string;
      method?: string;
      url?: string;
      body?: unknown;
      cause?: unknown;
    } = {},
  ) {
    super(message);
  }

  get status(): number | undefined {
    return this.details.status;
  }

  /** True for failures worth retrying: transport problems, 408, 429 and 5xx. */
  get isTransient(): boolean {
    if (this.kind === 'network' || this.kind === 'timeout') return true;
    const status = this.details.status;
    return (
      this.kind === 'http' &&
      status !== undefined &&
      (status === 408 || status === 429 || status >= 500)
    );
  }

  static validation(error: ZodError, url?: string): ApiError {
    return new ApiError('validation', 'The server response did not match the expected shape.', {
      url,
      body: error.issues,
    });
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
