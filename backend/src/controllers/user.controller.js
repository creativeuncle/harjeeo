import asyncHandler from "express-async-handler";
import { getIO } from "../socket.js";

const ALLOWED_FIELDS = ["name", "avatarUrl", "language"];
const MANUAL_STATUSES = ["away", "busy", "in_meeting"];

export const updateMe = asyncHandler(async (req, res) => {
  for (const field of ALLOWED_FIELDS) {
    if (field in req.body) req.user[field] = req.body[field];
  }
  await req.user.save();
  res.json({ user: req.user.toSafeObject() });
});

export const updatePresence = asyncHandler(async (req, res) => {
  const { manualStatus, statusMessage } = req.body;

  if (manualStatus !== undefined) {
    if (manualStatus !== null && !MANUAL_STATUSES.includes(manualStatus)) {
      res.status(400);
      throw new Error("Invalid status");
    }
    req.user.manualStatus = manualStatus;
  }
  if (statusMessage !== undefined) {
    req.user.statusMessage = statusMessage;
  }
  await req.user.save();

  getIO()?.emit("presence:status", {
    userId: String(req.user._id),
    manualStatus: req.user.manualStatus,
    statusMessage: req.user.statusMessage,
  });

  res.json({ user: req.user.toSafeObject() });
});
