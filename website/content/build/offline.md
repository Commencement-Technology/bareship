---
title: Offline
description: "Choose what each write does without a connection, and how saved data and queued writes behave."
---

Every write in the app picks what happens when the phone is offline, so users always know what became of what
they did. Reading works offline too: the app shows the last data it saved.

## What users see

| Pattern | Without a connection | Use it for |
| --- | --- | --- |
| A | The change appears at once and is sent later, without comment | Low-stakes toggles |
| B | The change appears at once, marked "Waiting to sync" until it's sent | Likes, comments, edits |
| C | The form is disabled, with a note saying why | Sign-in, registration, payments |
| D | The content is replaced by an offline message | Account deletion, checkout |

While the phone is offline, a banner under the header says so, and counts the changes waiting to sync.

Writes queued with A or B:

- are saved, so they survive the app being closed or killed, and are sent on the next launch
- are sent in the order they were made, one at a time per kind of write
- carry one `Idempotency-Key` for every attempt, so a write sent twice is applied once

## Choose a pattern

- Can the change wait, and would losing it annoy the user? Queue it: **B**, or **A** if it's too small to
  mention.
- Does it need an answer from the server before the user can continue (signing in, paying)? **C**.
- Is it destructive or final, so it must not run later by surprise? **D**.

A write with no pattern fails at once when offline, and the screen shows the error. That's the default for a
mutation hook, including the ones `pnpm gen endpoint` writes.

## Queue a write (A and B)

Define the write once, at module level, with `defineQueuedMutation`. This example marks a task done:

```ts
// src/features/tasks/api.ts
import { defineQueuedMutation, hasLaterWrite, useWaitingWrites } from '@/data/offline';
import { queryClient } from '@/data/query-client';
import { http } from '@/shared/api/http';
import { i18n } from '@/shared/i18n';
import { toast } from '@/shared/ui/toast/toast-store';

// Task, TaskSchema, taskKeys and updateTask are the feature's own model, schema, query keys and cache helper.
const doneKey = ['tasks', 'done'] as const;

export const useSetDone = defineQueuedMutation<Task, { taskId: string; done: boolean }>({
  mutationKey: doneKey,
  mutationFn: ({ taskId, done, idempotencyKey }) =>
    http.put(`/tasks/${encodeURIComponent(taskId)}/done`, TaskSchema, {
      body: { done },
      idempotencyKey,
    }),
  // Show the change at once.
  onMutate: async ({ taskId, done }) => {
    await queryClient.cancelQueries({ queryKey: taskKeys.all });
    updateTask(queryClient, taskId, task => ({ ...task, done }));
  },
  // Undo it and tell the user if the server refuses.
  onError: (_error, { taskId, done }) => {
    updateTask(queryClient, taskId, task => ({ ...task, done: !done }));
    toast.error(i18n.t('tasks.saveFailed'));
  },
  // Adopt the server's copy, unless another change to the same task is still queued.
  onSuccess: (task, { taskId }) => {
    if (hasLaterWrite<{ taskId: string }>(doneKey, variables => variables.taskId === taskId)) return;
    updateTask(queryClient, task.id, () => task);
  },
});
```

Then add one line to `src/app/queued-writes.ts`, so a write saved before the app was closed can be sent after
it reopens:

```ts
import '@/features/tasks/api';
```

A test fails if a module that defines a queued write is missing from that file. If the app still finds a saved
write it can't run (its definition was removed in an update), it drops the write and logs an error instead of
crashing.

Keep these rules:

- **Small, plain variables.** They're saved as JSON: ids and flags, not whole objects.
- **Cache updates in the callbacks, not in the screen.** After a restart, the screen that started the write is
  gone; the callbacks still run.
- **Pass `idempotencyKey` to the request.** Each queued write gets one, and it stays the same across attempts.

### Show "Waiting to sync" (B)

`useWaitingWrites` returns the variables of this write's copies that haven't been sent:

```ts
export function useWaitingTasks(): ReadonlySet<string> {
  return new Set(useWaitingWrites<{ taskId: string }>(doneKey).map(variables => variables.taskId));
}
```

In the screen, mark those items with the `offline.waiting` string ("Waiting to sync"). The demo's like button
does this.

## Disable a form (C)

Put `OfflineNotice` above the submit button and disable the button while offline. The notice shows only while
the phone is offline.

```tsx
const online = useIsOnline();

<OfflineNotice message={t('offline.signInBlocked')} />
<Button title={t('auth.login.submit')} onPress={submit} disabled={!online} />
```

`useIsOnline` comes from `@/shared/lifecycle/network`, and the components from `@/shared/ui/offline/Offline`.

## Replace the content (D)

Wrap what needs a connection in `OnlineOnly`. Offline, it shows an offline message instead of its children:

```tsx
<OnlineOnly>
  <Text variant="heading">{t('settings.deleteTitle')}</Text>
  <Button title={t('settings.deleteConfirm')} variant="danger" onPress={() => deleteAccount.mutate()} />
</OnlineOnly>
```

## Reading data offline

Query results are saved on the device, so a cold start shows the last data straight away, then refreshes it.
Saved data is kept for 24 hours. When the connection returns, queries refresh and queued writes are sent.

To keep a query out of storage (sensitive or large data), set `meta: { persist: false }` on it.

## What your backend needs to do

Queued writes are retried with the same `Idempotency-Key` header. Store the result of the first request for
each key and return it for repeats, so a write is never applied twice. See
[Use your API](/production/going-live/#use-your-api).

## Test offline behaviour

- **In tests:** switch the network state with TanStack Query's online manager, for example
  `await act(async () => onlineManager.setOnline(false))`. The demo's feed tests show a like queued offline and
  sent on reconnect.
- **On a device or simulator:** turn on airplane mode. The mock backend runs inside the app, so it can't
  simulate a dead network; airplane mode can.
