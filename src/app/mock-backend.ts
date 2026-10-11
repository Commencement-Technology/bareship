import type { AxiosAdapter } from 'axios';

let provided: AxiosAdapter | undefined;

/**
 * Demo release builds (`pnpm build:android:demo`) bundle `index.demo.js`, which starts the in-app mock
 * backend and hands its adapter over here before the app renders. Normal entry points never import
 * src/mocks, so staging and production bundles contain no mock code.
 */
export function provideMockAdapter(adapter: AxiosAdapter): void {
  provided = adapter;
}

export function providedMockAdapter(): AxiosAdapter | undefined {
  return provided;
}
