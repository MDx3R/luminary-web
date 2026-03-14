import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as authApi from "@/lib/auth-api";

const STORAGE_KEY = "luminary-auth";

export interface AuthUser {
  id: string;
  username: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoggedIn: boolean;
  isHydrated: boolean;
  setHydrated: (value: boolean) => void;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  loadSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoggedIn: false,
      isHydrated: false,

      setHydrated(value: boolean) {
        set({ isHydrated: value });
      },

      async login(username: string, password: string) {
        const tokens = await authApi.login(username, password);
        set({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          isLoggedIn: true,
        });
        const me = await authApi.fetchMe(tokens.access_token);
        set({ user: { id: me.id, username: me.username } });
      },

      async register(username: string, password: string) {
        await authApi.register(username, password);
        await get().login(username, password);
      },

      async logout() {
        const { accessToken } = get();
        if (accessToken) {
          try {
            await authApi.logout(accessToken);
          } catch {
            // ignore network errors on logout
          }
        }
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isLoggedIn: false,
        });
      },

      async fetchMe() {
        const { accessToken } = get();
        if (!accessToken) return;
        const me = await authApi.fetchMe(accessToken);
        set({ user: { id: me.id, username: me.username } });
      },

      async refreshTokens() {
        const { refreshToken } = get();
        if (!refreshToken) return;
        const tokens = await authApi.refreshToken(refreshToken);
        set({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          isLoggedIn: true,
        });
        const me = await authApi.fetchMe(tokens.access_token);
        set({ user: { id: me.id, username: me.username } });
      },

      async loadSession() {
        if (typeof window === "undefined") return;
        const { accessToken, refreshToken } = get();
        if (!accessToken || !refreshToken) {
          set({ isHydrated: true });
          return;
        }
        try {
          await get().fetchMe();
        } catch {
          try {
            await get().refreshTokens();
          } catch {
            set({
              user: null,
              accessToken: null,
              refreshToken: null,
              isLoggedIn: false,
            });
          }
        } finally {
          set({ isHydrated: true });
        }
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isLoggedIn: !!state.accessToken,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
