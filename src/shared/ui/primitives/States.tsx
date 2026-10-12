import { ActivityIndicator, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { isApiError } from '@/shared/api/errors';
import { useTranslation } from '@/shared/i18n';

import { CloudOff, Inbox, type LucideIcon } from '../icons';
import { Button } from './Button';
import { Icon } from './Icon';
import { Text } from './Text';

type StateProps = {
  title: string;
  body?: string;
  icon?: LucideIcon;
  action?: { label: string; onPress: () => void };
};

function StateView({ title, body, icon, action }: StateProps) {
  return (
    <View style={styles.container} aria-live="polite">
      {icon ? <Icon icon={icon} size={32} tone="textSubtle" /> : null}
      <Text variant="heading" align="center">
        {title}
      </Text>
      {body ? (
        <Text tone="muted" align="center">
          {body}
        </Text>
      ) : null}
      {action ? <Button title={action.label} variant="secondary" onPress={action.onPress} /> : null}
    </View>
  );
}

export function EmptyState(props: Omit<StateProps, 'icon'> & { icon?: LucideIcon }) {
  return <StateView icon={Inbox} {...props} />;
}

/** Turns any error into a user-facing message by ApiError kind, with a retry button. */
export function ErrorState({
  error,
  title,
  onRetry,
}: {
  error: unknown;
  title?: string;
  onRetry?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <StateView
      icon={CloudOff}
      title={title ?? t('errors.generic')}
      body={errorMessage(error, t)}
      action={onRetry ? { label: t('common.retry'), onPress: onRetry } : undefined}
    />
  );
}

export function LoadingState() {
  const { theme } = useUnistyles();
  const { t } = useTranslation();
  return (
    <View style={styles.container} aria-label={t('common.loading')} accessible>
      <ActivityIndicator color={theme.colors.primary} />
    </View>
  );
}

export function errorMessage(error: unknown, t: ReturnType<typeof useTranslation>['t']): string {
  if (!isApiError(error)) return t('errors.generic');
  switch (error.kind) {
    case 'network':
      return t('errors.network');
    case 'timeout':
      return t('errors.timeout');
    case 'unauthorized':
      return t('errors.unauthorized');
    case 'validation':
      return t('errors.validation');
    case 'circuit_open':
      return t('errors.circuitOpen');
    default:
      return t('errors.generic');
  }
}

const styles = StyleSheet.create(theme => ({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.xl,
  },
}));
