import { create } from "zustand";

const STORAGE_KEY = "harjeeo_current_workspace_id";

export const useWorkspaceStore = create((set) => ({
  workspaces: [],
  currentId: localStorage.getItem(STORAGE_KEY) ?? null,

  setWorkspaces: (workspaces) =>
    set((state) => {
      const stillExists = workspaces.some((w) => w._id === state.currentId);
      const currentId = stillExists ? state.currentId : (workspaces[0]?._id ?? null);
      if (currentId) localStorage.setItem(STORAGE_KEY, currentId);
      return { workspaces, currentId };
    }),

  setCurrentId: (id) => {
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
    set({ currentId: id });
  },

  addWorkspace: (workspace) =>
    set((state) => ({
      workspaces: [...state.workspaces, workspace],
      currentId: workspace._id,
    })),
}));
