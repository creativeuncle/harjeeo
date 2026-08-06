import { useMemo, useRef, useState } from "react";
import { Add01Icon, Search01Icon } from "hugeicons-react";
import { PROPERTY_TYPE_META, ADDABLE_PROPERTY_TYPES } from "@/lib/propertyTypes";

export default function AddPropertyMenu({ onCreate }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);

  const filtered = useMemo(() => {
    if (!query) return ADDABLE_PROPERTY_TYPES;
    return ADDABLE_PROPERTY_TYPES.filter((type) =>
      PROPERTY_TYPE_META[type].label.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  function handleSelectType(type) {
    const name = window.prompt(`Property name for "${PROPERTY_TYPE_META[type].label}"`);
    if (!name) return;
    onCreate({ name, type });
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
      >
        <Add01Icon size={16} strokeWidth={1.8} />
        Add a property
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 w-64 rounded-lg border border-(--color-border) bg-(--color-canvas) p-2 shadow-lg">
            <div className="mb-1 flex items-center gap-2 border-b border-(--color-border) px-1 pb-2 text-sm text-(--color-text-muted)">
              <Search01Icon size={14} strokeWidth={1.8} />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type"
                className="w-full bg-transparent outline-none"
              />
            </div>
            <div className="thin-scrollbar flex max-h-72 flex-col gap-0.5 overflow-y-auto">
              {filtered.map((type) => {
                const Icon = PROPERTY_TYPE_META[type].icon;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleSelectType(type)}
                    className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <Icon size={16} strokeWidth={1.8} className="text-(--color-text-muted)" />
                    {PROPERTY_TYPE_META[type].label}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
