import axios, {
  type AxiosAdapter,
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
} from 'axios';
import { z } from 'zod';

import type { Logger } from '@/shared/ports';

import { CircuitBreaker } from './circuit-breaker';
import { ApiError } from './errors';
import { createId } from './id';
import {
  backoffDelay,
  DEFAULT_RETRY_POLICY,
  parseRetryAfter,
  type RetryPolicy,
  sleep,
} from './retry';
import type { Tokens, TokenStore } from './token-store';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
const SAFE_METHODS = new Set<Method>(['GET']);

export type RequestOptions<S extends z.ZodType> = {
  method?: Method;
  url: string;
  /** Validates and types the response body. Use `NoContent` for empty responses. */
  schema: S;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  /** Send the access token (default true). Auth endpoints set false. */
  auth?: boolean;
  /** Reuse a key when replaying a queued write so the server can de-duplicate it. */
  idempotencyKey?: string;
  signal?: AbortSignal;
  timeoutMs?: number;
  /** Upload progress, 0–1 (XHR transport). */
  onUploadProgress?: (fraction: number) => void;
};

export type HttpClientConfig = {
  baseURL: string;
  tokens: TokenStore;
  logger: Logger;
  timeoutMs?: number;
  retry?: RetryPolicy;
  breaker?: CircuitBreaker;
  /** Exchanges a refresh token for new tokens. The client guarantees one call at a time. */
  refreshTokens?: (refreshToken: string) => Promise<Tokens>;
  /** Called once when a refresh fails: the session is over and the user must sign in again. */
  onSessionExpired?: () => void;
  /** Sent as Accept-Language. */
  getLanguage?: () => string;
  /** Injected for tests. */
  wait?: (ms: number) => Promise<void>;
  /** Custom transport, e.g. the in-app mock backend in development (src/mocks/native.ts). */
  adapter?: AxiosAdapter;
};

/** Accepts the empty bodies of 204 responses. */
export const NoContent = z.unknown().transform(() => undefined);

/**
 * HTTP client used by every feature's `api/` module. On top of axios it adds:
 * - Zod validation of every response (`ApiError` kind "validation" on mismatch)
 * - an `Idempotency-Key` on every write, so retried and replayed writes are safe
 * - retries with exponential backoff and jitter for transient failures (GETs, and writes with a key)
 * - a per-host circuit breaker that fails fast while a backend is down
 * - single-flight token refresh on 401: concurrent 401s share one refresh, then replay
 * - one error type, `ApiError`, with a `kind` screens can branch on
 */
