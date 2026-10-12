import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook } from '@testing-library/react-native';
import type { ReactElement, ReactNode } from 'react';

import { queryClient } from '@/data/query-client';
import { initI18n } from '@/shared/i18n';
import { ToastHost } from '@/shared/ui/toast/ToastHost';

initI18n('en');

function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BottomSheetModalProvider>
        <NavigationContainer>{children}</NavigationContainer>
        <ToastHost />
      </BottomSheetModalProvider>
    </QueryClientProvider>
  );
}

/** Renders a screen or component with the app's providers (query client, i18n, navigation, toasts). */
export function renderWithProviders(ui: ReactElement) {
  return render(ui, { wrapper: Providers });
}

/** Renders a hook with the same providers, e.g. a feature's query or mutation hook. */
export function renderHookWithProviders<Result>(hook: () => Result) {
  return renderHook(hook, { wrapper: Providers });
}
