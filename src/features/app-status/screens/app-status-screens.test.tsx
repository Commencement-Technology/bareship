import { screen, userEvent } from '@testing-library/react-native';
import { Linking } from 'react-native';

import { useAppStatus } from '@/entities/app-status/app-status-store';
import { createStaticFlags } from '@/shared/adapters/noop-adapters';
import { setServices } from '@/shared/services/services';
import { renderWithProviders } from '@/test/render';

import { MaintenanceScreen } from './MaintenanceScreen';
import { UpdateRequiredScreen } from './UpdateRequiredScreen';

const appInfo = { version: () => '1.0.0', buildNumber: () => '1', bundleId: () => 'com.acme.shop' };

describe('UpdateRequiredScreen (iOS)', () => {
  it('opens the App Store page when Remote Config has the app id', async () => {
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    setServices({ appInfo, flags: createStaticFlags({ ios_app_store_id: '1234567890' }) });
    const user = userEvent.setup();
    await renderWithProviders(<UpdateRequiredScreen />);

    await user.press(screen.getByRole('button', { name: 'Update' }));
    expect(open).toHaveBeenCalledWith('itms-apps://apps.apple.com/app/id1234567890');
  });

  it('explains where to update when there is no App Store id yet', async () => {
    setServices({ appInfo });
    await renderWithProviders(<UpdateRequiredScreen />);
    expect(screen.getByText(/Update it from the App Store/)).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Update' })).not.toBeOnTheScreen();
  });
});

describe('MaintenanceScreen', () => {
  it('checks again and lets people in once maintenance ends', async () => {
    const values: Record<string, boolean> = { maintenance_mode: true };
    const flags = createStaticFlags(values);
    flags.refresh = jest.fn(async () => {
      values.maintenance_mode = false;
    });
    setServices({ appInfo, flags });
    useAppStatus.getState().evaluate();
    const user = userEvent.setup();
    await renderWithProviders(<MaintenanceScreen />);

    await user.press(screen.getByRole('button', { name: 'Try again' }));
    expect(useAppStatus.getState().status).toBe('ok');
  });
});
