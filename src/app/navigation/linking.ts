import { Linking } from 'react-native';

import { env } from '@/shared/config/env';
import { services } from '@/shared/services/services';

/**
 * Deep links (ADR 0010): the environment's URL scheme (APP_SCHEME, e.g. bareshipapp-dev://post/p_1)
 * and, when APP_LINK_DOMAIN is set, https://<domain>/… (universal links / App Links). Screens declare
 * their paths in RootNavigator.tsx. Native registration: AndroidManifest.xml and the iOS xcconfig.
 *
 * Notification taps open links too: a notification whose `data.link` holds a deep link goes through
 * the same path, including the cold start that the tap caused.
 */
export const linking = {
  enabled: true as const,
  prefixes: [
    `${env.APP_SCHEME}://`,
    ...(env.APP_LINK_DOMAIN ? [`https://${env.APP_LINK_DOMAIN}`] : []),
  ],
  // A link to a deeper screen (post/:id) opens on top of Home, so Back works after a cold start.
  config: { initialRouteName: 'Main' as const },
  async getInitialURL(): Promise<string | null> {
    const url = await Linking.getInitialURL();
    if (url) return url;
    const opened = await services().push.initialOpen();
    return opened?.data.link ?? null;
  },
  subscribe(listener: (url: string) => void): () => void {
    const links = Linking.addEventListener('url', ({ url }) => listener(url));
    const stopPush = services().push.onOpen(message => {
      if (message.data.link) listener(message.data.link);
    });
    return () => {
      links.remove();
      stopPush();
    };
  },
};
