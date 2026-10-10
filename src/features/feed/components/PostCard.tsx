import { Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useTranslation } from '@/shared/i18n';
import { formatRelative } from '@/shared/lib/format';
import { Icon, Image, MIN_TOUCH, Text } from '@/shared/ui';
import { Heart } from '@/shared/ui/icons';

import type { Post } from '../schema';

export type PostCardProps = {
  post: Post;
  onPress?: () => void;
  onToggleLike: () => void;
  expanded?: boolean;
};

export function PostCard({ post, onPress, onToggleLike, expanded }: PostCardProps) {
  const { t } = useTranslation();
  const likes = t('feed.likes', { count: post.likeCount });

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={`${post.author.name}. ${post.body}`}
        disabled={!onPress}
        onPress={onPress}
        style={styles.content}
        testID={`post-${post.id}`}
      >
        <View style={styles.header}>
          {post.author.avatarUrl ? (
            <Image uri={post.author.avatarUrl} style={styles.avatar} priority="low" />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text variant="label" tone="muted">
                {post.author.name.slice(0, 1)}
              </Text>
            </View>
          )}
          <View style={styles.meta}>
            <Text variant="label">{post.author.name}</Text>
            <Text variant="caption" tone="muted">
              {formatRelative(post.createdAt)}
            </Text>
          </View>
        </View>
        <Text numberOfLines={expanded ? undefined : 4}>{post.body}</Text>
        {post.imageUrl ? (
          <Image uri={post.imageUrl} style={styles.image} resizeMode="cover" />
        ) : null}
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={post.likedByMe ? t('feed.unlike') : t('feed.like')}
        accessibilityState={{ selected: post.likedByMe }}
        accessibilityValue={{ text: likes }}
        onPress={onToggleLike}
        hitSlop={8}
        style={styles.like}
        testID={`like-${post.id}`}
      >
        <Icon icon={Heart} tone={post.likedByMe ? 'danger' : 'textMuted'} size={20} />
        <Text variant="caption" tone="muted">
          {likes}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create(theme => ({
  card: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  content: { gap: theme.spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  avatar: { width: 40, height: 40, borderRadius: theme.radius.full },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceMuted,
  },
  meta: { flex: 1, gap: theme.spacing.xxs },
  image: { width: '100%', aspectRatio: 16 / 10, borderRadius: theme.radius.md },
  like: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: theme.spacing.xs,
    minHeight: MIN_TOUCH,
  },
}));
