import { create } from 'zustand';

import { FLAG_DEFAULTS } from '@/shared/config/flags';
import { compareVersions } from '@/shared/lib/version';
import { services } from '@/shared/services/services';

/**
 * Whether the app may run (ADR 0010): Remote Config can require an update (`min_supported_version`)
 * or take the app down for maintenance (`maintenance_mode`). Without Firebase the flags keep their
 * defaults and the status stays 'ok'.
 */
export type AppStatus = 'ok' | 'update-required' | 'maintenance';

export function evaluateAppStatus(): AppStatus {
  const { flags, appInfo } = services();
  if (flags.getBoolean('maintenance_mode', FLAG_DEFAULTS.maintenance_mode)) return 'maintenance';
  const minimum = flags.getString('min_supported_version', FLAG_DEFAULTS.min_supported_version);
  return compareVersions(appInfo.version(), minimum) < 0 ? 'update-required' : 'ok';
}

type AppStatusState = {
  status: AppStatus;
  /** Re-reads the flags already activated (cached from the last launch, or defaults). */
  evaluate: () => void;
  /** Fetches the latest flags, then re-evaluates. Resolves even when offline. */
  refresh: () => Promise<void>;
};

export const useAppStatus = create<AppStatusState>(set => ({
  status: 'ok',
  evaluate: () => set({ status: evaluateAppStatus() }),
  refresh: async () => {
    await services().flags.refresh();
    set({ status: evaluateAppStatus() });
  },
}));
