import { create } from 'zustand';

import { services } from '@/shared/services/services';

const KEY = 'onboarding.completed';

type OnboardingState = { completed: boolean; complete: () => void; reset: () => void };

export const useOnboarding = create<OnboardingState>()(set => ({
  completed: services().kv.getBoolean(KEY) === true,
  complete: () => {
    services().kv.set(KEY, true);
    services().analytics.track('onboarding_completed');
    set({ completed: true });
  },
  reset: () => {
    services().kv.remove(KEY);
    set({ completed: false });
  },
}));

/** Navigation gate: show onboarding until it has been completed once. */
export const useNeedsOnboarding = () => useOnboarding(state => !state.completed);
export const useOnboardingDone = () => useOnboarding(state => state.completed);
