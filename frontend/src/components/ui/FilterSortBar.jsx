import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  FilterHorizontalIcon,
  SortByDown01Icon,
  CheckmarkCircle02Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
} from "hugeicons-react";

function Popover({ trigger, children, active }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const triggerRef = useRef(null);

  function handleOpen() {
    const rect = triggerRef.current.getBoundingClientRect();
    setPosition({ top: rect.bottom + 4, left: rect.left });
    setOpen(true);
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm ${
          active
            ? "border-(--color-accent) text-(--color-accent)"
            : "border-(--color-border) text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
        }`}
      >
        {trigger}
      </button>
      {open &&
        position &&
        createPortal(
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div
              style={{ top: position.top, left: position.left }}
              className="fixed z-50 w-56 rounded-lg border border-(--color-border) bg-(--color-canvas) p-2 shadow-lg"
            >
              {children(() => setOpen(false))}
            </div>
          </>,
          document.body
        )}
    </>
  );
}

// filterGroups: [{ key, label, icon, options: [{ key, label }] }]
// filterValues: { [groupKey]: Set<optionKey> }
// sortOptions: [{ key, label }]
// sortValue: { key, dir: "asc" | "desc" } | null
export default function FilterSortBar({
  filterGroups = [],
  filterValues = {},
  onToggleFilter,
  onClearFilters,
  sortOptions = [],
  sortValue,
  onSortChange,
}) {
  const activeFilterCount = Object.values(filterValues).reduce(
    (sum, set) => sum + (set?.size ?? 0),
    0
  );

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      {filterGroups.map((group) => {
        const selected = filterValues[group.key] ?? new Set();
        return (
          <Popover
            key={group.key}
            active={selected.size > 0}
            trigger={
              <>
                <FilterHorizontalIcon size={14} strokeWidth={1.8} />
                {group.label}
                {selected.size > 0 && <span>({selected.size})</span>}
              </>
            }
          >
            {() => (
              <div className="flex flex-col gap-0.5">
                {group.options.map((opt) => {
                  const checked = selected.has(opt.key);
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => onToggleFilter(group.key, opt.key)}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                      {checked && (
                        <CheckmarkCircle02Icon
                          size={14}
                          strokeWidth={1.8}
                          className="shrink-0 text-(--color-accent)"
                        />
                      )}
                    </button>
                  );
                })}
                {group.options.length === 0 && (
                  <div className="px-2 py-1.5 text-sm text-(--color-text-muted)">No options</div>
                )}
              </div>
            )}
          </Popover>
        );
      })}

      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={onClearFilters}
          className="text-xs text-(--color-text-muted) hover:text-(--color-text)"
        >
          Clear filters
        </button>
      )}

      {sortOptions.length > 0 && (
        <Popover
          active={Boolean(sortValue)}
          trigger={
            <>
              <SortByDown01Icon size={14} strokeWidth={1.8} />
              {sortValue
                ? sortOptions.find((o) => o.key === sortValue.key)?.label ?? "Sort"
                : "Sort"}
            </>
          }
        >
          {(close) => (
            <div className="flex flex-col gap-0.5">
              {sortOptions.map((opt) => {
                const isActive = sortValue?.key === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      onSortChange(
                        isActive
                          ? { key: opt.key, dir: sortValue.dir === "asc" ? "desc" : "asc" }
                          : { key: opt.key, dir: "asc" }
                      );
                    }}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                    {isActive &&
                      (sortValue.dir === "asc" ? (
                        <ArrowUp01Icon size={14} strokeWidth={1.8} className="shrink-0" />
                      ) : (
                        <ArrowDown01Icon size={14} strokeWidth={1.8} className="shrink-0" />
                      ))}
                  </button>
                );
              })}
              {sortValue && (
                <button
                  type="button"
                  onClick={() => {
                    onSortChange(null);
                    close();
                  }}
                  className="mt-1 border-t border-(--color-border) px-2 pt-1.5 text-left text-xs text-(--color-text-muted) hover:text-(--color-text)"
                >
                  Clear sort
                </button>
              )}
            </div>
          )}
        </Popover>
      )}
    </div>
  );
}
