import { create } from 'zustand';

export type ToastTone = 'info' | 'success' | 'danger';
export type Toast = { id: number; message: string; tone: ToastTone };

type ToastState = {
  current: Toast | null;
  show: (message: string, tone?: ToastTone) => void;
  dismiss: () => void;
};

let nextId = 1;
let timer: ReturnType<typeof setTimeout> | undefined;

/** One toast at a time; a new one replaces the old. Readable by screen readers (live region). */
export const useToastStore = create<ToastState>()(set => ({
  current: null,
  show: (message, tone = 'info') => {
    if (timer) clearTimeout(timer);
    set({ current: { id: nextId++, message, tone } });
    timer = setTimeout(() => set({ current: null }), 4000);
  },
  dismiss: () => {
    if (timer) clearTimeout(timer);
    set({ current: null });
  },
}));

/** Show a toast from anywhere, including outside React (mutation callbacks). */
export const toast = {
  info: (message: string) => useToastStore.getState().show(message, 'info'),
  success: (message: string) => useToastStore.getState().show(message, 'success'),
  error: (message: string) => useToastStore.getState().show(message, 'danger'),
};
