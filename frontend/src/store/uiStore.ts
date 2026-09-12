import { create } from "zustand";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  description?: string;
  durationMs?: number;
}

interface UiState {
  railCollapsed: boolean;
  mobileNavOpen: boolean;
  toasts: ToastMessage[];
  toggleRail: () => void;
  setRailCollapsed: (collapsed: boolean) => void;
  setMobileNavOpen: (open: boolean) => void;
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  railCollapsed: false,
  mobileNavOpen: false,
  toasts: [],
  toggleRail: () => set((s) => ({ railCollapsed: !s.railCollapsed })),
  setRailCollapsed: (railCollapsed) => set({ railCollapsed }),
  setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
  },
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
