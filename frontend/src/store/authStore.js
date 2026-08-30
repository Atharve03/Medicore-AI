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
      // Set once login()/register() successfully triggers an OTP email;
      // cleared on verifyOtp() success or by the caller cancelling.
      pendingOtp: null, // { email, purpose: 'registration' | 'login' }

      setTokens(accessToken, refreshToken) {
        set({ accessToken, refreshToken });
      },

      /**
       * Validates credentials and triggers a login OTP email — does NOT
       * authenticate the user yet. Callers must follow up with verifyOtp().
       */
      async login(credentials) {
        set({ status: 'loading', error: null });
        try {
          const { data } = await authApi.login(credentials);
          set({
            pendingOtp: { email: data.data.email, purpose: data.data.purpose },
            status: 'idle',
          });
          return data.data;
        } catch (err) {
          set({ status: 'error', error: extractErrorMessage(err) });
          throw err;
        }
      },

      /**
       * Creates the account and triggers a registration OTP email — does
       * NOT authenticate the user yet. Callers must follow up with
       * verifyOtp({ purpose: 'registration' }).
       */
      async register(payload) {
        set({ status: 'loading', error: null });
        try {
          const { data } = await authApi.register(payload);
          set({
            pendingOtp: { email: data.data.email, purpose: data.data.purpose },
            status: 'idle',
          });
          return data.data;
        } catch (err) {
          set({ status: 'error', error: extractErrorMessage(err) });
          throw err;
        }
      },

      /**
       * Completes either flow: submits the emailed code and, on success,
       * stores the issued tokens/user and clears pendingOtp. Returns the
       * authenticated user so the caller can route/redirect.
       */
      async verifyOtp({ email, code, purpose }) {
        set({ status: 'loading', error: null });
        try {
          const { data } = await authApi.verifyOtp({ email, code, purpose });
          set({
            user: data.data.user,
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken,
            pendingOtp: null,
            status: 'idle',
          });
          return data.data.user;
        } catch (err) {
          set({ status: 'error', error: extractErrorMessage(err) });
          throw err;
        }
      },

      async resendOtp() {
        const pending = get().pendingOtp;
        if (!pending) return;
        set({ status: 'loading', error: null });
        try {
          const { data } = await authApi.resendOtp(pending);
          set({
            pendingOtp: { email: data.data.email, purpose: data.data.purpose },
            status: 'idle',
          });
        } catch (err) {
          set({ status: 'error', error: extractErrorMessage(err) });
          throw err;
        }
      },

      cancelOtp() {
        set({ pendingOtp: null, error: null });
      },

      async logout() {
        try {
          if (get().accessToken) await authApi.logout();
        } catch {
          // Logging out client-side still proceeds even if the server call
          // fails (e.g. token already expired) — the user's intent is to
          // be logged out either way.
        } finally {
          set({ user: null, accessToken: null, refreshToken: null, pendingOtp: null });
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
