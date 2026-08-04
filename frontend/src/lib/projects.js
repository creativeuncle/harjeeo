import { api } from "./api";

export const STAGE_LABELS = {
  not_started: "Not started",
  planning: "Planning",
  in_progress: "In Progress",
  done: "Done",
};

export const STAGE_OPTIONS = Object.entries(STAGE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export async function listProjects(workspaceId) {
  const { data } = await api.get("/projects", { params: { workspaceId } });
  return data.projects;
}

export async function createProject(workspaceId, payload = {}) {
  const { data } = await api.post("/projects", { ...payload, workspaceId });
  return data.project;
}

export async function getProject(id) {
  const { data } = await api.get(`/projects/${id}`);
  return data.project;
}

export async function updateProject(id, updates) {
  const { data } = await api.patch(`/projects/${id}`, updates);
  return data.project;
}

export async function deleteProject(id) {
  await api.delete(`/projects/${id}`);
}
