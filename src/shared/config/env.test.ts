import { parseEnv } from './env';

describe('parseEnv', () => {
  it('accepts a complete configuration', () => {
    expect(parseEnv({ APP_ENV: 'staging', API_URL: 'https://api.staging.example.com' })).toEqual({
      APP_ENV: 'staging',
      API_URL: 'https://api.staging.example.com',
      LOG_LEVEL: 'info',
      API_MOCKS: false,
    });
  });

  it('names every missing or invalid key', () => {
    expect(() => parseEnv({ APP_ENV: 'qa', API_URL: 'not a url' })).toThrow(
      /APP_ENV[\s\S]*API_URL/,
    );
  });
});
