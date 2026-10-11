import { parseEnv } from './env';

describe('parseEnv', () => {
  it('accepts a complete configuration', () => {
    expect(
      parseEnv({
        APP_ENV: 'staging',
        API_URL: 'https://api.staging.example.com',
        APP_SCHEME: 'myapp-staging',
      }),
    ).toEqual({
      APP_ENV: 'staging',
      API_URL: 'https://api.staging.example.com',
      LOG_LEVEL: 'info',
      API_MOCKS: false,
      APP_SCHEME: 'myapp-staging',
      APP_LINK_DOMAIN: '',
    });
  });

  it('accepts a bare link domain and rejects a URL or a bad scheme', () => {
    const base = { APP_ENV: 'prod', API_URL: 'https://api.example.com', APP_SCHEME: 'myapp' };
    expect(parseEnv({ ...base, APP_LINK_DOMAIN: 'links.example.com' }).APP_LINK_DOMAIN).toBe(
      'links.example.com',
    );
    expect(() => parseEnv({ ...base, APP_LINK_DOMAIN: 'https://links.example.com' })).toThrow(
      /APP_LINK_DOMAIN/,
    );
    expect(() => parseEnv({ ...base, APP_SCHEME: 'My App' })).toThrow(/APP_SCHEME/);
  });

  it('names every missing or invalid key', () => {
    expect(() => parseEnv({ APP_ENV: 'qa', API_URL: 'not a url' })).toThrow(
      /APP_ENV[\s\S]*API_URL/,
    );
  });
});
