import { useEffect } from 'react';
import type { DimensionValue } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

export type SkeletonProps = { width?: DimensionValue; height?: number; radius?: number };

/** Placeholder block that pulses while content loads (static when Reduce Motion is on). */
export function Skeleton({ width = '100%', height = 16, radius = 6 }: SkeletonProps) {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    opacity.value = withRepeat(withTiming(0.45, { duration: 800 }), -1, true);
    return () => cancelAnimation(opacity);
  }, [opacity, reduceMotion]);

  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View
      aria-hidden
      style={[styles.block, { width, height, borderRadius: radius }, animated]}
    />
  );
}

const styles = StyleSheet.create(theme => ({
  block: { backgroundColor: theme.colors.skeleton },
}));
