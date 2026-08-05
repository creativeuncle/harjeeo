import { api } from "./api";

export async function listNotes(workspaceId) {
  const { data } = await api.get("/notes", { params: { workspaceId } });
  return data.notes;
}

export async function createNote(workspaceId, payload = {}) {
  const { data } = await api.post("/notes", { ...payload, workspaceId });
  return data.note;
}

export async function getNote(id) {
  const { data } = await api.get(`/notes/${id}`);
  return data.note;
}

export async function updateNote(id, updates) {
  const { data } = await api.patch(`/notes/${id}`, updates);
  return data.note;
}

export async function deleteNote(id) {
  await api.delete(`/notes/${id}`);
}
