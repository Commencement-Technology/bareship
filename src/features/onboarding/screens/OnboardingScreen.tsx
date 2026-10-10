import { useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { useTranslation } from '@/shared/i18n';
import { Button, Icon, Screen, Stack, Text } from '@/shared/ui';
import { Layers, Palette, WifiOff } from '@/shared/ui/icons';

import { useOnboarding } from '../onboarding-store';

const SLIDES = [
  { icon: Layers, title: 'onboarding.slide1Title', body: 'onboarding.slide1Body' },
  { icon: WifiOff, title: 'onboarding.slide2Title', body: 'onboarding.slide2Body' },
  { icon: Palette, title: 'onboarding.slide3Title', body: 'onboarding.slide3Body' },
] as const;

/** Three short slides, one at a time (no swipe gesture, so it reads the same in RTL). */
export function OnboardingScreen() {
  const { t } = useTranslation();
  const complete = useOnboarding(state => state.complete);
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index] ?? SLIDES[0];
  const last = index === SLIDES.length - 1;

  return (
    <Screen testID="onboarding-screen">
      <Stack direction="row" justify="flex-end">
        {!last ? (
          <Button title={t('common.skip')} variant="ghost" size="sm" onPress={complete} />
        ) : null}
      </Stack>
      <Animated.View key={index} entering={FadeIn.duration(250)} style={styles.slide}>
        <View style={styles.badge}>
          <Icon icon={slide.icon} size={40} tone="primary" />
        </View>
        <Text variant="title" align="center">
          {t(slide.title)}
        </Text>
        <Text tone="muted" align="center">
          {t(slide.body)}
        </Text>
      </Animated.View>
      <Stack gap="lg">
        <Stack
          direction="row"
          gap="sm"
          justify="center"
          accessibilityLabel={`${index + 1} / ${SLIDES.length}`}
          accessible
        >
          {SLIDES.map((item, dot) => (
            <View key={item.title} style={[styles.dot, dot === index && styles.dotActive]} />
          ))}
        </Stack>
        <Button
          title={last ? t('onboarding.start') : t('common.next')}
          onPress={() => (last ? complete() : setIndex(index + 1))}
          size="lg"
          fullWidth
          testID="onboarding-next"
        />
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create(theme => ({
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.lg },
  badge: {
    width: 96,
    height: 96,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceMuted,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.border },
  dotActive: { width: 24, backgroundColor: theme.colors.primary },
}));
