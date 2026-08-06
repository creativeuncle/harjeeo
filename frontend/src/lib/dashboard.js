import { api } from "./api";

export async function getDashboard(workspaceId) {
  const { data } = await api.get("/dashboard", { params: { workspaceId } });
  return data;
}
