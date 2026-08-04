import { api } from "./api";

export async function listStageOptions(workspaceId) {
  const { data } = await api.get(`/workspaces/${workspaceId}/project-stage-options`);
  return data.options;
}

export async function createStageOption(workspaceId, payload) {
  const { data } = await api.post(`/workspaces/${workspaceId}/project-stage-options`, payload);
  return data.option;
}

export async function updateStageOption(workspaceId, optionId, updates) {
  const { data } = await api.patch(
    `/workspaces/${workspaceId}/project-stage-options/${optionId}`,
    updates
  );
  return data.option;
}

export async function deleteStageOption(workspaceId, optionId) {
  await api.delete(`/workspaces/${workspaceId}/project-stage-options/${optionId}`);
}
