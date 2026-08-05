import { api } from "./api";

export async function listActivity(workspaceId) {
  const { data } = await api.get(`/workspaces/${workspaceId}/activity`);
  return data.activity;
}
