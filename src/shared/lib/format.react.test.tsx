import { act, render, screen } from '@testing-library/react-native';

import { changeLanguage, initI18n } from '@/shared/i18n';
import { Text } from '@/shared/ui/primitives/Text';

import { useFormat } from './format';

// The language changes while the app runs. Under the React Compiler, a component calling
// formatRelative(date) directly keeps its cached English text after the switch; useFormat doesn't.
function RelativeTime({ value, now }: { value: string; now: number }) {
  const format = useFormat();
  return <Text testID="time">{format.relative(value, now)}</Text>;
}

describe('useFormat', () => {
  beforeEach(() => {
    initI18n('en');
  });
  afterEach(async () => {
    await act(() => changeLanguage('en'));
  });

  it('re-renders formatted text in the new language after a switch', async () => {
    await render(
      <RelativeTime value="2026-10-08T12:00:00Z" now={Date.parse('2026-10-10T12:00:00Z')} />,
    );
    expect(screen.getByTestId('time')).toHaveTextContent('2 days ago');
    await act(() => changeLanguage('hi'));
    expect(screen.getByTestId('time')).toHaveTextContent('परसों');
  });
});
