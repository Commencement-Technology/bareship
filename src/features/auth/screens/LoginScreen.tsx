import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';

import { useTranslation } from '@/shared/i18n';
import {
  Button,
  errorMessage,
  FormTextField,
  Screen,
  Stack,
  Text,
  type TextInputRef,
} from '@/shared/ui';

import { hasErrorCode, useLogin } from '../hooks/useAuthMutations';
import { type LoginInput, LoginInputSchema } from '../schema';

export function LoginScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const passwordRef = useRef<TextInputRef>(null);
  const login = useLogin();
  const { control, handleSubmit } = useForm<LoginInput>({
    resolver: zodResolver(LoginInputSchema),
    defaultValues: { email: '', password: '' },
  });

  const submit = () => {
    handleSubmit(values => login.mutate(values))();
  };
  const failure = login.error
    ? hasErrorCode(login.error, 'invalid_credentials')
      ? t('auth.login.invalidCredentials')
      : errorMessage(login.error, t)
    : null;

  return (
    <Screen scroll testID="login-screen">
      <Stack gap="xs">
        <Text variant="display">{t('auth.login.title')}</Text>
        <Text tone="muted">{t('auth.login.subtitle')}</Text>
      </Stack>

      <Stack gap="lg">
        <FormTextField
          control={control}
          name="email"
          label={t('auth.fields.email')}
          translateError={key => t(key as never)}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="username"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          testID="login-email"
        />
        <FormTextField
          ref={passwordRef}
          control={control}
          name="password"
          label={t('auth.fields.password')}
          translateError={key => t(key as never)}
          secureTextEntry
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={submit}
          testID="login-password"
        />
        {failure ? (
          <Text tone="danger" accessibilityLiveRegion="polite" testID="login-error">
            {failure}
          </Text>
        ) : null}
        <Button
          title={t('auth.login.submit')}
          onPress={submit}
          loading={login.isPending}
          fullWidth
          testID="login-submit"
        />
        <Button
          title={t('auth.login.forgot')}
          variant="ghost"
          onPress={() => navigation.navigate('ForgotPassword')}
        />
      </Stack>

      <Stack gap="sm" align="center">
        <Text tone="muted">{t('auth.login.noAccount')}</Text>
        <Button
          title={t('auth.login.createAccount')}
          variant="secondary"
          onPress={() => navigation.navigate('Register')}
        />
        {__DEV__ ? (
          <Text variant="caption" tone="subtle" align="center">
            {t('auth.login.demoHint')}
          </Text>
        ) : null}
      </Stack>
    </Screen>
  );
}
