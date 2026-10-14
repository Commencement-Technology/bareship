import { render, screen, userEvent } from '@testing-library/react-native';
import { Linking } from 'react-native';

import { useOnboarding } from '@/features/onboarding';

import { App } from './App';

jest.mock('./boot', () => ({
  // The test harness (src/test/app.ts) already configured HTTP and services; just hydrate.
  boot: async () => {
    const { useSession } = require('@/entities/session/session-store');
    require('@/shared/i18n').initI18n('en');
    await useSession.getState().hydrate();
  },
  afterBoot: () => {}, // remote config refresh; not part of this flow
}));

describe('App', () => {
  it('goes from onboarding to sign-in to the home tab', async () => {
    const user = userEvent.setup();
    useOnboarding.getState().reset();
    await render(<App />);

    await user.press(await screen.findByRole('button', { name: 'Next' }));
    await user.press(screen.getByRole('button', { name: 'Next' }));
    await user.press(screen.getByRole('button', { name: 'Get started' }));

    await user.type(await screen.findByLabelText('Email'), 'demo@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.press(screen.getByRole('button', { name: 'Sign in' }));

    // @example-start:app-test-home
    expect(await screen.findByTestId('post-p_1', {}, { timeout: 5000 })).toBeOnTheScreen();
    // @example-end
  });

  it('opens a deep link that arrived while signed out right after sign-in', async () => {
    jest.spyOn(Linking, 'getInitialURL').mockResolvedValue('bareshipapp-dev://settings');
    useOnboarding.getState().complete();
    const user = userEvent.setup();
    await render(<App />);

    await user.type(await screen.findByLabelText('Email'), 'demo@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.press(screen.getByRole('button', { name: 'Sign in' }));

    // The Settings tab (pending link), not the first tab. Tabs render lazily, so it's there only if the
    // link was applied.
    expect(await screen.findByTestId('settings-screen', {}, { timeout: 5000 })).toBeOnTheScreen();
  });
});
