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

export async function setProjectMemberRole(id, userId, role) {
  const { data } = await api.put(`/projects/${id}/members`, { userId, role });
  return data.project;
}

export async function removeProjectMemberRole(id, userId) {
  const { data } = await api.delete(`/projects/${id}/members/${userId}`);
  return data.project;
}
