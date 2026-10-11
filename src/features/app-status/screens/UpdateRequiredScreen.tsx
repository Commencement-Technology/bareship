import { Linking } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { FLAG_DEFAULTS } from '@/shared/config/flags';
import { useTranslation } from '@/shared/i18n';
import { services } from '@/shared/services/services';
import { Download } from '@/shared/ui/icons';
import { Button } from '@/shared/ui/primitives/Button';
import { Icon } from '@/shared/ui/primitives/Icon';
import { Screen } from '@/shared/ui/primitives/Screen';
import { Stack } from '@/shared/ui/primitives/Stack';
import { Text } from '@/shared/ui/primitives/Text';

import { storeUrls } from '../store-url';

/** Shown instead of the app when this version is below Remote Config's `min_supported_version`. */
export function UpdateRequiredScreen() {
  const { t } = useTranslation();
  const { appInfo, flags } = services();
  const urls = storeUrls(
    appInfo.bundleId(),
    flags.getString('ios_app_store_id', FLAG_DEFAULTS.ios_app_store_id),
  );

  const openStore = () => {
    if (!urls) return;
    Linking.openURL(urls.app).catch(() => Linking.openURL(urls.web).catch(() => {}));
  };

  return (
    <Screen testID="update-required">
      <Stack gap="lg" align="center" style={styles.center}>
        <Icon icon={Download} size={40} tone="primary" />
        <Text variant="title" align="center">
          {t('appStatus.updateTitle')}
        </Text>
        <Text tone="muted" align="center">
          {urls ? t('appStatus.updateBody') : t('appStatus.updateBodyNoStore')}
        </Text>
        {urls ? <Button title={t('appStatus.updateAction')} onPress={openStore} fullWidth /> : null}
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center' },
});
