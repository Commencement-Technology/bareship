import { useCallback, useEffect, useState } from 'react';
import { AppState, Linking } from 'react-native';

import type { PushPermission } from '@/shared/ports';
import { services } from '@/shared/services/services';

/**
 * Notification permission for settings rows and prompts. Re-reads it when the app returns to the
 * foreground, because people change it in the system settings.
 */
export function usePushPermission() {
  const [permission, setPermission] = useState<PushPermission | 'unknown'>('unknown');

  const read = useCallback(() => {
    services()
      .push.permission()
      .then(setPermission)
      .catch(() => setPermission('not-determined'));
  }, []);

  useEffect(() => {
    read();
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') read();
    });
    return () => subscription.remove();
  }, [read]);

  /** Prompts while the OS still allows it; once denied, only the system settings can turn it on. */
  const enable = useCallback(async (): Promise<PushPermission> => {
    if (permission === 'denied') {
      await Linking.openSettings();
      return 'denied';
    }
    const next = await services().push.requestPermission();
    setPermission(next);
    return next;
  }, [permission]);

  return { permission, enable };
}
