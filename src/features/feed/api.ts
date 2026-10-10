import {
  type InfiniteData,
  infiniteQueryOptions,
  type QueryClient,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { type CursorPage, http, nextCursor } from '@/shared/api';
import { i18n } from '@/shared/i18n';
import { preloadImages, toast } from '@/shared/ui';

import { FeedPageSchema, type Post, PostSchema } from './schema';

const PAGE_SIZE = 10;

export const postKeys = {
  all: ['posts'] as const,
  feed: () => [...postKeys.all, 'feed'] as const,
  detail: (id: string) => [...postKeys.all, 'detail', id] as const,
};

export const feedQueryOptions = () =>
  infiniteQueryOptions({
    queryKey: postKeys.feed(),
    queryFn: async ({ pageParam, signal }) => {
      const page = await http.get('/posts', FeedPageSchema, {
        params: { cursor: pageParam, limit: PAGE_SIZE },
        signal,
      });
      preloadImages(page.items.flatMap(post => (post.imageUrl ? [post.imageUrl] : [])));
      return page;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: nextCursor,
    // Cap what is kept in memory and in the persisted cache.
    maxPages: 10,
  });

export const postQueryOptions = (id: string, client?: QueryClient) =>
  queryOptions({
    queryKey: postKeys.detail(id),
    queryFn: ({ signal }) => http.get(`/posts/${encodeURIComponent(id)}`, PostSchema, { signal }),
    // Show the copy already in the feed instantly while the detail loads.
    initialData: () => (client ? findInFeed(client, id) : undefined),
    initialDataUpdatedAt: () => client?.getQueryState(postKeys.feed())?.dataUpdatedAt,
  });

function findInFeed(client: QueryClient, id: string): Post | undefined {
  const feed = client.getQueryData<InfiniteData<CursorPage<Post>>>(postKeys.feed());
  return feed?.pages.flatMap(page => page.items).find(post => post.id === id);
}

/** Applies `update` to every cached copy of a post (feed pages and detail). */
function updatePost(client: QueryClient, id: string, update: (post: Post) => Post) {
  client.setQueryData<InfiniteData<CursorPage<Post>>>(postKeys.feed(), feed =>
    feed
      ? {
          ...feed,
          pages: feed.pages.map(page => ({
            ...page,
            items: page.items.map(post => (post.id === id ? update(post) : post)),
          })),
        }
      : feed,
  );
  client.setQueryData<Post>(postKeys.detail(id), post => (post ? update(post) : post));
}

/**
 * Like / unlike with an optimistic update (offline pattern B in Phase 3):
 * the UI changes instantly, rolls back with a toast on failure, and adopts the server's copy on success.
 */
export function useToggleLike() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ post }: { post: Post }) =>
      post.likedByMe
        ? http.delete(`/posts/${post.id}/like`, PostSchema)
        : http.post(`/posts/${post.id}/like`, PostSchema),
    onMutate: async ({ post }) => {
      await client.cancelQueries({ queryKey: postKeys.all });
      updatePost(client, post.id, current => ({
        ...current,
        likedByMe: !post.likedByMe,
        likeCount: current.likeCount + (post.likedByMe ? -1 : 1),
      }));
      return { previous: post };
    },
    onError: (_error, { post }) => {
      updatePost(client, post.id, () => post);
      toast.error(i18n.t('feed.likeFailed'));
    },
    onSuccess: updated => updatePost(client, updated.id, () => updated),
  });
}
