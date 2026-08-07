import { create } from "zustand";

export const usePresenceStore = create((set) => ({
  onlineIds: new Set(),
  receivedList: false,
  statuses: {}, // userId -> { manualStatus, statusMessage }

  setOnlineIds: (ids) => set({ onlineIds: new Set(ids), receivedList: true }),

  markOnline: (userId) =>
    set((state) => ({ onlineIds: new Set(state.onlineIds).add(userId) })),

  markOffline: (userId) =>
    set((state) => {
      const next = new Set(state.onlineIds);
      next.delete(userId);
      return { onlineIds: next };
    }),

  setStatus: (userId, manualStatus, statusMessage) =>
    set((state) => ({
      statuses: { ...state.statuses, [userId]: { manualStatus, statusMessage } },
    })),
}));

export function usePresence(userId, fallback = {}) {
  const online = usePresenceStore((s) =>
    s.onlineIds.has(userId) ? true : s.receivedList ? false : Boolean(fallback.online)
  );
  const liveStatus = usePresenceStore((s) => s.statuses[userId]);
  return {
    online,
    manualStatus: liveStatus ? liveStatus.manualStatus : (fallback.manualStatus ?? null),
    statusMessage: liveStatus ? liveStatus.statusMessage : (fallback.statusMessage ?? ""),
  };
}
