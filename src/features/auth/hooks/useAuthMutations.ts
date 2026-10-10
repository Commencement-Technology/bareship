import { useMutation } from '@tanstack/react-query';

import { useSession } from '@/entities/session';
import { isApiError } from '@/shared/api';
import { services } from '@/shared/services/services';

import { login, register, requestPasswordReset } from '../api';

export function useLogin() {
  const signIn = useSession(state => state.signIn);
  return useMutation({
    mutationFn: login,
    onSuccess: async session => {
      await signIn(session);
      services().analytics.track('login');
    },
  });
}

export function useRegister() {
  const signIn = useSession(state => state.signIn);
  return useMutation({
    mutationFn: register,
    onSuccess: async session => {
      await signIn(session);
      services().analytics.track('sign_up');
    },
  });
}

export function useRequestPasswordReset() {
  return useMutation({ mutationFn: requestPasswordReset });
}

/** True when the server rejected the request with this error code (e.g. "invalid_credentials"). */
export function hasErrorCode(error: unknown, code: string): boolean {
  return isApiError(error) && error.details.code === code;
}
