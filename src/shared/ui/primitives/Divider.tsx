import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export function Divider({ inset = 0 }: { inset?: number }) {
  return <View style={[styles.divider, { marginStart: inset }]} />;
}

const styles = StyleSheet.create(theme => ({
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: theme.colors.border },
}));
