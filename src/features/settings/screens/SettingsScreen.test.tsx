import { screen, userEvent, waitFor } from '@testing-library/react-native';

import { useSession } from '@/entities/session';
import { services } from '@/shared/services/services';
import { signInDemoUser } from '@/test/app';
import { renderWithProviders } from '@/test/render';

import { SettingsScreen } from './SettingsScreen';

describe('SettingsScreen', () => {
  beforeEach(async () => {
    await signInDemoUser();
  });

  it('shows the signed-in user and saves the theme choice', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<SettingsScreen />);
    expect(screen.getByText('demo@example.com')).toBeOnTheScreen();

    await user.press(screen.getByRole('radio', { name: 'Dark' }));
    expect(services().kv.getString('settings.theme')).toBe('dark');
    expect(screen.getByRole('radio', { name: 'Dark' })).toBeSelected();
  });

  it('signs out', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<SettingsScreen />);
    await user.press(screen.getByRole('button', { name: 'Sign out' }));
    await waitFor(() => expect(useSession.getState().status).toBe('signedOut'));
  });

  it('deletes the account after confirmation', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<SettingsScreen />);
    await user.press(screen.getByRole('button', { name: 'Delete account' }));
    await user.press(screen.getByRole('button', { name: 'Delete my account' }));
    await waitFor(() => expect(useSession.getState().status).toBe('signedOut'));
  });
});
