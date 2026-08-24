import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { authApi } from '../api/auth.api.js';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      status: 'idle', // 'idle' | 'loading' | 'error'
      error: null,

      setTokens(accessToken, refreshToken) {
        set({ accessToken, refreshToken });
      },

      async login(credentials) {
        set({ status: 'loading', error: null });
        try {
          const { data } = await authApi.login(credentials);
          set({
            user: data.data.user,
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken,
            status: 'idle',
          });
          return data.data.user;
        } catch (err) {
          set({ status: 'error', error: extractErrorMessage(err) });
          throw err;
        }
      },

      async register(payload) {
        set({ status: 'loading', error: null });
        try {
          const { data } = await authApi.register(payload);
          set({
            user: data.data.user,
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken,
            status: 'idle',
          });
          return data.data.user;
        } catch (err) {
          set({ status: 'error', error: extractErrorMessage(err) });
          throw err;
        }
      },

      async logout() {
        try {
          if (get().accessToken) await authApi.logout();
        } catch {
          // Logging out client-side still proceeds even if the server call
          // fails (e.g. token already expired) — the user's intent is to
          // be logged out either way.
        } finally {
          set({ user: null, accessToken: null, refreshToken: null });
        }
      },

      clearError() {
        set({ error: null });
      },
    }),
    {
      name: 'medicore-auth',
      partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
      }),
    }
  )
);

function extractErrorMessage(err) {
  return err?.response?.data?.message || 'Something went wrong. Please try again.';
}
