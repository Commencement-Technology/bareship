import { createHttpClient, type HttpClient, type HttpClientConfig } from './client';

let client: HttpClient | undefined;

/** Called once at boot (src/app/boot.ts) with the app's base URL, token store and session hooks. */
export function configureHttp(config: HttpClientConfig): HttpClient {
  client = createHttpClient(config);
  return client;
}

function current(): HttpClient {
  if (!client) throw new Error('HTTP client used before configureHttp() ran. Call boot() first.');
  return client;
}

/** The app's configured client. Feature `api/` modules use this; screens never do. */
export const http: Pick<HttpClient, 'request' | 'get' | 'post' | 'put' | 'patch' | 'delete'> = {
  request: options => current().request(options),
  get: (url, schema, options) => current().get(url, schema, options),
  post: (url, schema, options) => current().post(url, schema, options),
  put: (url, schema, options) => current().put(url, schema, options),
  patch: (url, schema, options) => current().patch(url, schema, options),
  delete: (url, schema, options) => current().delete(url, schema, options),
};
