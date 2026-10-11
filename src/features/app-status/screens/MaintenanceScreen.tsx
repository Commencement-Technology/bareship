import { useState } from 'react';
import { StyleSheet } from 'react-native-unistyles';

import { useAppStatus } from '@/entities/app-status/app-status-store';
import { useTranslation } from '@/shared/i18n';
import { Wrench } from '@/shared/ui/icons';
import { Button } from '@/shared/ui/primitives/Button';
import { Icon } from '@/shared/ui/primitives/Icon';
import { Screen } from '@/shared/ui/primitives/Screen';
import { Stack } from '@/shared/ui/primitives/Stack';
import { Text } from '@/shared/ui/primitives/Text';

/** Shown instead of the app while Remote Config's `maintenance_mode` is on. */
export function MaintenanceScreen() {
  const { t } = useTranslation();
  const refresh = useAppStatus(state => state.refresh);
  const [checking, setChecking] = useState(false);

  const retry = () => {
    setChecking(true);
    refresh().finally(() => setChecking(false));
  };

  return (
    <Screen testID="maintenance">
      <Stack gap="lg" align="center" style={styles.center}>
        <Icon icon={Wrench} size={40} tone="primary" />
        <Text variant="title" align="center">
          {t('appStatus.maintenanceTitle')}
        </Text>
        <Text tone="muted" align="center">
          {t('appStatus.maintenanceBody')}
        </Text>
        <Button
          title={t('appStatus.retry')}
          variant="secondary"
          onPress={retry}
          loading={checking}
          fullWidth
        />
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center' },
});
