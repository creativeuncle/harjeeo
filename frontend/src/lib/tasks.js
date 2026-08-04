import { api } from "./api";

export const STATUS_COLUMNS = [
  { key: "not_started", label: "Not started", dot: "bg-gray-400" },
  { key: "up_next", label: "Up next", dot: "bg-amber-400" },
  { key: "in_progress", label: "In progress", dot: "bg-blue-500" },
  { key: "done", label: "Done", dot: "bg-emerald-500" },
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
