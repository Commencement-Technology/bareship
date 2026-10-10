import { http as mock, HttpResponse } from 'msw';
import { z } from 'zod';

import { server } from '@/mocks/node';
import { createMemorySecureStore, silentLogger } from '@/test/app';

import { CircuitBreaker } from './circuit-breaker';
import { createHttpClient, NoContent } from './client';
import { ApiError } from './errors';
import { createTokenStore } from './token-store';

const BASE = 'https://api.example.test';
const Ok = z.object({ ok: z.literal(true) });

function setup(overrides: Partial<Parameters<typeof createHttpClient>[0]> = {}) {
  const tokens = createTokenStore(createMemorySecureStore());
  const refreshTokens = jest.fn(async () => ({ accessToken: 'fresh', refreshToken: 'r2' }));
  const onSessionExpired = jest.fn();
  const client = createHttpClient({
    baseURL: BASE,
    tokens,
    logger: silentLogger,
    refreshTokens,
    onSessionExpired,
    getLanguage: () => 'ar',
    wait: async () => {},
    ...overrides,
  });
  return { client, tokens, refreshTokens, onSessionExpired };
}

describe('createHttpClient', () => {
  it('sends the bearer token and Accept-Language, and parses the body', async () => {
    const { client, tokens } = setup();
    await tokens.set({ accessToken: 'abc', refreshToken: 'r1' });
    let seen: Headers | undefined;
    server.use(
      mock.get(`${BASE}/thing`, ({ request }) => {
        seen = request.headers;
        return HttpResponse.json({ ok: true });
      }),
    );

    await expect(client.get('/thing', Ok)).resolves.toEqual({ ok: true });
    expect(seen?.get('authorization')).toBe('Bearer abc');
    expect(seen?.get('accept-language')).toBe('ar');
  });

  it('adds an Idempotency-Key to writes only, and reuses a supplied key', async () => {
    const { client } = setup();
    const keys: Array<string | null> = [];
    server.use(
      mock.all(`${BASE}/thing`, ({ request }) => {
        keys.push(request.headers.get('idempotency-key'));
        return HttpResponse.json({ ok: true });
      }),
    );

    await client.get('/thing', Ok);
    await client.post('/thing', Ok);
    await client.post('/thing', Ok, { idempotencyKey: 'replay-1' });

    expect(keys[0]).toBeNull();
    expect(keys[1]).toMatch(/^[0-9a-f-]{36}$/);
    expect(keys[2]).toBe('replay-1');
  });

  it('rejects a response that does not match its schema', async () => {
    const { client } = setup();
    server.use(mock.get(`${BASE}/thing`, () => HttpResponse.json({ ok: 'yes' })));

    await expect(client.get('/thing', Ok)).rejects.toMatchObject({ kind: 'validation' });
  });

  it('accepts empty 204 responses with NoContent', async () => {
    const { client } = setup();
    server.use(mock.delete(`${BASE}/thing`, () => new HttpResponse(null, { status: 204 })));

    await expect(client.delete('/thing', NoContent)).resolves.toBeUndefined();
  });

  it('retries transient failures with backoff, then succeeds', async () => {
    const wait = jest.fn(async () => {});
    const { client } = setup({ wait });
    let calls = 0;
    server.use(
      mock.get(`${BASE}/flaky`, () => {
        calls += 1;
        return calls < 3 ? HttpResponse.json({}, { status: 503 }) : HttpResponse.json({ ok: true });
      }),
    );

    await expect(client.get('/flaky', Ok)).resolves.toEqual({ ok: true });
    expect(calls).toBe(3);
    expect(wait).toHaveBeenCalledTimes(2);
  });

  it('honours Retry-After on 429', async () => {
    const wait = jest.fn(async () => {});
    const { client } = setup({ wait });
    let calls = 0;
    server.use(
      mock.get(`${BASE}/limited`, () => {
        calls += 1;
        return calls === 1
          ? HttpResponse.json({}, { status: 429, headers: { 'Retry-After': '2' } })
          : HttpResponse.json({ ok: true });
      }),
    );

    await client.get('/limited', Ok);
    expect(wait).toHaveBeenCalledWith(2000);
  });

  it('does not retry client errors and exposes status and code', async () => {
    const { client } = setup();
    let calls = 0;
    server.use(
      mock.post(`${BASE}/thing`, () => {
        calls += 1;
        return HttpResponse.json({ code: 'bad_input', message: 'Nope.' }, { status: 422 });
      }),
    );

    const error = await client.post('/thing', Ok).catch(e => e as ApiError);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ kind: 'http', status: 422, message: 'Nope.' });
    expect((error as ApiError).details.code).toBe('bad_input');
    expect(calls).toBe(1);
  });

  it('gives up after maxAttempts', async () => {
    const { client } = setup({ retry: { maxAttempts: 2, baseDelayMs: 1, maxDelayMs: 1 } });
    let calls = 0;
    server.use(
      mock.get(`${BASE}/down`, () => {
        calls += 1;
        return HttpResponse.json({}, { status: 500 });
      }),
    );

    await expect(client.get('/down', Ok)).rejects.toMatchObject({ kind: 'http', status: 500 });
    expect(calls).toBe(2);
  });

  it('maps a dropped connection to a "network" error', async () => {
    const { client } = setup({ retry: { maxAttempts: 1, baseDelayMs: 1, maxDelayMs: 1 } });
    server.use(mock.get(`${BASE}/offline`, () => HttpResponse.error()));

    await expect(client.get('/offline', Ok)).rejects.toMatchObject({ kind: 'network' });
  });

  it('refreshes once for concurrent 401s, then replays every request', async () => {
    const { client, tokens, refreshTokens } = setup();
    await tokens.set({ accessToken: 'stale', refreshToken: 'r1' });
    server.use(
      mock.get(`${BASE}/me/*`, ({ request }) =>
        request.headers.get('authorization') === 'Bearer fresh'
          ? HttpResponse.json({ ok: true })
          : HttpResponse.json({ code: 'token_expired' }, { status: 401 }),
      ),
    );

    const results = await Promise.all([
      client.get('/me/a', Ok),
      client.get('/me/b', Ok),
      client.get('/me/c', Ok),
    ]);

    expect(results).toEqual([{ ok: true }, { ok: true }, { ok: true }]);
    expect(refreshTokens).toHaveBeenCalledTimes(1);
    expect(refreshTokens).toHaveBeenCalledWith('r1');
    await expect(tokens.get()).resolves.toEqual({ accessToken: 'fresh', refreshToken: 'r2' });
  });

  it('ends the session when the refresh fails', async () => {
    const { client, tokens, onSessionExpired } = setup({
      refreshTokens: jest.fn(async () => {
        throw new Error('refresh rejected');
      }),
    });
    await tokens.set({ accessToken: 'stale', refreshToken: 'r1' });
    server.use(mock.get(`${BASE}/private`, () => HttpResponse.json({}, { status: 401 })));

    await expect(client.get('/private', Ok)).rejects.toMatchObject({ kind: 'unauthorized' });
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
    await expect(tokens.get()).resolves.toBeNull();
  });

  it('does not try to refresh for requests sent without auth', async () => {
    const { client, refreshTokens } = setup();
    server.use(mock.post(`${BASE}/auth/login`, () => HttpResponse.json({}, { status: 401 })));

    await expect(client.post('/auth/login', Ok, { auth: false })).rejects.toMatchObject({
      status: 401,
    });
    expect(refreshTokens).not.toHaveBeenCalled();
  });

  it('opens the circuit after repeated failures and fails fast', async () => {
    const breaker = new CircuitBreaker({ failureThreshold: 2, cooldownMs: 60_000 });
    const { client } = setup({ breaker, retry: { maxAttempts: 1, baseDelayMs: 1, maxDelayMs: 1 } });
    let calls = 0;
    server.use(
      mock.get(`${BASE}/down`, () => {
        calls += 1;
        return HttpResponse.json({}, { status: 503 });
      }),
    );

    await expect(client.get('/down', Ok)).rejects.toMatchObject({ kind: 'http' });
    await expect(client.get('/down', Ok)).rejects.toMatchObject({ kind: 'http' });
    await expect(client.get('/down', Ok)).rejects.toMatchObject({ kind: 'circuit_open' });
    expect(calls).toBe(2);
  });

  it('reports cancelled requests', async () => {
    const { client } = setup();
    server.use(mock.get(`${BASE}/slow`, () => HttpResponse.json({ ok: true })));
    const controller = new AbortController();
    controller.abort();

    await expect(client.get('/slow', Ok, { signal: controller.signal })).rejects.toMatchObject({
      kind: 'cancelled',
    });
  });
});
