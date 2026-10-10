import { services } from '@/shared/services/services';

import { createTokenStore, type TokenStore } from './token-store';

let store: TokenStore | undefined;

/** The app's token store, on the SecureStore port (Keychain / Keystore). */
export function sessionTokens(): TokenStore {
  store ??= createTokenStore(services().secure);
  return store;
}

/** Test helper. */
export function resetSessionTokens(): void {
  store = undefined;
}
