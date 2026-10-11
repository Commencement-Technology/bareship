import { Platform } from 'react-native';

import { useSession } from '@/entities/session/session-store';
import { NoContent } from '@/shared/api/client';
import { http } from '@/shared/api/http';
import { services } from '@/shared/services/services';

/**
 * Sends this device's push token to the backend (`POST /devices`) after sign-in and whenever it
 * changes, so the server can push to the signed-in user. There's no token without Firebase or
 * permission, so nothing is sent then. On sign-out the session's auth token is already gone: the
 * backend should drop the session's devices when it handles `/auth/logout`.
 */
export function setupPushRegistration(): () => void {
  const { push, logger } = services();
  let sent: string | null = null;

  const register = async (token?: string) => {
    const value = token ?? (await push.getToken());
    if (!value || value === sent || useSession.getState().status !== 'signedIn') return;
    await http.post('/devices', NoContent, { body: { token: value, platform: Platform.OS } });
    sent = value;
  };
  const registerSafely = (token?: string) =>
    register(token).catch(error =>
      logger.warn('Push token registration failed', { error: String(error) }),
    );

  if (useSession.getState().status === 'signedIn') registerSafely();
  const stopSession = useSession.subscribe((state, previous) => {
    if (state.status === 'signedIn' && previous.status !== 'signedIn') registerSafely();
    if (state.status === 'signedOut') sent = null;
  });
  const stopToken = push.onTokenChange(token => registerSafely(token));
  return () => {
    stopSession();
    stopToken();
  };
}
