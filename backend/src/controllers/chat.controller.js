import asyncHandler from "express-async-handler";
import Channel from "../models/Channel.js";
import Message from "../models/Message.js";
import { requireMembership } from "../utils/workspaceAuth.js";
import { getIO } from "../socket.js";

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

export const listMessages = asyncHandler(async (req, res) => {
  const channel = await requireChannelMembership(req, res);

  const messages = await Message.find({ channel: channel._id })
    .sort({ createdAt: 1 })
    .limit(200)
    .populate("author", "name avatarUrl");
  res.json({ messages });
});

export const createMessage = asyncHandler(async (req, res) => {
  const { body } = req.body;
  if (!body || !body.trim()) {
    res.status(400);
    throw new Error("Message body is required");
  }
  const channel = await requireChannelMembership(req, res);

  const message = await Message.create({
    channel: channel._id,
    author: req.user._id,
    body: body.trim(),
  });
  await message.populate("author", "name avatarUrl");
  channel.lastMessageAt = new Date();
  await channel.save();

  res.status(201).json({ message });

  getIO()?.to(String(channel._id)).emit("message:new", { channelId: String(channel._id), message });
});
