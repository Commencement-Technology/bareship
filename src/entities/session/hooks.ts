import { useMutation } from '@tanstack/react-query';

import { services } from '@/shared/services/services';

import { deleteAccount, logout } from './api';
import { useSession } from './session-store';

/** Ends the session locally right away; tells the server in the background. */
export function useSignOut() {
  const signOut = useSession(state => state.signOut);
  return useMutation({
    mutationFn: async () => {
      logout().catch(error =>
        services().logger.debug('Logout request failed', { error: String(error) }),
      );
      await signOut('user');
    },
  });
}

/** Deletes the account on the server, then clears everything local. */
export function useDeleteAccount() {
  const signOut = useSession(state => state.signOut);
  return useMutation({
    mutationFn: async () => {
      await deleteAccount();
      services().analytics.track('account_deleted');
      await signOut('deleted');
    },
  });
}
