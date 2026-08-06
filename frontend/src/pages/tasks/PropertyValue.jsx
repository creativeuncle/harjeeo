import { useAuthStore } from "@/store/authStore";
import { OPTION_COLOR_CLASSES, nextOptionColor } from "@/lib/propertyTypes";

const inputClass =
  "w-full rounded-md border border-transparent bg-transparent px-2 py-1.5 text-sm outline-none hover:border-(--color-border) focus:border-(--color-border)";

function OptionPill({ option }) {
  return (
    <span
      className={`rounded px-2 py-0.5 text-xs font-medium ${OPTION_COLOR_CLASSES[option.color] ?? OPTION_COLOR_CLASSES.gray}`}
    >
      {option.label}
    </span>
  );
}

export default function PropertyValue({ property, task, onChange, onAddOption }) {
  const user = useAuthStore((s) => s.user);
  const value = task.properties?.[property.key];

  if (property.type === "createdTime") {
    return (
      <span className="px-2 py-1.5 text-sm text-(--color-text-muted)">
        {new Date(task.createdAt).toLocaleString()}
      </span>
    );
  }

  if (property.type === "createdBy") {
    return (
      <span className="px-2 py-1.5 text-sm text-(--color-text-muted)">
        {user?.name ?? "—"}
      </span>
    );
  }

  if (property.type === "checkbox") {
    return (
      <input
        type="checkbox"
        checked={Boolean(value)}
        onChange={(e) => onChange(e.target.checked)}
        className="h-[18px] w-[18px] rounded border-(--color-border) accent-(--color-accent)"
      />
    );
  }

  if (property.type === "date") {
    return (
      <input
        type="date"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className={inputClass}
      />
    );
  }

  if (property.type === "select" || property.type === "status") {
    const options = property.options ?? [];
    return (
      <select
        value={value ?? ""}
        onChange={(e) => {
          if (e.target.value === "__new__") {
            const label = window.prompt("New option");
            if (!label) return;
            onAddOption(property, { id: label.toLowerCase(), label, color: nextOptionColor(options) });
            onChange(label.toLowerCase());
            return;
          }
          onChange(e.target.value || null);
        }}
        className="rounded-md border border-(--color-border) bg-(--color-canvas) px-2 py-1.5 text-sm outline-none"
      >
        <option value="">Empty</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
        <option value="__new__">+ New option…</option>
      </select>
    );
  }

  if (property.type === "multiSelect") {
    const options = property.options ?? [];
    const selected = Array.isArray(value) ? value : [];
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        {options.map((opt) => {
          const active = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() =>
                onChange(
                  active ? selected.filter((id) => id !== opt.id) : [...selected, opt.id]
                )
              }
              className={active ? "" : "opacity-40"}
            >
              <OptionPill option={opt} />
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => {
            const label = window.prompt("New option");
            if (!label) return;
            const opt = { id: label.toLowerCase(), label, color: nextOptionColor(options) };
            onAddOption(property, opt);
            onChange([...selected, opt.id]);
          }}
          className="text-xs text-(--color-text-muted) hover:text-(--color-text)"
        >
          + Add
        </button>
      </div>
    );
  }

  const inputType =
    property.type === "number"
      ? "number"
      : property.type === "url"
        ? "url"
        : property.type === "email"
          ? "email"
          : property.type === "phone"
            ? "tel"
            : "text";

  return (
    <input
      type={inputType}
      value={value ?? ""}
      placeholder="Empty"
      onChange={(e) =>
        onChange(property.type === "number" ? Number(e.target.value) : e.target.value)
      }
      className={inputClass}
    />
  );
}
