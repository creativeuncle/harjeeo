import { create } from "zustand";

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  status: "idle", // idle | loading | authenticated | unauthenticated
  impersonatorAdmin: null, // { user, accessToken } of the admin, while impersonating

  setSession: (user, accessToken) =>
    set({ user, accessToken, status: "authenticated" }),

  clearSession: () =>
    set({ user: null, accessToken: null, status: "unauthenticated", impersonatorAdmin: null }),

  updateUser: (partial) =>
    set((state) => ({ user: state.user ? { ...state.user, ...partial } : state.user })),

  setStatus: (status) => set({ status }),

  startImpersonation: (targetUser, targetAccessToken) => {
    const { user, accessToken } = get();
    set({
      impersonatorAdmin: { user, accessToken },
      user: targetUser,
      accessToken: targetAccessToken,
      status: "authenticated",
    });
  },

  stopImpersonation: () => {
    const { impersonatorAdmin } = get();
    if (!impersonatorAdmin) return;
    set({
      user: impersonatorAdmin.user,
      accessToken: impersonatorAdmin.accessToken,
      impersonatorAdmin: null,
      status: "authenticated",
    });
  },
}));
