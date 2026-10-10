import * as Keychain from 'react-native-keychain';

import type { SecureStore } from '@/shared/ports';

/**
 * SecureStore on react-native-keychain. Each key is its own Keychain/Keystore "service", readable only
 * while the device is unlocked and never synced to other devices or backups.
 */
export function createKeychainSecureStore(namespace: string): SecureStore {
  const service = (key: string) => `${namespace}.${key}`;
  return {
    async get(key) {
      const credentials = await Keychain.getGenericPassword({ service: service(key) });
      return credentials ? credentials.password : null;
    },
    async set(key, value) {
      const ok = await Keychain.setGenericPassword(key, value, {
        service: service(key),
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
      if (!ok) throw new Error(`SecureStore: could not save "${key}"`);
    },
    async remove(key) {
      await Keychain.resetGenericPassword({ service: service(key) });
    },
  };
}
