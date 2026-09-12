import { create } from "zustand";
import { User } from "../types/auth";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void;
}

/**
 * Access token is strictly kept in memory here — never in localStorage or sessionStorage.
 * Refresh token is handled entirely via HttpOnly cookies by the browser.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true, // starts true for initial silent refresh boot
  setAuth: (user, accessToken) =>
    set({
      user,
      accessToken,
      isAuthenticated: true,
      isLoading: false,
    }),
  setAccessToken: (accessToken) =>
    set({
      accessToken,
      isAuthenticated: true,
    }),
  setUser: (user) => set({ user }),
  clearAuth: () =>
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    }),
  setLoading: (isLoading) => set({ isLoading }),
}));
