import {
  getInitialNotification,
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  type RemoteMessage,
} from '@react-native-firebase/messaging';

import type { Logger, Push, PushMessage } from '@/shared/ports';

import { createNotifyKitPush } from './notify-kit-push';

const fromRemote = (message: RemoteMessage): PushMessage => ({
  title: message.notification?.title,
  body: message.notification?.body,
  data: Object.fromEntries(
    Object.entries(message.data ?? {}).map(([key, value]) => [key, String(value)]),
  ),
});

/**
 * Remote push through Firebase Cloud Messaging, displayed with notify-kit (ADR 0010). services.ts uses
 * it only when Firebase is set up. On iOS the token also needs an APNs key in Firebase and the
 * `aps-environment` entitlement (IOS_APS_ENVIRONMENT in .env); see docs/going-live.md.
 */
export function createFirebasePush(logger: Logger): Push {
  const local = createNotifyKitPush(logger);
  const messaging = getMessaging();

  // The OS doesn't show FCM notifications while the app is open: show them through notify-kit.
  onMessage(messaging, message => {
    local.showLocal(fromRemote(message)).catch(() => {});
  });

  let initialChecked = false; // once per launch, like the notify-kit adapter

  return {
    ...local,
    getToken: async () => {
      try {
        return await getToken(messaging);
      } catch (error) {
        logger.warn('No push token (permission, APNs setup or network)', { error: String(error) });
        return null;
      }
    },
    onTokenChange: listener => onTokenRefresh(messaging, listener),
    // A tap can come from a notification notify-kit showed, or one the OS showed for FCM.
    initialOpen: async () => {
      const shown = await local.initialOpen();
      if (shown) return shown;
      if (initialChecked) return null;
      initialChecked = true;
      const remote = await getInitialNotification(messaging);
      return remote ? fromRemote(remote) : null;
    },
    onOpen: listener => {
      const stopLocal = local.onOpen(listener);
      const stopRemote = onNotificationOpenedApp(messaging, message =>
        listener(fromRemote(message)),
      );
      return () => {
        stopLocal();
        stopRemote();
      };
    },
  };
}
