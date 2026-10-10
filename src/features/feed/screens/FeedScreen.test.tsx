import { screen, userEvent, waitFor, within } from '@testing-library/react-native';
import { http as mock, HttpResponse } from 'msw';

import { server } from '@/mocks/node';
import { signInDemoUser } from '@/test/app';
import { renderWithProviders } from '@/test/render';

import { FeedScreen } from './FeedScreen';

describe('FeedScreen', () => {
  beforeEach(async () => {
    await signInDemoUser();
  });

  it('shows skeletons, then the first page of posts mapped from the API', async () => {
    await renderWithProviders(<FeedScreen />);
    expect(screen.getByTestId('feed-loading')).toBeOnTheScreen();

    const first = await screen.findByTestId('post-p_1');
    // display_name (snake_case DTO) → author.name (model)
    expect(within(first).getByText('Demo User')).toBeOnTheScreen();
  });

  it('likes a post optimistically and keeps the server result', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<FeedScreen />);
    const like = await screen.findByTestId('like-p_2');
    expect(like).toHaveAccessibleName('Like');
    expect(within(like).getByText('7 likes')).toBeOnTheScreen();

    await user.press(like);

    await waitFor(() => expect(screen.getByTestId('like-p_2')).toHaveAccessibleName('Unlike'));
    expect(within(screen.getByTestId('like-p_2')).getByText('8 likes')).toBeOnTheScreen();
  });

  it('rolls back a failed like and tells the user', async () => {
    server.use(mock.post('*/posts/:id/like', () => HttpResponse.json({}, { status: 400 })));
    const user = userEvent.setup();
    await renderWithProviders(<FeedScreen />);
    await user.press(await screen.findByTestId('like-p_2'));

    expect(await screen.findByText("Couldn't save your like. Try again.")).toBeOnTheScreen();
    expect(within(screen.getByTestId('like-p_2')).getByText('7 likes')).toBeOnTheScreen();
  });

  it('shows an error with retry when the first load fails', async () => {
    server.use(mock.get('*/posts', () => HttpResponse.json({}, { status: 404 })));
    const user = userEvent.setup();
    await renderWithProviders(<FeedScreen />);

    expect(await screen.findByText("Couldn't load the feed")).toBeOnTheScreen();
    server.resetHandlers();
    await user.press(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByTestId('post-p_1')).toBeOnTheScreen();
  });
});
