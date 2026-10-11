import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  EventType,
  type Notification,
} from 'react-native-notify-kit';

import type { Logger, Push, PushMessage, PushPermission } from '@/shared/ports';

/** Android channel for everything the app shows; FCM uses the same id (firebase.json). */
export const DEFAULT_CHANNEL_ID = 'default';

const toPermission = (status: AuthorizationStatus): PushPermission =>
  status === AuthorizationStatus.AUTHORIZED || status === AuthorizationStatus.PROVISIONAL
    ? 'granted'
    : status === AuthorizationStatus.DENIED
      ? 'denied'
      : 'not-determined';

export const toMessage = (notification: Notification | undefined): PushMessage => ({
  title: notification?.title,
  body: notification?.body,
  data: Object.fromEntries(
    Object.entries(notification?.data ?? {}).map(([key, value]) => [key, String(value)]),
  ),
});

/**
 * Local notifications through react-native-notify-kit: works without Firebase, so the template can
 * show and open notifications before any push setup. `getToken` is null; see the Firebase adapter.
 */
export function createNotifyKitPush(logger: Logger): Push {
  let channel: Promise<string> | undefined;
  const ensureChannel = () =>
    (channel ??= notifee.createChannel({
      id: DEFAULT_CHANNEL_ID,
      name: 'General',
      importance: AndroidImportance.DEFAULT,
    }));

  // The launching tap is reported once per launch: React Navigation can ask again when the navigator
  // remounts (e.g. after the maintenance screen), and must not reopen an old notification.
  let initialChecked = false;

  return {
    permission: async () =>
      toPermission((await notifee.getNotificationSettings()).authorizationStatus),
    requestPermission: async () =>
      toPermission((await notifee.requestPermission()).authorizationStatus),
    getToken: async () => null,
    onTokenChange: () => () => {},
    initialOpen: async () => {
      if (initialChecked) return null;
      initialChecked = true;
      const initial = await notifee.getInitialNotification();
      return initial ? toMessage(initial.notification) : null;
    },
    onOpen: listener =>
      notifee.onForegroundEvent(({ type, detail }) => {
        if (type === EventType.PRESS) listener(toMessage(detail.notification));
      }),
    showLocal: async ({ title, body, data }) => {
      try {
        await notifee.displayNotification({
          title,
          body,
          data,
          android: { channelId: await ensureChannel(), pressAction: { id: 'default' } },
        });
      } catch (error) {
        logger.warn('Could not show a notification', { error: String(error) });
      }
    },
  };
}
