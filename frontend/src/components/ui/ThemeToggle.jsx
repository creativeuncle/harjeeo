import { Sun01Icon, Moon01Icon, ComputerIcon } from "hugeicons-react";
import { useThemeStore } from "@/store/themeStore";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun01Icon },
  { value: "dark", label: "Dark", icon: Moon01Icon },
  { value: "system", label: "System", icon: ComputerIcon },
];

export default function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  return (
    <div className="inline-flex rounded-md border border-(--color-border) p-0.5">
      {OPTIONS.map((opt) => {
        const active = theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "bg-(--color-accent) text-white"
                : "text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
            }`}
          >
            <opt.icon size={15} strokeWidth={1.8} />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
