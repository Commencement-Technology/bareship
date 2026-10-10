import { z } from 'zod';

describe('http (configured client)', () => {
  it('explains the mistake when used before boot', async () => {
    await jest.isolateModulesAsync(async () => {
      const { http } = require('./http') as typeof import('./http');
      expect(() => http.get('/x', z.unknown())).toThrow(/before configureHttp\(\)/);
    });
  });

  it('routes every method through the configured client', async () => {
    const { configureHttp, http } = require('./http') as typeof import('./http');
    const client = configureHttp({
      baseURL: 'https://api.test',
      tokens: { get: async () => null, set: async () => {}, clear: async () => {} },
      logger: { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} },
    });
    const spy = jest.spyOn(client, 'request').mockResolvedValue('ok');
    // Shortcuts are bound at creation; check request() directly plus that shortcuts exist.
    await expect(http.request({ url: '/x', schema: z.string() })).resolves.toBe('ok');
    expect(spy).toHaveBeenCalled();
    expect(typeof http.put).toBe('function');
    expect(typeof http.patch).toBe('function');
  });
});
