import FastImage, { type FastImageProps } from '@d11/react-native-fast-image';
import { StyleSheet, withUnistyles } from 'react-native-unistyles';

/**
 * Image port (ADR 0008). Everything renders images through this component, so swapping the
 * library (nitro-image, or expo-image in Track B) is a one-file change.
 * Memory + disk cached; `priority` maps to the loader's request priority.
 */
export type ImageProps = Omit<FastImageProps, 'source'> & {
  uri: string;
  priority?: 'low' | 'normal' | 'high';
  accessibilityLabel?: string;
};

const ThemedFastImage = withUnistyles(FastImage);

export function Image({
  uri,
  priority = 'normal',
  style,
  accessibilityLabel,
  ...rest
}: ImageProps) {
  return (
    <ThemedFastImage
      source={{
        uri,
        priority: FastImage.priority[priority],
        cache: FastImage.cacheControl.immutable,
      }}
      accessible={Boolean(accessibilityLabel)}
      accessibilityLabel={accessibilityLabel}
      style={[styles.image, style]}
      {...rest}
    />
  );
}

/** Warm the cache for images the user is about to see (next page, next screen). */
export function preloadImages(uris: string[]) {
  FastImage.preload(uris.map(uri => ({ uri })));
}

const styles = StyleSheet.create(theme => ({
  image: { backgroundColor: theme.colors.surfaceMuted },
}));
