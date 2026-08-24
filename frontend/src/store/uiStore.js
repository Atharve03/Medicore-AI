import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const prefersDark =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-color-scheme: dark)').matches;

export const useUiStore = create(
  persist(
    (set, get) => ({
      darkMode: prefersDark || false,
      sidebarCollapsed: false,

      toggleDarkMode() {
        set({ darkMode: !get().darkMode });
      },

      toggleSidebar() {
        set({ sidebarCollapsed: !get().sidebarCollapsed });
      },
    }),
    { name: 'medicore-ui' }
  )
);
