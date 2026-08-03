import { useState } from "react";
import {
  PencilEdit02Icon,
  Settings02Icon,
  Copy01Icon,
  Delete02Icon,
} from "hugeicons-react";
import { nextOptionColor } from "@/lib/propertyTypes";

const OPTION_TYPES = new Set(["select", "multiSelect", "status"]);

export default function PropertyMenu({
  property,
  icon: Icon,
  onRename,
  onEditOptions,
  onDuplicate,
  onDelete,
}) {
  const [open, setOpen] = useState(false);

  function handleRename() {
    const name = window.prompt("Rename property", property.name);
    if (!name || name === property.name) {
      setOpen(false);
      return;
    }
    onRename(name);
    setOpen(false);
  }

  function handleEditOptions() {
    const label = window.prompt("Add a new option (leave blank to skip)");
    if (label) {
      const option = { id: label.toLowerCase(), label, color: nextOptionColor(property.options ?? []) };
      onEditOptions([...(property.options ?? []), option]);
    }
    setOpen(false);
  }

  function handleDuplicate() {
    onDuplicate();
    setOpen(false);
  }

  function handleDelete() {
    if (window.confirm(`Delete property "${property.name}"? This removes it from every task.`)) {
      onDelete();
    }
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-32 shrink-0 items-center gap-1.5 rounded px-1 py-0.5 text-left text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
      >
        {Icon && <Icon size={15} strokeWidth={1.8} className="shrink-0" />}
        <span className="min-w-0 truncate">{property.name}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 w-52 rounded-lg border border-(--color-border) bg-(--color-canvas) p-1 shadow-lg">
            <button
              type="button"
              onClick={handleRename}
              className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
            >
              <PencilEdit02Icon size={15} strokeWidth={1.8} />
              Rename
            </button>

            {OPTION_TYPES.has(property.type) && (
              <button
                type="button"
                onClick={handleEditOptions}
                className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
              >
                <Settings02Icon size={15} strokeWidth={1.8} />
                Edit property
              </button>
            )}

            <button
              type="button"
              onClick={handleDuplicate}
              className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
            >
              <Copy01Icon size={15} strokeWidth={1.8} />
              Duplicate property
            </button>

            <div className="my-1 border-t border-(--color-border)" />

            <button
              type="button"
              onClick={handleDelete}
              className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm text-red-500 hover:bg-red-500/10"
            >
              <Delete02Icon size={15} strokeWidth={1.8} />
              Delete property
            </button>
          </div>
        </>
      )}
    </div>
  );
}
