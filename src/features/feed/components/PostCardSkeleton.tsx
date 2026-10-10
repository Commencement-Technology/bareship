import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Skeleton } from '@/shared/ui';

export function PostCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Skeleton width={40} height={40} radius={20} />
        <View style={styles.meta}>
          <Skeleton width="40%" height={14} />
          <Skeleton width="25%" height={12} />
        </View>
      </View>
      <Skeleton height={14} />
      <Skeleton width="80%" height={14} />
    </View>
  );
}

const styles = StyleSheet.create(theme => ({
  card: { padding: theme.spacing.lg, gap: theme.spacing.md, backgroundColor: theme.colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  meta: { flex: 1, gap: theme.spacing.xs },
}));
