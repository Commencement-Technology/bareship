import { render, screen } from '@testing-library/react-native';

import { App } from './App';

it('shows the active environment', async () => {
  await render(<App />);
  expect(await screen.findByTestId('env-name')).toHaveTextContent('dev');
});
