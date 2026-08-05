import { api } from "./api";

export async function getPublicProject(id) {
  const { data } = await api.get(`/public/projects/${id}`);
  return data.project;
}

export async function getPublicTask(id) {
  const { data } = await api.get(`/public/tasks/${id}`);
  return data.task;
}

export async function getPublicNote(id) {
  const { data } = await api.get(`/public/notes/${id}`);
  return data.note;
}
