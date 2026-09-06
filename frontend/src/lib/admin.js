import { api } from "./api";

export async function getAdminStats() {
  const { data } = await api.get("/admin/stats");
  return data;
}

export async function listAdminUsers(params = {}) {
  const { data } = await api.get("/admin/users", { params });
  return data;
}

export async function listAdminWorkspaces(params = {}) {
  const { data } = await api.get("/admin/workspaces", { params });
  return data;
}

export async function setUserSuspended(id, suspended) {
  const { data } = await api.post(`/admin/users/${id}/suspend`, { suspended });
  return data.user;
}

export async function impersonateUser(id) {
  const { data } = await api.post(`/admin/users/${id}/impersonate`);
  return data;
}
