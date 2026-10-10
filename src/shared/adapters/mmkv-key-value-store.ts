import { createMMKV } from 'react-native-mmkv';

import type { KeyValueStore } from '@/shared/ports';

/** KeyValueStore on MMKV 4 (Nitro). Under Jest, MMKV switches to an in-memory store automatically. */
export function createMmkvKeyValueStore(id = 'app'): KeyValueStore {
  const mmkv = createMMKV({ id });
  return {
    getString: key => mmkv.getString(key),
    getBoolean: key => mmkv.getBoolean(key),
    getNumber: key => mmkv.getNumber(key),
    set: (key, value) => mmkv.set(key, value),
    remove: key => {
      mmkv.remove(key);
    },
    clearAll: () => mmkv.clearAll(),
  };
}
