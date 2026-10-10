import { screen, userEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/test/render';

import { ShowroomScreen } from './ShowroomScreen';

describe('ShowroomScreen', () => {
  it('renders every primitive with accessible roles', async () => {
    await renderWithProviders(<ShowroomScreen />);
    for (const label of ['Primary', 'Secondary', 'Ghost', 'Loading']) {
      expect(screen.getByRole('button', { name: label })).toBeOnTheScreen();
    }
    expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Loading' })).toBeBusy();
    expect(screen.getAllByRole('header', { name: 'display' })).toHaveLength(1);
    expect(screen.getByText('Enter a valid email address.')).toBeOnTheScreen();
    expect(screen.getByText('Empty state')).toBeOnTheScreen();
  });

  it('toggles password visibility, switches segments and shows a toast', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<ShowroomScreen />);

    await user.press(screen.getByRole('button', { name: 'Show password' }));
    expect(screen.getByRole('button', { name: 'Hide password' })).toBeOnTheScreen();

    await user.press(screen.getByRole('radio', { name: 'Two' }));
    expect(screen.getByRole('radio', { name: 'Two' })).toBeSelected();

    await user.press(screen.getByRole('button', { name: 'Show toast' }));
    expect(await screen.findByText('Saved')).toBeOnTheScreen();
  });
});
