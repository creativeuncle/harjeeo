import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Add01Icon } from "hugeicons-react";
import TaskCard from "./TaskCard";

export default function TaskColumn({ column, tasks, properties, onAddTask, creating }) {
  const { setNodeRef } = useDroppable({ id: `col:${column.key}` });

  return (
    <div className={`rounded-xl p-2 ${column.bgClass ?? ""} dark:bg-white/[.03]`}>
      <div className="mb-2 flex items-center gap-2 px-1 text-sm font-medium">
        <span className={`h-2 w-2 rounded-full ${column.dot}`} />
        {column.label}
        <span className="text-(--color-text-muted)">{tasks.length}</span>
      </div>

      <SortableContext
        items={tasks.map((t) => t._id)}
        strategy={verticalListSortingStrategy}
      >
        <div ref={setNodeRef} className="flex min-h-[8px] flex-col gap-2">
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} properties={properties} />
          ))}
        </div>
      </SortableContext>

      <button
        type="button"
        onClick={() => onAddTask(column.key)}
        disabled={creating}
        className="mt-2 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-(--color-text-muted) hover:bg-black/[.02] disabled:opacity-60 dark:hover:bg-white/[.03]"
      >
        <Add01Icon size={16} strokeWidth={1.8} />
        New task
      </button>
    </div>
  );
}
