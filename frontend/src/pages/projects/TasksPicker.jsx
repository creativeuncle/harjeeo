import { useState } from "react";
import { Link } from "react-router-dom";
import { Cancel01Icon, DocumentValidationIcon, CheckmarkCircle02Icon } from "hugeicons-react";

export default function TasksPicker({ allTasks, selectedTasks, onToggle }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedIds = new Set(selectedTasks.map((t) => t._id));
  const filtered = allTasks.filter((t) =>
    t.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative min-w-0 flex-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-[28px] w-full flex-wrap items-center gap-1.5 rounded-md px-2 py-1 text-left hover:bg-black/5 dark:hover:bg-white/10"
      >
        {selectedTasks.length === 0 && (
          <span className="text-sm text-(--color-text-muted)">Empty</span>
        )}
        {selectedTasks.map((task) => (
          <span
            key={task._id}
            className="inline-flex items-center gap-1 rounded bg-black/5 px-1.5 py-0.5 text-xs font-medium dark:bg-white/10"
          >
            <DocumentValidationIcon size={12} strokeWidth={1.8} />
            {task.title}
          </span>
        ))}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 w-72 rounded-lg border border-(--color-border) bg-(--color-canvas) p-2 shadow-lg">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks…"
              className="mb-2 w-full rounded-md border border-(--color-border) bg-transparent px-2 py-1.5 text-sm outline-none focus:border-(--color-accent)"
            />

            <div className="flex max-h-64 flex-col gap-0.5 overflow-y-auto">
              {filtered.length === 0 && (
                <div className="px-2 py-1.5 text-sm text-(--color-text-muted)">
                  No tasks found
                </div>
              )}
              {filtered.map((task) => {
                const checked = selectedIds.has(task._id);
                return (
                  <button
                    key={task._id}
                    type="button"
                    onClick={() => onToggle(task)}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <DocumentValidationIcon
                      size={15}
                      strokeWidth={1.8}
                      className="text-(--color-text-muted)"
                    />
                    <span className="min-w-0 flex-1 truncate">{task.title}</span>
                    {checked && (
                      <CheckmarkCircle02Icon
                        size={15}
                        strokeWidth={1.8}
                        className="shrink-0 text-(--color-accent)"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {selectedTasks.length > 0 && (
              <div className="mt-1 border-t border-(--color-border) pt-1">
                {selectedTasks.map((task) => (
                  <div
                    key={task._id}
                    className="flex items-center gap-2 rounded-md px-2 py-1 text-sm"
                  >
                    <Link
                      to={`/tasks/${task._id}`}
                      className="min-w-0 flex-1 truncate text-(--color-accent) hover:underline"
                    >
                      {task.title}
                    </Link>
                    <button
                      type="button"
                      onClick={() => onToggle(task)}
                      className="shrink-0 text-(--color-text-muted) hover:text-(--color-text)"
                    >
                      <Cancel01Icon size={13} strokeWidth={1.8} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