export function createHttpClient(config: HttpClientConfig) {
  const retry = config.retry ?? DEFAULT_RETRY_POLICY;
  const breaker = config.breaker ?? new CircuitBreaker({ failureThreshold: 5, cooldownMs: 30_000 });
  const wait = config.wait ?? sleep;
  const instance: AxiosInstance = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeoutMs ?? 15_000,
    headers: { Accept: 'application/json' },
    adapter: config.adapter,
  });

  let refreshing: Promise<boolean> | null = null;

  /** Refreshes the tokens once, however many requests ask at the same time. */
  function refreshSession(): Promise<boolean> {
    refreshing ??= (async () => {
      const current = await config.tokens.get();
      if (!current || !config.refreshTokens) return false;
      try {
        await config.tokens.set(await config.refreshTokens(current.refreshToken));
        return true;
      } catch (error) {
        config.logger.warn('Session refresh failed', { error: describe(error) });
        await config.tokens.clear();
        config.onSessionExpired?.();
        return false;
      }
    })().finally(() => {
      refreshing = null;
    });
    return refreshing;
  }

  async function send<S extends z.ZodType>(options: RequestOptions<S>, idempotencyKey?: string) {
    const headers: Record<string, string> = {};
    if (options.auth !== false) {
      const tokens = await config.tokens.get();
      if (tokens) headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
    const language = config.getLanguage?.();
    if (language) headers['Accept-Language'] = language;

    return instance.request({
      method: options.method ?? 'GET',
      url: options.url,
      data: options.body,
      params: options.params,
      headers,
      signal: options.signal,
      timeout: options.timeoutMs,
      onUploadProgress: options.onUploadProgress
        ? event => event.total && options.onUploadProgress?.(event.loaded / event.total)
        : undefined,
    });
  }

  async function request<S extends z.ZodType>(options: RequestOptions<S>): Promise<z.output<S>> {
    const method = options.method ?? 'GET';
    const idempotencyKey = SAFE_METHODS.has(method)
      ? undefined
      : (options.idempotencyKey ?? createId());
    const retryable = SAFE_METHODS.has(method) || idempotencyKey !== undefined;
    const host = hostOf(options.url, config.baseURL);
    let refreshed = false;

    for (let attempt = 1; ; attempt++) {
      if (!breaker.allow(host)) {
        throw new ApiError(
          'circuit_open',
          `Requests to ${host} are paused after repeated failures.`,
          {
            method,
            url: options.url,
          },
        );
      }

      let response: AxiosResponse;
      try {
        response = await send(options, idempotencyKey);
      } catch (cause) {
        const error = toApiError(cause, method, options.url);

        if (error.status === 401 && options.auth !== false && !refreshed) {
          refreshed = true;
          if (await refreshSession()) {
            attempt--; // a refreshed replay doesn't count as a retry
            continue;
          }
          throw new ApiError(
            'unauthorized',
            'Your session has expired. Sign in again.',
            error.details,
          );
        }

        if (error.isTransient) breaker.recordFailure(host);
        else if (error.kind === 'http') breaker.recordSuccess(host); // the server answered

        if (
          !retryable ||
          !error.isTransient ||
          attempt >= retry.maxAttempts ||
          options.signal?.aborted
        ) {
          throw error;
        }
        const delay = backoffDelay(attempt, retry, parseRetryAfter(retryAfterOf(cause)));
        config.logger.debug(`Retrying ${method} ${options.url} in ${delay} ms`, {
          attempt,
          kind: error.kind,
        });
        await wait(delay);
        continue;
      }

      breaker.recordSuccess(host);
      const parsed = options.schema.safeParse(response.data);
      if (!parsed.success) {
        config.logger.error(`Unexpected response shape from ${method} ${options.url}`, {
          issues: parsed.error.issues.slice(0, 5),
        });
        throw ApiError.validation(parsed.error, options.url);
      }
      return parsed.data;
    }
  }

  type Shortcut = <S extends z.ZodType>(
    url: string,
    schema: S,
    options?: Omit<RequestOptions<S>, 'url' | 'schema' | 'method'>,
  ) => Promise<z.output<S>>;
  const shortcut =
    (method: Method): Shortcut =>
    (url, schema, options) =>
      request({ ...options, method, url, schema });

  return {
    request,
    get: shortcut('GET'),
    post: shortcut('POST'),
    put: shortcut('PUT'),
    patch: shortcut('PATCH'),
    delete: shortcut('DELETE'),
    breaker,
    /** Escape hatch for transports the wrapper doesn't cover (multipart uploads, downloads). */
    axios: instance,
  };
}

export type HttpClient = ReturnType<typeof createHttpClient>;

function toApiError(cause: unknown, method: string, url: string): ApiError {
  if (cause instanceof ApiError) return cause;
  if (axios.isCancel(cause))
    return new ApiError('cancelled', 'The request was cancelled.', { method, url });
  if (!axios.isAxiosError(cause)) {
    return new ApiError('unknown', describe(cause), { method, url, cause });
  }
  const error = cause as AxiosError<{ message?: string; code?: string }>;
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return new ApiError('timeout', 'The server took too long to respond.', { method, url, cause });
  }
  if (!error.response) {
    return new ApiError('network', 'No connection. Check your network and try again.', {
      method,
      url,
      cause,
    });
  }
  const { status, data } = error.response;
  return new ApiError('http', data?.message ?? `Request failed with status ${status}.`, {
    status,
    code: data?.code,
    method,
    url,
    body: data,
  });
}

function retryAfterOf(cause: unknown): unknown {
  return axios.isAxiosError(cause) ? cause.response?.headers?.['retry-after'] : undefined;
}

/** Host of an absolute URL, or of the base URL for relative paths. Avoids RN's partial URL class. */
function hostOf(url: string, baseURL: string): string {
  const absolute = /^https?:\/\//i.test(url) ? url : baseURL;
  return /^https?:\/\/([^/?#]+)/i.exec(absolute)?.[1]?.toLowerCase() ?? 'unknown';
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
