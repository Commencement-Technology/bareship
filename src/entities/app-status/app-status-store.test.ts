import { createStaticFlags } from '@/shared/adapters/noop-adapters';
import { setServices } from '@/shared/services/services';

import { evaluateAppStatus, useAppStatus } from './app-status-store';

const installed = (version: string) => ({
  version: () => version,
  buildNumber: () => '1',
  bundleId: () => 'com.rntemplate.dev',
});

describe('app status', () => {
  it('is ok with the default flags (no Firebase)', () => {
    setServices({ appInfo: installed('1.0.0') });
    expect(evaluateAppStatus()).toBe('ok');
  });

  it('requires an update below min_supported_version', () => {
    setServices({
      appInfo: installed('1.2.9'),
      flags: createStaticFlags({ min_supported_version: '1.3.0' }),
    });
    expect(evaluateAppStatus()).toBe('update-required');
  });

  it('puts maintenance before the version check', () => {
    setServices({
      appInfo: installed('0.1.0'),
      flags: createStaticFlags({ maintenance_mode: true, min_supported_version: '9.0.0' }),
    });
    expect(evaluateAppStatus()).toBe('maintenance');
  });

  it('refresh fetches the flags, then re-evaluates', async () => {
    const values: Record<string, boolean> = { maintenance_mode: true };
    const flags = createStaticFlags(values);
    flags.refresh = jest.fn(async () => {
      values.maintenance_mode = false; // maintenance ended on the server
    });
    setServices({ appInfo: installed('1.0.0'), flags });

    useAppStatus.getState().evaluate();
    expect(useAppStatus.getState().status).toBe('maintenance');
    await useAppStatus.getState().refresh();
    expect(flags.refresh).toHaveBeenCalled();
    expect(useAppStatus.getState().status).toBe('ok');
  });
});
