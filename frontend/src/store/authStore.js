import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  status: "idle", // idle | loading | authenticated | unauthenticated

  setSession: (user, accessToken) =>
    set({ user, accessToken, status: "authenticated" }),

  clearSession: () =>
    set({ user: null, accessToken: null, status: "unauthenticated" }),

  setStatus: (status) => set({ status }),
}));
