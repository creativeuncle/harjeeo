import { api } from "./api";

export async function listBookmarks(workspaceId) {
  const { data } = await api.get("/bookmarks", { params: { workspaceId } });
  return data.bookmarks;
}

export async function createBookmark(workspaceId, payload) {
  const { data } = await api.post("/bookmarks", { ...payload, workspaceId });
  return data.bookmark;
}

export async function updateBookmark(id, updates) {
  const { data } = await api.patch(`/bookmarks/${id}`, updates);
  return data.bookmark;
}

export async function deleteBookmark(id) {
  await api.delete(`/bookmarks/${id}`);
}

export function faviconFor(url) {
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=64`;
  } catch {
    return null;
  }
}
