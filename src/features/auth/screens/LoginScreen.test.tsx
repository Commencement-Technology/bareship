import { screen, userEvent, waitFor } from '@testing-library/react-native';

import { useSession } from '@/entities/session';
import { renderWithProviders } from '@/test/render';

import { LoginScreen } from './LoginScreen';

async function signIn(email: string, password: string) {
  const user = userEvent.setup();
  await renderWithProviders(<LoginScreen />);
  await user.type(screen.getByLabelText('Email'), email);
  await user.type(screen.getByLabelText('Password'), password);
  await user.press(screen.getByRole('button', { name: 'Sign in' }));
}

describe('LoginScreen', () => {
  it('signs in with valid credentials (email is trimmed and lower-cased)', async () => {
    await signIn(' Demo@Example.com', 'password123');
    await waitFor(() => expect(useSession.getState().status).toBe('signedIn'));
    expect(useSession.getState().user?.email).toBe('demo@example.com');
  });

  it('shows the server message for wrong credentials', async () => {
    await signIn('demo@example.com', 'wrong-password');
    expect(
      await screen.findByText("That email and password don't match. Try again."),
    ).toBeOnTheScreen();
    expect(useSession.getState().status).toBe('signedOut');
  });

  it('validates the form before calling the server', async () => {
    await signIn('not-an-email', 'short');
    expect(await screen.findByText('Enter a valid email address.')).toBeOnTheScreen();
    expect(screen.getByText('Use at least 8 characters.')).toBeOnTheScreen();
  });
});
