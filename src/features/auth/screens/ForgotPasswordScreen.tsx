import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';

import { useTranslation } from '@/shared/i18n';
import { Button, Card, errorMessage, FormTextField, Screen, Stack, Text } from '@/shared/ui';

import { useRequestPasswordReset } from '../hooks/useAuthMutations';
import { type ForgotPasswordInput, ForgotPasswordInputSchema } from '../schema';

export function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const reset = useRequestPasswordReset();
  const { control, handleSubmit, getValues } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordInputSchema),
    defaultValues: { email: '' },
  });
  const submit = () => {
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
          <Button
            title={t('auth.forgot.submit')}
            onPress={submit}
            loading={reset.isPending}
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
