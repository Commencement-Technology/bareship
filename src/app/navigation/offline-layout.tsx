import type { ReactElement } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useWaitingWriteCount } from '@/data/offline';
import { OfflineBanner } from '@/shared/ui/offline/Offline';

function OfflineLayout({ children }: { children: ReactElement }) {
  const waiting = useWaitingWriteCount();
  return (
    <View style={styles.root}>
      <OfflineBanner waiting={waiting} />
      {children}
    </View>
  );
}

/**
 * React Navigation `screenLayout` / `layout`: puts the offline banner under the header of every
 * signed-in screen. Screens without a header (auth, onboarding) use `OfflineNotice` instead.
 */
export const offlineLayout = ({ children }: { children: ReactElement }) => (
  <OfflineLayout>{children}</OfflineLayout>
);

const styles = StyleSheet.create({
  root: { flex: 1 },
});
