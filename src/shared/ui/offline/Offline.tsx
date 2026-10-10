import { type ReactNode, useEffect } from 'react';
import { AccessibilityInfo, Platform, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useTranslation } from '@/shared/i18n';
import { useIsOnline } from '@/shared/lifecycle/network';

import { WifiOff } from '../icons';
import { Icon } from '../primitives/Icon';
import { EmptyState } from '../primitives/States';
import { Text } from '../primitives/Text';

/**
 * Strip shown under the header while offline. `waiting` is how many queued writes will sync on
 * reconnect (the app layer passes `useWaitingWriteCount()`; shared/ui doesn't know about the queue).
 */
export function OfflineBanner({ waiting = 0 }: { waiting?: number }) {
  const online = useIsOnline();
  const { t } = useTranslation();
  const message = waiting > 0 ? t('offline.pending', { count: waiting }) : t('offline.banner');

  // Android announces the live region; iOS needs an explicit announcement.
  useEffect(() => {
    if (!online && Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility(message);
  }, [online, message]);

  if (online) return null;
  return (
    <View style={styles.banner} accessibilityLiveRegion="polite" testID="offline-banner">
      <Icon icon={WifiOff} size={16} tone="textMuted" />
      <Text variant="caption" tone="muted" style={styles.text}>
        {message}
      </Text>
    </View>
  );
}

/**
 * Offline pattern C: an inline note for a form that needs a connection (sign in, payment).
 * Pair it with `disabled={!useIsOnline()}` on the submit button.
 */
export function OfflineNotice({ message }: { message: string }) {
  const online = useIsOnline();
  if (online) return null;
  return (
    <View style={styles.notice} accessibilityLiveRegion="polite" testID="offline-notice">
      <Icon icon={WifiOff} size={16} tone="textMuted" />
      <Text variant="caption" tone="muted" style={styles.text}>
        {message}
      </Text>
    </View>
  );
}

/** Offline pattern D: replaces content that can't work offline (account deletion, checkout). */
export function OnlineOnly({ children }: { children: ReactNode }) {
  const online = useIsOnline();
  const { t } = useTranslation();
  if (online) return children;
  return (
    <EmptyState
      icon={WifiOff}
      title={t('offline.requiredTitle')}
      body={t('offline.requiredBody')}
    />
  );
}

const styles = StyleSheet.create(theme => ({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceMuted,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceMuted,
  },
  text: { flex: 1 },
}));
