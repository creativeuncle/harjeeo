import { Task01Icon, Add01Icon, DocumentValidationIcon } from "hugeicons-react";

const COLUMNS = [
  { key: "not_started", label: "Not started", dot: "bg-gray-400" },
  { key: "up_next", label: "Up next", dot: "bg-amber-400" },
  { key: "in_progress", label: "In progress", dot: "bg-blue-500" },
  { key: "done", label: "Done", dot: "bg-emerald-500" },
];

const SAMPLE_TASKS = {
  not_started: ["New task"],
  up_next: ["New task"],
  in_progress: ["Update homepage copy"],
  done: ["Write FAQ for launch", "Define MVP feature scope"],
};

export default function TasksPage() {
  return (
    <div className="px-10 py-8">
      <div className="mb-6 flex items-center gap-2">
        <Task01Icon size={26} strokeWidth={1.8} />
        <h1 className="text-2xl font-semibold">Tasks</h1>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {COLUMNS.map((col) => (
          <div key={col.key}>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <span className={`h-2 w-2 rounded-full ${col.dot}`} />
              {col.label}
              <span className="text-(--color-text-muted)">
                {SAMPLE_TASKS[col.key].length}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {SAMPLE_TASKS[col.key].map((title) => (
                <div
                  key={title}
                  className="flex items-center gap-2 rounded-md border border-(--color-border) px-3 py-2.5 text-sm hover:bg-black/[.02] dark:hover:bg-white/[.03]"
                >
                  <DocumentValidationIcon
                    size={16}
                    strokeWidth={1.8}
                    className="text-(--color-text-muted)"
                  />
                  {title}
                </div>
              ))}
              <button
                type="button"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-(--color-text-muted) hover:bg-black/[.02] dark:hover:bg-white/[.03]"
              >
                <Add01Icon size={16} strokeWidth={1.8} />
                New task
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
