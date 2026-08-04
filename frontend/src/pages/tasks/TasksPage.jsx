import { useEffect, useState } from "react";
import { Task01Icon } from "hugeicons-react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { STATUS_COLUMNS, listTasks, createTask, moveTask } from "@/lib/tasks";
import { useWorkspaceStore } from "@/store/workspaceStore";
import TaskColumn from "./TaskColumn";

function groupByStatus(tasks) {
  const grouped = Object.fromEntries(STATUS_COLUMNS.map((c) => [c.key, []]));
  for (const task of tasks) {
    (grouped[task.status] ??= []).push(task);
  }
  for (const key of Object.keys(grouped)) {
    grouped[key].sort((a, b) => a.order - b.order);
  }
  return grouped;
}

export default function TasksPage() {
  const workspaceId = useWorkspaceStore((s) => s.currentId);
  const [tasksByStatus, setTasksByStatus] = useState(
    Object.fromEntries(STATUS_COLUMNS.map((c) => [c.key, []]))
  );
  const [loading, setLoading] = useState(true);
  const [creatingCol, setCreatingCol] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    if (!workspaceId) {
      setTasksByStatus(Object.fromEntries(STATUS_COLUMNS.map((c) => [c.key, []])));
      setLoading(false);
      return;
    }
    setLoading(true);
    listTasks(workspaceId)
      .then((tasks) => setTasksByStatus(groupByStatus(tasks)))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  async function handleAddTask(status) {
    if (!workspaceId) return;
    setCreatingCol(status);
    try {
      const task = await createTask(workspaceId, { status });
      setTasksByStatus((prev) => ({
        ...prev,
        [status]: [...prev[status], task],
      }));
    } finally {
      setCreatingCol(null);
    }
  }

  function findColumnOf(id) {
    return Object.keys(tasksByStatus).find((status) =>
      tasksByStatus[status].some((t) => t._id === id)
    );
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) return;

    const sourceStatus = active.data.current?.status ?? findColumnOf(active.id);
    let destStatus;
    let destIndex;

    if (String(over.id).startsWith("col:")) {
      destStatus = String(over.id).slice(4);
      destIndex = tasksByStatus[destStatus].length;
    } else {
      destStatus = findColumnOf(over.id);
      destIndex = tasksByStatus[destStatus].findIndex((t) => t._id === over.id);
    }

    if (!destStatus) return;
    if (sourceStatus === destStatus) {
      const sourceIndex = tasksByStatus[sourceStatus].findIndex((t) => t._id === active.id);
      if (sourceIndex === destIndex) return;
      setTasksByStatus((prev) => ({
        ...prev,
        [sourceStatus]: arrayMove(prev[sourceStatus], sourceIndex, destIndex),
      }));
      moveTask(active.id, destStatus, destIndex).catch(() => {});
      return;
    }

    setTasksByStatus((prev) => {
      const sourceList = [...prev[sourceStatus]];
      const movingIndex = sourceList.findIndex((t) => t._id === active.id);
      const [moving] = sourceList.splice(movingIndex, 1);
      const destList = [...prev[destStatus]];
      destList.splice(destIndex, 0, { ...moving, status: destStatus });
      return { ...prev, [sourceStatus]: sourceList, [destStatus]: destList };
    });
    moveTask(active.id, destStatus, destIndex).catch(() => {});
  }

  return (
    <div className="px-10 py-8">
      <div className="mb-6 flex items-center gap-2">
        <Task01Icon size={26} strokeWidth={1.8} />
        <h1 className="text-2xl font-semibold">Tasks</h1>
      </div>

      {!loading && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-4 gap-4">
            {STATUS_COLUMNS.map((column) => (
              <TaskColumn
                key={column.key}
                column={column}
                tasks={tasksByStatus[column.key]}
                onAddTask={handleAddTask}
                creating={creatingCol === column.key}
              />
            ))}
          </div>
        </DndContext>
      )}
    </div>
  );
}
