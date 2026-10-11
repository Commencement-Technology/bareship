import { useNavigation } from '@react-navigation/native';
import { useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { usePushPermission } from '@/entities/push/use-push-permission';
import { useDeleteAccount, useSession, useSignOut } from '@/entities/session';
import { env } from '@/shared/config/env';
import {
  changeLanguage,
  currentLanguage,
  type Language,
  LANGUAGES,
  reloadForDirectionChange,
  useTranslation,
} from '@/shared/i18n';
import {
  Button,
  Divider,
  errorMessage,
  getThemePreference,
  ListItem,
  OnlineOnly,
  SegmentedControl,
  setThemePreference,
  Sheet,
  type SheetRef,
  Stack,
  Text,
  type ThemePreference,
} from '@/shared/ui';
import { Bell, LayoutGrid, LogOut, Trash2 } from '@/shared/ui/icons';

export function SettingsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const user = useSession(state => state.user);
  const signOut = useSignOut();
  const { permission, enable } = usePushPermission();
  const deleteAccount = useDeleteAccount();
  const [theme, setTheme] = useState<ThemePreference>(getThemePreference);
  const [language, setLanguage] = useState<Language>(currentLanguage);
  const deleteSheet = useRef<SheetRef>(null);
  const restartSheet = useRef<SheetRef>(null);

  const onLanguage = async (next: Language) => {
    setLanguage(next);
    const needsRestart = await changeLanguage(next);
    if (needsRestart) restartSheet.current?.present();
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} testID="settings-screen">
      {user ? (
        <View style={styles.profile}>
          <Text variant="heading">{user.name}</Text>
          <Text tone="muted">{user.email}</Text>
        </View>
      ) : null}

      <Section title={t('settings.appearance')}>
        <View style={styles.control}>
          <Text variant="label">{t('settings.theme')}</Text>
          <SegmentedControl
            accessibilityLabel={t('settings.theme')}
            value={theme}
            onChange={value => {
              setTheme(value);
              setThemePreference(value);
            }}
            segments={[
              { value: 'system', label: t('settings.themeSystem') },
              { value: 'light', label: t('settings.themeLight') },
              { value: 'dark', label: t('settings.themeDark') },
            ]}
          />
        </View>
        <Divider />
        <View style={styles.control}>
          <Text variant="label">{t('settings.language')}</Text>
          <SegmentedControl
            accessibilityLabel={t('settings.language')}
            value={language}
            onChange={onLanguage}
            segments={(Object.keys(LANGUAGES) as Language[]).map(code => ({
              value: code,
              label: LANGUAGES[code].label,
            }))}
          />
        </View>
      </Section>

      <Section title={t('settings.notifications')}>
        <ListItem
          title={t('settings.notifications')}
          subtitle={permission === 'denied' ? t('settings.notificationsBlockedHint') : undefined}
          icon={Bell}
          value={
            permission === 'granted'
              ? t('settings.notificationsOn')
              : permission === 'denied'
                ? t('settings.notificationsBlocked')
                : t('settings.notificationsOff')
          }
          onPress={permission === 'granted' ? undefined : () => enable().catch(() => {})}
          testID="settings-notifications"
        />
      </Section>

      <Section title={t('settings.about')}>
        <ListItem
          title={t('settings.environment')}
          trailing={<Text tone="muted">{env.APP_ENV}</Text>}
        />
        {__DEV__ ? (
          <>
            <Divider inset={16} />
            <ListItem
              title={t('settings.showroom')}
              icon={LayoutGrid}
              chevron
              onPress={() => navigation.navigate('Showroom')}
            />
          </>
        ) : null}
      </Section>

      <Section title={t('settings.account')}>
        <ListItem
          title={t('settings.signOut')}
          icon={LogOut}
          onPress={() => signOut.mutate()}
          testID="sign-out"
        />
        <Divider inset={16} />
        <ListItem
          title={t('settings.deleteAccount')}
          icon={Trash2}
          tone="danger"
          onPress={() => deleteSheet.current?.present()}
        />
      </Section>

      <Sheet ref={deleteSheet}>
        {/* Offline pattern D: deleting an account can't be queued, so the sheet explains why. */}
        <OnlineOnly>
          <Text variant="heading">{t('settings.deleteTitle')}</Text>
          <Text tone="muted">{t('settings.deleteBody')}</Text>
          {deleteAccount.error ? (
            <Text tone="danger">{errorMessage(deleteAccount.error, t)}</Text>
          ) : null}
          <Button
            title={t('settings.deleteConfirm')}
            variant="danger"
            loading={deleteAccount.isPending}
            onPress={() => deleteAccount.mutate()}
            fullWidth
          />
        </OnlineOnly>
        <Stack gap="sm">
          <Button
            title={t('common.cancel')}
            variant="secondary"
            onPress={() => deleteSheet.current?.dismiss()}
            fullWidth
          />
        </Stack>
      </Sheet>

      <Sheet ref={restartSheet}>
        <Text variant="heading">{t('settings.restartTitle')}</Text>
        <Text tone="muted">{t('settings.restartBody')}</Text>
        <Button
          title={t('common.continue')}
          onPress={() => {
            if (!reloadForDirectionChange()) restartSheet.current?.dismiss();
          }}
          fullWidth
        />
      </Sheet>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="caption" tone="muted" style={styles.sectionTitle}>
        {title.toUpperCase()}
      </Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  root: { flex: 1, backgroundColor: theme.colors.background },
  content: {
    paddingVertical: theme.spacing.lg,
    paddingBottom: rt.insets.bottom + theme.spacing.xl,
    gap: theme.spacing.xl,
  },
  profile: { paddingHorizontal: theme.spacing.lg, gap: theme.spacing.xxs },
  section: { gap: theme.spacing.sm },
  sectionTitle: { paddingHorizontal: theme.spacing.lg, letterSpacing: 0.6 },
  sectionBody: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  control: { padding: theme.spacing.lg, gap: theme.spacing.sm },
}));
