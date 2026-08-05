import { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Cancel01Icon, DragDropVerticalIcon } from "hugeicons-react";
import { OPTION_COLOR_CLASSES, OPTION_TRIGGER_COLOR_CLASSES } from "@/lib/propertyTypes";

function OptionPill({ label, color, ghost = false }) {
  const classes = ghost
    ? OPTION_TRIGGER_COLOR_CLASSES[color] ?? OPTION_TRIGGER_COLOR_CLASSES.gray
    : OPTION_COLOR_CLASSES[color] ?? OPTION_COLOR_CLASSES.gray;
  return (
    <span className={`inline-block truncate rounded px-2 py-0.5 text-xs font-medium ${classes}`}>
      {label}
    </span>
  );
}

export default function SelectPicker({ options, value, onSelect, onCreate, clearable = true }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState(null);
  const triggerRef = useRef(null);

  const current = options.find((o) => o.key === value);

  const filtered = useMemo(
    () => options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())),
    [options, query]
  );
  const exactMatch = options.some((o) => o.label.toLowerCase() === query.trim().toLowerCase());

  function handleOpen() {
    const rect = triggerRef.current.getBoundingClientRect();
    setPosition({ top: rect.bottom + 4, left: rect.left });
    setOpen(true);
  }

  function handleSelect(key) {
    onSelect(key);
    setOpen(false);
    setQuery("");
  }

  async function handleCreate() {
    const label = query.trim();
    if (!label) return;
    const option = await onCreate(label);
    onSelect(option.key);
    setOpen(false);
    setQuery("");
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className={`group inline-flex items-center rounded-md px-1 py-0.5 ${current ? "" : "hover:bg-black/5 dark:hover:bg-white/10"}`}
      >
        {current ? (
          <OptionPill label={current.label} color={current.color} ghost />
        ) : (
          <span className="px-1 text-sm text-(--color-text-muted)">Empty</span>
        )}
      </button>

      {open &&
        position &&
        createPortal(
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div
              style={{ top: position.top, left: position.left }}
              className="fixed z-50 w-64 rounded-lg border border-(--color-border) bg-(--color-canvas) p-2 shadow-lg"
            >
              <div className="mb-2 flex items-center gap-1.5 rounded-md border border-(--color-border) px-2 py-1">
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && query.trim() && !exactMatch) handleCreate();
                  }}
                  placeholder="Search or create…"
                  className="flex-1 bg-transparent text-sm outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="text-(--color-text-muted) hover:text-(--color-text)"
                  >
                    <Cancel01Icon size={13} strokeWidth={1.8} />
                  </button>
                )}
              </div>

              <div className="px-1 pb-1 text-xs text-(--color-text-muted)">
                Select an option{onCreate ? " or create one" : ""}
              </div>

              <div className="flex max-h-56 flex-col gap-0.5 overflow-y-auto">
                {clearable && !query && current && (
                  <button
                    type="button"
                    onClick={() => handleSelect(null)}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <Cancel01Icon size={13} strokeWidth={1.8} />
                    Clear
                  </button>
                )}
                {filtered.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleSelect(opt.key)}
                    className="flex items-center gap-2 rounded-md px-1.5 py-1.5 text-left hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <DragDropVerticalIcon
                      size={13}
                      strokeWidth={1.8}
                      className="shrink-0 text-(--color-text-muted)"
                    />
                    <OptionPill label={opt.label} color={opt.color} />
                  </button>
                ))}

                {onCreate && query.trim() && !exactMatch && (
                  <button
                    type="button"
                    onClick={handleCreate}
                    className="flex items-center gap-2 rounded-md px-1.5 py-1.5 text-left hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <span className="w-[13px]" />
                    <OptionPill label={query.trim()} color="gray" />
                  </button>
                )}
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
}
