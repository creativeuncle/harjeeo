import { api } from "./api";

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
