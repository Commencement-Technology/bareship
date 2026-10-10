import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import type { spacing } from '../theme/tokens';

export type StackProps = ViewProps & {
  children?: ReactNode;
  direction?: 'column' | 'row';
  gap?: keyof typeof spacing;
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between';
  wrap?: boolean;
};

/** Lays out children with consistent gaps. Rows follow the reading direction (RTL-safe). */
export function Stack({
  direction = 'column',
  gap = 'md',
  align,
  justify,
  wrap,
  style,
  ...rest
}: StackProps) {
  return <View style={[styles.stack(direction, gap, align, justify, wrap), style]} {...rest} />;
}

const styles = StyleSheet.create(theme => ({
  stack: (
    direction: 'column' | 'row',
    gap: keyof typeof spacing,
    align?: StackProps['align'],
    justify?: StackProps['justify'],
    wrap?: boolean,
  ) => ({
    flexDirection: direction,
    gap: theme.spacing[gap],
    alignItems: align,
    justifyContent: justify,
    flexWrap: wrap ? 'wrap' : 'nowrap',
  }),
}));
