import { type StaticScreenProps } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ScrollView } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { z } from 'zod';

import { useTranslation } from '@/shared/i18n';
import { ErrorState, LoadingState } from '@/shared/ui/primitives/States';

import { postQueryOptions, useToggleLike, useWaitingLikes } from '../api';
import { PostCard } from '../components/PostCard';

// Params can arrive from a deep link, so validate them like any other input.
const ParamsSchema = z.object({ id: z.string().min(1) });

export type PostScreenProps = StaticScreenProps<{ id: string }>;

export function PostScreen({ route }: PostScreenProps) {
  const { t } = useTranslation();
  const client = useQueryClient();
  const params = ParamsSchema.safeParse(route.params);
  const id = params.success ? params.data.id : '';
  const post = useQuery({ ...postQueryOptions(id, client), enabled: params.success });
  const toggleLike = useToggleLike();
  const waitingLikes = useWaitingLikes();

  if (!params.success) return <ErrorState error={params.error} />;
  if (post.isPending) return <LoadingState />;
  if (post.isError) return <ErrorState error={post.error} onRetry={() => post.refetch()} />;

  return (
    <ScrollView
      style={styles.root}
      contentInsetAdjustmentBehavior="automatic"
      aria-label={t('feed.postTitle')}
    >
      <PostCard
        post={post.data}
        expanded
        onToggleLike={() => toggleLike.mutate({ postId: post.data.id, like: !post.data.likedByMe })}
        likePending={waitingLikes.has(post.data.id)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create(theme => ({
  root: { flex: 1, backgroundColor: theme.colors.background },
}));
