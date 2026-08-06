import { create } from "zustand";

export const useChatStore = create((set) => ({
  channels: [],
  members: [],
  activeChannelId: null,

  setChannels: (channels) => set({ channels }),
  addChannel: (channel) =>
    set((state) => ({
      channels: state.channels.some((c) => c._id === channel._id)
        ? state.channels
        : [channel, ...state.channels],
    })),
  setMembers: (members) => set({ members }),
  setActiveChannelId: (idOrFn) =>
    set((state) => ({
      activeChannelId: typeof idOrFn === "function" ? idOrFn(state.activeChannelId) : idOrFn,
    })),
}));
