import { api } from "./api";

export async function listTrash(workspaceId) {
  const { data } = await api.get("/trash", { params: { workspaceId } });
  return data; // { projects, tasks, notes }
}

export async function restoreItem(type, id) {
  const { data } = await api.post(`/trash/${type}/${id}/restore`);
  return data.item;
}

export async function permanentlyDeleteItem(type, id) {
  await api.delete(`/trash/${type}/${id}`);
}
