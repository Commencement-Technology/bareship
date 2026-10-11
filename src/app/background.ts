import notifee from 'react-native-notify-kit';

import { isFirebaseConfigured } from '@/shared/adapters/firebase-app';

/**
 * Handlers the OS can call while no screen is mounted (Android runs them as a headless JS task), so
 * index.js registers them before the app. A tap that opens the app is handled by linking.ts through
 * `push.initialOpen()`, so these only need to exist.
 */
notifee.onBackgroundEvent(async () => {});

if (isFirebaseConfigured()) {
  const messaging =
    require('@react-native-firebase/messaging') as typeof import('@react-native-firebase/messaging');
  // Data-only messages while the app is in the background. Add work here (e.g. sync) if you need it.
  messaging.setBackgroundMessageHandler(messaging.getMessaging(), async () => {});
}
