/* eslint-disable i18next/no-literal-string -- developer tool, never shipped in release builds */
import { useRef, useState } from 'react';
import { ScrollView } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { env } from '@/shared/config/env';
import { services } from '@/shared/services/services';
import { Heart, Settings } from '@/shared/ui/icons';
import { Button } from '@/shared/ui/primitives/Button';
import { Card } from '@/shared/ui/primitives/Card';
import { Divider } from '@/shared/ui/primitives/Divider';
import { Icon } from '@/shared/ui/primitives/Icon';
import { Input } from '@/shared/ui/primitives/Input';
import { ListItem } from '@/shared/ui/primitives/ListItem';
import { SegmentedControl } from '@/shared/ui/primitives/SegmentedControl';
import { Sheet, type SheetRef } from '@/shared/ui/primitives/Sheet';
import { Skeleton } from '@/shared/ui/primitives/Skeleton';
import { Stack } from '@/shared/ui/primitives/Stack';
import { EmptyState } from '@/shared/ui/primitives/States';
import { Text } from '@/shared/ui/primitives/Text';
import { toast } from '@/shared/ui/toast/toast-store';

/** Every primitive in every state, on device. Registered only in __DEV__ builds. */
export function ShowroomScreen() {
  const [segment, setSegment] = useState<'one' | 'two' | 'three'>('one');
  const sheet = useRef<SheetRef>(null);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Group title="Text">
        {(['display', 'title', 'heading', 'body', 'bodyStrong', 'label', 'caption'] as const).map(
          variant => (
            <Text key={variant} variant={variant}>
              {variant}
            </Text>
          ),
        )}
        <Stack direction="row" gap="md" wrap>
          {(['muted', 'subtle', 'primary', 'danger', 'success'] as const).map(tone => (
            <Text key={tone} tone={tone}>
              {tone}
            </Text>
          ))}
        </Stack>
      </Group>

      <Group title="Button">
        <Button title="Primary" onPress={() => toast.info('Primary pressed')} />
        <Button title="Secondary" variant="secondary" icon={Settings} />
        <Button title="Ghost" variant="ghost" />
        <Button title="Danger" variant="danger" />
        <Button title="Loading" loading />
        <Button title="Disabled" disabled />
      </Group>

      <Group title="Input">
        <Input label="Email" placeholder="you@example.com" />
        <Input label="Password" secureTextEntry hint="At least 8 characters" />
        <Input label="With error" error="Enter a valid email address." />
      </Group>

      <Group title="Controls">
        <SegmentedControl
          aria-label="Example"
          value={segment}
          onChange={setSegment}
          segments={[
            { value: 'one', label: 'One' },
            { value: 'two', label: 'Two' },
            { value: 'three', label: 'Three' },
          ]}
        />
        <Stack direction="row" gap="md">
          <Icon icon={Heart} tone="danger" />
          <Icon icon={Heart} tone="primary" />
          <Icon icon={Heart} tone="textMuted" />
        </Stack>
      </Group>

      <Group title="List">
        <Card style={styles.flush}>
          <ListItem
            title="Navigates"
            subtitle="With chevron"
            icon={Settings}
            chevron
            onPress={() => {}}
          />
          <Divider inset={16} />
          <ListItem title="Danger" tone="danger" onPress={() => {}} />
        </Card>
      </Group>

      <Group title="Notifications">
        <Text tone="muted">
          Shows a local notification that opens a post when tapped (works without Firebase).
        </Text>
        <Button
          title="Send test notification"
          variant="secondary"
          onPress={() => sendTestNotification().catch(() => {})}
          testID="send-test-notification"
        />
      </Group>

      <Group title="Feedback">
        <Skeleton height={14} />
        <Skeleton width="60%" height={14} />
        <Button title="Show toast" variant="secondary" onPress={() => toast.success('Saved')} />
        <Button title="Open sheet" variant="secondary" onPress={() => sheet.current?.present()} />
        <EmptyState title="Empty state" body="Shown when a list has nothing to show." />
      </Group>

      <Sheet ref={sheet}>
        <Text variant="heading">Bottom sheet</Text>
        <Text tone="muted">Sized to its content, dismiss by dragging or tapping outside.</Text>
        <Button title="Close" onPress={() => sheet.current?.dismiss()} />
      </Sheet>
    </ScrollView>
  );
}

/** Asks for permission first if needed; the tap goes through linking.ts like a real push. */
async function sendTestNotification() {
  const { push } = services();
  const allowed =
    (await push.permission()) === 'granted' || (await push.requestPermission()) === 'granted';
  if (!allowed) {
    toast.error('Notifications are off for this app. Turn them on in Settings.');
    return;
  }
  await push.showLocal({
    title: 'Test notification',
    body: 'Tap to open a post.',
    data: { link: `${env.APP_SCHEME}://post/p_2` },
  });
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Stack gap="md">
      <Text variant="heading">{title}</Text>
      {children}
    </Stack>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  root: { flex: 1, backgroundColor: theme.colors.background },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: rt.insets.bottom + theme.spacing.xxl,
    gap: theme.spacing.xxl,
  },
  flush: { padding: 0, gap: 0, overflow: 'hidden' },
}));
