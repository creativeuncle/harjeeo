import { create } from "zustand";

const STORAGE_KEY = "harjeeo_theme";
const media = window.matchMedia("(prefers-color-scheme: dark)");

function resolveTheme(theme) {
  return theme === "system" ? (media.matches ? "dark" : "light") : theme;
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", resolveTheme(theme));
}

const initial = localStorage.getItem(STORAGE_KEY) ?? "system";
applyTheme(initial);

export const useThemeStore = create((set, get) => ({
  theme: initial, // "light" | "dark" | "system"
  setTheme: (theme) => {
    localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(theme);
    set({ theme });
  },
}));

media.addEventListener("change", () => {
  if (useThemeStore.getState().theme === "system") {
    applyTheme("system");
  }
});
