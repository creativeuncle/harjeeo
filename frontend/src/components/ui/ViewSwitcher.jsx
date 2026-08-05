import { Table01Icon, LayoutGridIcon, Calendar03Icon } from "hugeicons-react";

const VIEWS = [
  { key: "table", label: "Table", icon: Table01Icon },
  { key: "board", label: "Board", icon: LayoutGridIcon },
  { key: "calendar", label: "Calendar", icon: Calendar03Icon },
];

export default function ViewSwitcher({ value, onChange }) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-md border border-(--color-border) p-0.5">
      {VIEWS.map((view) => (
        <button
          key={view.key}
          type="button"
          onClick={() => onChange(view.key)}
          className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-sm transition-colors ${
            value === view.key
              ? "bg-black/5 font-medium text-(--color-text) dark:bg-white/10"
              : "text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
          }`}
        >
          <view.icon size={14} strokeWidth={1.8} />
          {view.label}
        </button>
      ))}
    </div>
  );
}
