import { Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { MIN_TOUCH } from '../theme/tokens';
import { Text } from './Text';

export type Segment<T extends string> = { value: T; label: string };

export type SegmentedControlProps<T extends string> = {
  segments: ReadonlyArray<Segment<T>>;
  value: T;
  onChange: (value: T) => void;
  'aria-label': string;
};

/** Pick one of a few options. Announced as a radio group. */
export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  'aria-label': ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <View role="radiogroup" aria-label={ariaLabel} style={styles.track}>
      {segments.map(segment => {
        const selected = segment.value === value;
        return (
          <Pressable
            key={segment.value}
            role="radio"
            aria-selected={selected}
            aria-label={segment.label}
            onPress={() => onChange(segment.value)}
            style={[styles.segment, selected && styles.selected]}
          >
            <Text variant="label" tone={selected ? 'default' : 'muted'}>
              {segment.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create(theme => ({
  track: {
    flexDirection: 'row',
    padding: theme.spacing.xxs,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceMuted,
    gap: theme.spacing.xxs,
  },
  segment: {
    flex: 1,
    minHeight: MIN_TOUCH - 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.sm,
  },
  selected: { backgroundColor: theme.colors.surface },
}));
