import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';

import { useTranslation } from '@/shared/i18n';
import { useIsOnline } from '@/shared/lifecycle/network';
import {
  Button,
  Card,
  errorMessage,
  FormTextField,
  OfflineNotice,
  Screen,
  Stack,
  Text,
} from '@/shared/ui';

import { useRequestPasswordReset } from '../hooks/useAuthMutations';
import { type ForgotPasswordInput, ForgotPasswordInputSchema } from '../schema';

export function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const reset = useRequestPasswordReset();
  const online = useIsOnline();
  const { control, handleSubmit, getValues } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordInputSchema),
    defaultValues: { email: '' },
  });
  const submit = () => {
    if (!online) return; // offline pattern C
    handleSubmit(values => reset.mutate(values))();
  };

  return (
    <Screen scroll>
      <Stack gap="xs">
        <Text variant="display">{t('auth.forgot.title')}</Text>
        <Text tone="muted">{t('auth.forgot.subtitle')}</Text>
      </Stack>
      {reset.isSuccess ? (
        <Card>
          <Text accessibilityLiveRegion="polite">
            {t('auth.forgot.sent', { email: getValues('email') })}
          </Text>
        </Card>
      ) : (
        <Stack gap="lg">
          <FormTextField
            control={control}
            name="email"
            label={t('auth.fields.email')}
            translateError={key => t(key as never)}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            returnKeyType="send"
            onSubmitEditing={submit}
          />
          {reset.error ? <Text tone="danger">{errorMessage(reset.error, t)}</Text> : null}
          <OfflineNotice message={t('offline.resetBlocked')} />
          <Button
            title={t('auth.forgot.submit')}
            onPress={submit}
            loading={reset.isPending}
            disabled={!online}
            fullWidth
          />
        </Stack>
      )}
      <Button
        title={t('auth.forgot.backToSignIn')}
        variant="ghost"
        onPress={() => navigation.goBack()}
      />
    </Screen>
  );
}
