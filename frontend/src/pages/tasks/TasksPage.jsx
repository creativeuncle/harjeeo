import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Task01Icon, DocumentValidationIcon, Target02Icon } from "hugeicons-react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { STATUS_COLUMNS, listTasks, createTask, moveTask, listTaskProperties } from "@/lib/tasks";
import { listProjects } from "@/lib/projects";
import { useWorkspaceStore } from "@/store/workspaceStore";
import ViewSwitcher from "@/components/ui/ViewSwitcher";
import CalendarView from "@/components/ui/CalendarView";
import FilterSortBar from "@/components/ui/FilterSortBar";
import TaskColumn from "./TaskColumn";

const VIEW_STORAGE_KEY = "harjeeo_tasks_view";

const SORT_OPTIONS = [
  { key: "title", label: "Title" },
  { key: "status", label: "Status" },
  { key: "dueDate", label: "Due date" },
];

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
  const navigate = useNavigate();
  const workspaceId = useWorkspaceStore((s) => s.currentId);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingCol, setCreatingCol] = useState(null);
  const [view, setView] = useState(() => localStorage.getItem(VIEW_STORAGE_KEY) ?? "board");
  const [filterValues, setFilterValues] = useState({ status: new Set(), project: new Set() });
  const [sortValue, setSortValue] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    if (!workspaceId) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([listTasks(workspaceId), listProjects(workspaceId), listTaskProperties(workspaceId)])
      .then(([t, projs, props]) => {
        setTasks(t);
        setProjects(projs);
        setProperties(props);
      })
      .finally(() => setLoading(false));
  }, [workspaceId]);

  function handleViewChange(next) {
    setView(next);
    localStorage.setItem(VIEW_STORAGE_KEY, next);
  }

  function handleToggleFilter(groupKey, optionKey) {
    setFilterValues((prev) => {
      const next = new Set(prev[groupKey]);
      if (next.has(optionKey)) next.delete(optionKey);
      else next.add(optionKey);
      return { ...prev, [groupKey]: next };
    });
  }

  function handleClearFilters() {
    setFilterValues({ status: new Set(), project: new Set() });
  }

  const projectById = useMemo(() => {
    const map = new Map();
    for (const project of projects) map.set(project._id, project);
    return map;
  }, [projects]);

  const visibleTasks = useMemo(() => {
    let list = tasks;
    if (filterValues.status?.size) {
      list = list.filter((t) => filterValues.status.has(t.status));
    }
    if (filterValues.project?.size) {
      list = list.filter((t) => t.projectId && filterValues.project.has(t.projectId));
    }
    if (sortValue) {
      list = [...list].sort((a, b) => {
        let cmp = 0;
        if (sortValue.key === "title") cmp = (a.title || "").localeCompare(b.title || "");
        else if (sortValue.key === "status") cmp = (a.status || "").localeCompare(b.status || "");
        else if (sortValue.key === "dueDate")
          cmp = new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
        return sortValue.dir === "asc" ? cmp : -cmp;
      });
    }
    return list;
  }, [tasks, filterValues, sortValue]);

  const tasksByStatus = useMemo(() => groupByStatus(visibleTasks), [visibleTasks]);

  const calendarItems = useMemo(
    () =>
      visibleTasks.map((task) => ({
        id: task._id,
        date: task.dueDate,
        title: task.title,
        colorClass: STATUS_COLUMNS.find((c) => c.key === task.status)?.calendarClass,
      })),
    [visibleTasks]
  );

  async function handleAddTask(status) {
    if (!workspaceId) return;
    setCreatingCol(status);
    try {
      const task = await createTask(workspaceId, { status });
      setTasks((prev) => [...prev, task]);
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

    const previousTasks = tasks;

    if (sourceStatus === destStatus) {
      const columnIds = tasksByStatus[sourceStatus].map((t) => t._id);
      const sourceIndex = columnIds.indexOf(active.id);
      if (sourceIndex === destIndex) return;
      const reorderedIds = arrayMove(columnIds, sourceIndex, destIndex);
      setTasks((prev) => {
        const byId = Object.fromEntries(prev.map((t) => [t._id, t]));
        const others = prev.filter((t) => t.status !== sourceStatus);
        return [...others, ...reorderedIds.map((tid) => byId[tid])];
      });
      moveTask(active.id, destStatus, destIndex).catch(() => {
        setTasks(previousTasks);
      });
      return;
    }

    setTasks((prev) =>
      prev.map((t) => (t._id === active.id ? { ...t, status: destStatus } : t))
    );
    moveTask(active.id, destStatus, destIndex).catch((err) => {
      setTasks(previousTasks);
      const message = err.response?.data?.message;
      if (message) window.alert(message);
    });
  }

  return (
    <div className="px-10 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Task01Icon size={26} strokeWidth={1.8} />
          <h1 className="text-2xl font-semibold">Tasks</h1>
        </div>
        <ViewSwitcher value={view} onChange={handleViewChange} />
      </div>

      <FilterSortBar
        filterGroups={[
          {
            key: "status",
            label: "Status",
            options: STATUS_COLUMNS.map((c) => ({ key: c.key, label: c.label })),
          },
          {
            key: "project",
            label: "Project",
            options: projects.map((p) => ({ key: p._id, label: p.title })),
          },
        ]}
        filterValues={filterValues}
        onToggleFilter={handleToggleFilter}
        onClearFilters={handleClearFilters}
        sortOptions={view === "table" ? SORT_OPTIONS : []}
        sortValue={sortValue}
        onSortChange={setSortValue}
      />

      {!loading && view === "table" && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-(--color-border) text-left text-(--color-text-muted)">
                <th className="whitespace-nowrap py-2 pr-4 font-medium">Name</th>
                <th className="whitespace-nowrap py-2 pr-4 font-medium">Status</th>
                <th className="whitespace-nowrap py-2 pr-4 font-medium">Project</th>
                <th className="whitespace-nowrap py-2 pr-4 font-medium">Due date</th>
              </tr>
            </thead>
            <tbody>
              {visibleTasks.map((task) => {
                const column = STATUS_COLUMNS.find((c) => c.key === task.status);
                const project = task.projectId ? projectById.get(task.projectId) : null;
                return (
                  <tr
                    key={task._id}
                    onClick={() => navigate(`/tasks/${task._id}`)}
                    className="cursor-pointer border-b border-(--color-border) hover:bg-black/[.02] dark:hover:bg-white/[.03]"
                  >
                    <td className="whitespace-nowrap py-2.5 pr-4">
                      <span className="flex items-center gap-1.5">
                        <DocumentValidationIcon
                          size={14}
                          strokeWidth={1.8}
                          className="text-(--color-text-muted)"
                        />
                        {task.title}
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-2.5 pr-4">
                      <span className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${column?.dot}`} />
                        {column?.label}
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-2.5 pr-4 text-(--color-text-muted)">
                      {project ? (
                        <span className="flex items-center gap-1.5">
                          <Target02Icon size={13} strokeWidth={1.8} />
                          {project.title}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="whitespace-nowrap py-2.5 pr-4 text-(--color-text-muted)">
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Empty"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && view === "board" && (
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
                properties={properties}
                onAddTask={handleAddTask}
                creating={creatingCol === column.key}
              />
            ))}
          </div>
        </DndContext>
      )}

      {!loading && view === "calendar" && (
        <CalendarView
          items={calendarItems}
          onItemClick={(item) => navigate(`/tasks/${item.id}`)}
          emptyLabel="No due date"
        />
      )}
    </div>
  );
}
