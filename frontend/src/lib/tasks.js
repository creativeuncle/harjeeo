import { api } from "./api";

export const STATUS_COLUMNS = [
  {
    key: "not_started",
    label: "Not started",
    dot: "bg-gray-400",
    calendarClass: "bg-gray-200 text-gray-900 dark:bg-gray-500/20 dark:text-gray-300",
    bgClass: "bg-[#f8f7f6]",
  },
  {
    key: "up_next",
    label: "Up next",
    dot: "bg-amber-400",
    calendarClass: "bg-amber-200 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300",
    bgClass: "bg-[#fcfaf3]",
  },
  {
    key: "in_progress",
    label: "In progress",
    dot: "bg-blue-500",
    calendarClass: "bg-blue-200 text-blue-900 dark:bg-blue-500/20 dark:text-blue-300",
    bgClass: "bg-[#f6f9fd]",
  },
  {
    key: "done",
    label: "Done",
    dot: "bg-emerald-500",
    calendarClass: "bg-emerald-200 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-300",
    bgClass: "bg-[#f7f9f7]",
  },
];

export async function listTasks(workspaceId) {
  const { data } = await api.get("/tasks", { params: { workspaceId } });
  return data.tasks;
}

export async function createTask(workspaceId, payload = {}) {
  const { data } = await api.post("/tasks", { ...payload, workspaceId });
  return data.task;
}

export async function getTask(id) {
  const { data } = await api.get(`/tasks/${id}`);
  return data.task;
}

export async function updateTask(id, updates) {
  const { data } = await api.patch(`/tasks/${id}`, updates);
  return data.task;
}

export async function moveTask(id, status, order) {
  await api.patch(`/tasks/${id}/move`, { status, order });
}

export async function deleteTask(id) {
  await api.delete(`/tasks/${id}`);
}

export async function listTaskProperties(workspaceId) {
  const { data } = await api.get("/task-properties", { params: { workspaceId } });
  return data.properties;
}

export async function createTaskProperty(workspaceId, payload) {
  const { data } = await api.post("/task-properties", { ...payload, workspaceId });
  return data.property;
}

export async function updateTaskProperty(id, updates) {
  const { data } = await api.patch(`/task-properties/${id}`, updates);
  return data.property;
}

export async function deleteTaskProperty(id) {
  await api.delete(`/task-properties/${id}`);
}
