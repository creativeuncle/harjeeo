import { api } from "./api";

export async function listVersions(targetType, targetId) {
  const { data } = await api.get("/versions", { params: { targetType, targetId } });
  return data.versions;
}

export async function restoreVersion(versionId) {
  const { data } = await api.post(`/versions/${versionId}/restore`);
  return data.target;
}
