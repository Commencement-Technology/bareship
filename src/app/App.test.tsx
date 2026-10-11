import { render, screen, userEvent } from '@testing-library/react-native';
import { Linking } from 'react-native';

import { useOnboarding } from '@/features/onboarding';

import { App } from './App';

jest.mock('./boot', () => ({
  // The test harness (src/test/app.ts) already configured HTTP and services; just hydrate.
  boot: async () => {
    const { useSession } = require('@/entities/session');
    require('@/shared/i18n').initI18n('en');
    await useSession.getState().hydrate();
  },
  afterBoot: () => {}, // remote config refresh; not part of this flow
}));

describe('App', () => {
  it('goes from onboarding to sign-in to the feed', async () => {
    const user = userEvent.setup();
    useOnboarding.getState().reset();
    await render(<App />);

    await user.press(await screen.findByRole('button', { name: 'Next' }));
    await user.press(screen.getByRole('button', { name: 'Next' }));
    await user.press(screen.getByRole('button', { name: 'Get started' }));

    await user.type(await screen.findByLabelText('Email'), 'demo@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.press(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByTestId('post-p_1', {}, { timeout: 5000 })).toBeOnTheScreen();
  });

  it('opens a deep link that arrived while signed out right after sign-in', async () => {
    jest.spyOn(Linking, 'getInitialURL').mockResolvedValue('rntemplate-dev://post/p_2');
    useOnboarding.getState().complete();
    const user = userEvent.setup();
    await render(<App />);

    await user.type(await screen.findByLabelText('Email'), 'demo@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.press(screen.getByRole('button', { name: 'Sign in' }));

    // The post screen for p_2 (pending link), not the feed.
    expect(await screen.findByTestId('like-p_2', {}, { timeout: 5000 })).toBeOnTheScreen();
    expect(screen.queryByTestId('post-p_1')).not.toBeOnTheScreen();
  });
});
