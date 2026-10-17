import { render, screen } from '@testing-library/react-native';
import { UnistylesRuntime } from 'react-native-unistyles';

import { ChevronRight, Heart } from '../icons';
import { Icon } from './Icon';

// No shipped language is right-to-left, so these tests switch the (mocked) runtime to RTL to keep
// mirroring working for apps that add one (ADR 0017).
const runtime = UnistylesRuntime as unknown as { rtl: boolean };

async function mirrored(ui: Parameters<typeof render>[0]) {
  await render(ui);
  const svg = screen.toJSON() as { props: { style?: unknown } } | null;
  return JSON.stringify(svg?.props.style ?? null).includes('"scaleX":-1');
}

describe('Icon in right-to-left layouts', () => {
  afterEach(() => {
    runtime.rtl = false;
  });

  it('mirrors directional icons (arrows, chevrons) when the layout is RTL', async () => {
    runtime.rtl = true;
    expect(await mirrored(<Icon icon={ChevronRight} directional />)).toBe(true);
  });

  it('never mirrors icons that have no direction', async () => {
    runtime.rtl = true;
    expect(await mirrored(<Icon icon={Heart} />)).toBe(false);
  });

  it('leaves directional icons alone in left-to-right layouts', async () => {
    expect(await mirrored(<Icon icon={ChevronRight} directional />)).toBe(false);
  });
});
