import { api } from "./api";

export async function listExpenses(projectId) {
  const { data } = await api.get(`/projects/${projectId}/expenses`);
  return data;
}

export async function createExpense(projectId, payload) {
  const { data } = await api.post(`/projects/${projectId}/expenses`, payload);
  return data.expense;
}

export async function deleteExpense(id) {
  await api.delete(`/expenses/${id}`);
}
