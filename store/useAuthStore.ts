import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as authApi from "@/lib/auth-api";

const STORAGE_KEY = "luminary-auth";

/** Thrown when access token expired but refresh token is missing — callers should logout. */
export class NoRefreshTokenError extends Error {
  constructor() {
    super("NO_REFRESH_TOKEN");
    this.name = "NoRefreshTokenError";
  }
}

let refreshInFlight: Promise<void> | null = null;

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
        if (!refreshToken) {
          throw new NoRefreshTokenError();
        }
        if (!refreshInFlight) {
          refreshInFlight = (async () => {
            const rt = get().refreshToken;
            if (!rt) throw new NoRefreshTokenError();
            const tokens = await authApi.refreshToken(rt);
            // Drop stale refresh after logout/login or a newer refresh replaced tokens.
            if (get().refreshToken !== rt) return;
            set({
              accessToken: tokens.access_token,
              refreshToken: tokens.refresh_token,
              isLoggedIn: true,
            });
            const me = await authApi.fetchMe(tokens.access_token);
            if (get().accessToken !== tokens.access_token) return;
            set({ user: { id: me.id, username: me.username } });
          })().finally(() => {
            refreshInFlight = null;
          });
        }
        await refreshInFlight;
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
            await get().logout();
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
