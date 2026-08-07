import { api } from "./api";

export async function updatePresence(updates) {
  const { data } = await api.patch("/users/me/presence", updates);
  return data.user;
}

export const MANUAL_STATUS_META = {
  away: { label: "Away", dot: "bg-amber-400" },
  busy: { label: "Busy", dot: "bg-red-500" },
  in_meeting: { label: "In a meeting", dot: "bg-violet-500" },
};
