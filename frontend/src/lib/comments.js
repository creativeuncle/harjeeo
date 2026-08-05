import { api } from "./api";

export async function listComments(targetType, targetId) {
  const { data } = await api.get("/comments", { params: { targetType, targetId } });
  return data.comments;
}

export async function createComment(targetType, targetId, body, mentions = []) {
  const { data } = await api.post("/comments", { targetType, targetId, body, mentions });
  return data.comment;
}

export async function deleteComment(id) {
  await api.delete(`/comments/${id}`);
}
