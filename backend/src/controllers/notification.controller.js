import asyncHandler from "express-async-handler";
import Notification from "../models/Notification.js";
import WorkspaceInvite from "../models/WorkspaceInvite.js";

export const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("actor", "name avatarUrl")
    .lean();

  const inviteIds = notifications
    .filter((n) => n.type === "workspace_invite" && n.meta?.inviteId)
    .map((n) => n.meta.inviteId);

  if (inviteIds.length > 0) {
    const invites = await WorkspaceInvite.find({ _id: { $in: inviteIds } }).select("status");
    const statusById = new Map(invites.map((i) => [i._id.toString(), i.status]));
    for (const n of notifications) {
      if (n.type === "workspace_invite" && n.meta?.inviteId) {
        n.meta.inviteStatus = statusById.get(n.meta.inviteId.toString()) ?? "pending";
      }
    }
  }

  res.json({ notifications });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user._id,
  });
  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }
  notification.read = true;
  await notification.save();
  res.json({ notification });
});

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, read: false },
    { $set: { read: true } }
  );
  res.json({ ok: true });
});
