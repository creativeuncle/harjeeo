import { api } from "./api";

export const ROLE_LABELS = {
  owner: "Owner",
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
  guest: "Guest",
};

export const ASSIGNABLE_ROLES = ["admin", "editor", "viewer", "guest"];

export async function listWorkspaces() {
  const { data } = await api.get("/workspaces");
  return data.workspaces;
}

export async function createWorkspace(payload) {
  const { data } = await api.post("/workspaces", payload);
  return data;
}

export async function getWorkspace(id) {
  const { data } = await api.get(`/workspaces/${id}`);
  return data;
}

export async function updateWorkspace(id, updates) {
  const { data } = await api.patch(`/workspaces/${id}`, updates);
  return data.workspace;
}

export async function deleteWorkspace(id) {
  await api.delete(`/workspaces/${id}`);
}

export async function listMembers(id) {
  const { data } = await api.get(`/workspaces/${id}/members`);
  return data;
}

export async function inviteMember(id, payload) {
  const { data } = await api.post(`/workspaces/${id}/invites`, payload);
  return data.invite;
}

export async function revokeInvite(id, inviteId) {
  await api.delete(`/workspaces/${id}/invites/${inviteId}`);
}

export async function updateMemberRole(id, memberId, role) {
  const { data } = await api.patch(`/workspaces/${id}/members/${memberId}`, { role });
  return data.member;
}

export async function removeMember(id, memberId) {
  await api.delete(`/workspaces/${id}/members/${memberId}`);
}

export async function acceptInvite(token) {
  const { data } = await api.post("/workspaces/invites/accept", { token });
  return data.workspace;
}
