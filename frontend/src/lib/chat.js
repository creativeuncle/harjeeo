import { api } from "./api";

export async function listChannels(workspaceId) {
  const { data } = await api.get("/chat/channels", { params: { workspaceId } });
  return data.channels;
}

export async function createChannel(workspaceId, { name, memberIds }) {
  const { data } = await api.post("/chat/channels", { workspaceId, name, memberIds });
  return data.channel;
}

export async function getOrCreateDM(workspaceId, userId) {
  const { data } = await api.post("/chat/dm", { workspaceId, userId });
  return data.channel;
}

export async function listMessages(channelId) {
  const { data } = await api.get(`/chat/channels/${channelId}/messages`);
  return data.messages;
}

export async function sendMessage(channelId, body, attachment = null, replyTo = null) {
  const { data } = await api.post(`/chat/channels/${channelId}/messages`, {
    body,
    attachment,
    replyTo,
  });
  return data.message;
}

export async function toggleReaction(messageId, emoji) {
  const { data } = await api.post(`/chat/messages/${messageId}/reactions`, { emoji });
  return data.message;
}

export async function markChannelRead(channelId) {
  const { data } = await api.post(`/chat/channels/${channelId}/read`);
  return data;
}

export async function togglePinMessage(messageId) {
  const { data } = await api.post(`/chat/messages/${messageId}/pin`);
  return data.message;
}
