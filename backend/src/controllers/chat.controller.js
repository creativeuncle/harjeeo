import asyncHandler from "express-async-handler";
import Channel from "../models/Channel.js";
import Message from "../models/Message.js";
import { requireMembership } from "../utils/workspaceAuth.js";
import { getIO } from "../socket.js";

const MESSAGE_POPULATE = [
  { path: "author", select: "name avatarUrl" },
  {
    path: "replyTo",
    select: "body author attachment",
    populate: { path: "author", select: "name avatarUrl" },
  },
];

export const listChannels = asyncHandler(async (req, res) => {
  const { workspaceId } = req.query;
  await requireMembership(res, workspaceId, req.user._id);

  const channels = await Channel.find({ workspace: workspaceId, members: req.user._id })
    .sort({ lastMessageAt: -1, createdAt: -1 })
    .populate("members", "name avatarUrl email");
  res.json({ channels });
});

export const createChannel = asyncHandler(async (req, res) => {
  const { workspaceId, name, memberIds = [] } = req.body;
  if (!name || !name.trim()) {
    res.status(400);
    throw new Error("Channel name is required");
  }
  await requireMembership(res, workspaceId, req.user._id);

  const members = Array.from(new Set([String(req.user._id), ...memberIds.map(String)]));
  const channel = await Channel.create({
    workspace: workspaceId,
    name: name.trim(),
    isDM: false,
    members,
    createdBy: req.user._id,
  });
  await channel.populate("members", "name avatarUrl email");
  res.status(201).json({ channel });
});

export const getOrCreateDM = asyncHandler(async (req, res) => {
  const { workspaceId, userId } = req.body;
  if (!userId) {
    res.status(400);
    throw new Error("userId is required");
  }
  await requireMembership(res, workspaceId, req.user._id);
  await requireMembership(res, workspaceId, userId);

  const memberIds = [String(req.user._id), String(userId)].sort();

  let channel = await Channel.findOne({
    workspace: workspaceId,
    isDM: true,
    members: { $all: memberIds, $size: 2 },
  }).populate("members", "name avatarUrl email");

  if (!channel) {
    channel = await Channel.create({
      workspace: workspaceId,
      isDM: true,
      members: memberIds,
      createdBy: req.user._id,
    });
    await channel.populate("members", "name avatarUrl email");
  }

  res.status(200).json({ channel });
});

async function requireChannelMembership(req, res) {
  const channel = await Channel.findById(req.params.channelId);
  if (!channel) {
    res.status(404);
    throw new Error("Channel not found");
  }
  if (!channel.members.some((m) => String(m) === String(req.user._id))) {
    res.status(403);
    throw new Error("You are not a member of this channel");
  }
  return channel;
}

function onlineUserIdsInChannel(channelId) {
  const io = getIO();
  if (!io) return [];
  const room = io.sockets.adapter.rooms.get(String(channelId));
  if (!room) return [];
  const ids = [];
  for (const socketId of room) {
    const socket = io.sockets.sockets.get(socketId);
    if (socket?.userId) ids.push(String(socket.userId));
  }
  return ids;
}

export const listMessages = asyncHandler(async (req, res) => {
  const channel = await requireChannelMembership(req, res);

  const messages = await Message.find({ channel: channel._id })
    .sort({ createdAt: 1 })
    .limit(200)
    .populate(MESSAGE_POPULATE);
  res.json({ messages });
});

const ATTACHMENT_TYPES = ["image", "file", "audio"];

export const createMessage = asyncHandler(async (req, res) => {
  const { body, attachment, replyTo } = req.body;
  const trimmedBody = typeof body === "string" ? body.trim() : "";

  let cleanAttachment = null;
  if (attachment) {
    if (!attachment.url || !ATTACHMENT_TYPES.includes(attachment.type)) {
      res.status(400);
      throw new Error("Invalid attachment");
    }
    cleanAttachment = {
      url: attachment.url,
      type: attachment.type,
      name: attachment.name ?? "",
    };
  }

  if (!trimmedBody && !cleanAttachment) {
    res.status(400);
    throw new Error("Message body is required");
  }

  const channel = await requireChannelMembership(req, res);

  let replyToId = null;
  if (replyTo) {
    const replySource = await Message.findOne({ _id: replyTo, channel: channel._id }).select("_id");
    if (replySource) replyToId = replySource._id;
  }

  const onlineIds = onlineUserIdsInChannel(channel._id).filter(
    (id) => id !== String(req.user._id)
  );

  const message = await Message.create({
    channel: channel._id,
    author: req.user._id,
    body: trimmedBody,
    attachment: cleanAttachment,
    replyTo: replyToId,
    deliveredTo: onlineIds,
  });
  await message.populate(MESSAGE_POPULATE);
  channel.lastMessageAt = new Date();
  await channel.save();

  res.status(201).json({ message });

  getIO()?.to(String(channel._id)).emit("message:new", { channelId: String(channel._id), message });
});

export const toggleReaction = asyncHandler(async (req, res) => {
  const { emoji } = req.body;
  if (!emoji) {
    res.status(400);
    throw new Error("emoji is required");
  }

  const message = await Message.findById(req.params.messageId);
  if (!message) {
    res.status(404);
    throw new Error("Message not found");
  }
  const channel = await Channel.findById(message.channel);
  if (!channel || !channel.members.some((m) => String(m) === String(req.user._id))) {
    res.status(403);
    throw new Error("You are not a member of this channel");
  }

  const existingIndex = message.reactions.findIndex(
    (r) => String(r.user) === String(req.user._id)
  );
  const hadSameEmoji = existingIndex !== -1 && message.reactions[existingIndex].emoji === emoji;

  if (existingIndex !== -1) {
    message.reactions.splice(existingIndex, 1);
  }
  if (!hadSameEmoji) {
    message.reactions.push({ user: req.user._id, emoji });
  }

  await message.save();
  await message.populate(MESSAGE_POPULATE);

  res.json({ message });

  getIO()
    ?.to(String(message.channel))
    .emit("message:reaction", { channelId: String(message.channel), message });
});

export const togglePinMessage = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.messageId);
  if (!message) {
    res.status(404);
    throw new Error("Message not found");
  }
  const channel = await Channel.findById(message.channel);
  if (!channel || !channel.members.some((m) => String(m) === String(req.user._id))) {
    res.status(403);
    throw new Error("You are not a member of this channel");
  }

  message.pinned = !message.pinned;
  await message.save();
  await message.populate(MESSAGE_POPULATE);

  res.json({ message });

  getIO()
    ?.to(String(message.channel))
    .emit("message:pinned", { channelId: String(message.channel), message });
});

export const markChannelRead = asyncHandler(async (req, res) => {
  const channel = await requireChannelMembership(req, res);

  const result = await Message.updateMany(
    {
      channel: channel._id,
      author: { $ne: req.user._id },
      readBy: { $ne: req.user._id },
    },
    {
      $addToSet: { readBy: req.user._id, deliveredTo: req.user._id },
    }
  );

  res.json({ updated: result.modifiedCount });

  if (result.modifiedCount > 0) {
    getIO()
      ?.to(String(channel._id))
      .emit("message:read", { channelId: String(channel._id), userId: String(req.user._id) });
  }
});
