import { create } from "zustand";

const STORAGE_KEY = "harjeeo_theme";

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", theme);
  }
}

const initial = localStorage.getItem(STORAGE_KEY) ?? "system";
applyTheme(initial);

export const useThemeStore = create((set) => ({
  theme: initial, // "light" | "dark" | "system"
  setTheme: (theme) => {
    localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(theme);
    set({ theme });
  },
}));
