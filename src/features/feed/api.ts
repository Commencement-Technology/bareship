import {
  type InfiniteData,
  infiniteQueryOptions,
  type QueryClient,
  queryOptions,
} from '@tanstack/react-query';

import { defineQueuedMutation, hasLaterWrite, useWaitingWrites } from '@/data/offline';
import { queryClient } from '@/data/query-client';
import { http } from '@/shared/api/http';
import { type CursorPage, nextCursor } from '@/shared/api/pagination';
import { i18n } from '@/shared/i18n';
import { preloadImages } from '@/shared/ui/primitives/Image';
import { toast } from '@/shared/ui/toast/toast-store';

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

export type LikeVariables = { postId: string; like: boolean };

const likeKey = ['posts', 'like'] as const;

const applyLike = (like: boolean) => (post: Post) =>
  post.likedByMe === like
    ? post
    : { ...post, likedByMe: like, likeCount: post.likeCount + (like ? 1 : -1) };

/**
 * Like / unlike: a queued write with an optimistic update (offline pattern B, ADR 0006).
 * The UI changes at once and works offline: the write waits for a connection, survives a restart,
 * and the card shows it as waiting (`useWaitingLikes`). On failure it rolls back with a toast.
 */
export const useToggleLike = defineQueuedMutation<Post, LikeVariables>({
  mutationKey: likeKey,
  mutationFn: ({ postId, like, idempotencyKey }) => {
    const url = `/posts/${encodeURIComponent(postId)}/like`;
    return like
      ? http.post(url, PostSchema, { idempotencyKey })
      : http.delete(url, PostSchema, { idempotencyKey });
  },
  onMutate: async ({ postId, like }) => {
    await queryClient.cancelQueries({ queryKey: postKeys.all });
    updatePost(queryClient, postId, applyLike(like));
  },
  onError: (_error, { postId, like }) => {
    updatePost(queryClient, postId, applyLike(!like));
    toast.error(i18n.t('feed.likeFailed'));
  },
  onSuccess: (updated, { postId }) => {
    // A like then an unlike queued offline: keep the optimistic state until the last one lands.
    if (hasLaterWrite<LikeVariables>(likeKey, variables => variables.postId === postId)) return;
    updatePost(queryClient, updated.id, () => updated);
  },
});

/** Ids of posts whose like is waiting for a connection. */
export function useWaitingLikes(): ReadonlySet<string> {
  const waiting = useWaitingWrites<LikeVariables>(likeKey);
  return new Set(waiting.map(variables => variables.postId));
}
