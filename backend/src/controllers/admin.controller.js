import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Workspace from "../models/Workspace.js";
import WorkspaceMember from "../models/WorkspaceMember.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Note from "../models/Note.js";
import { signAccessToken } from "../utils/tokens.js";

const DAY_MS = 24 * 60 * 60 * 1000;

export const getStats = asyncHandler(async (req, res) => {
  const [userCount, workspaceCount, projectCount, taskCount, noteCount] = await Promise.all([
    User.countDocuments(),
    Workspace.countDocuments(),
    Project.countDocuments(),
    Task.countDocuments(),
    Note.countDocuments(),
  ]);

  const since = new Date(Date.now() - 30 * DAY_MS);
  const recentSignups = await User.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    userCount,
    workspaceCount,
    projectCount,
    taskCount,
    noteCount,
    recentSignups: recentSignups.map((d) => ({ date: d._id, count: d.count })),
  });
});

export const listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 25);
  const search = (req.query.search || "").trim();

  const filter = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("name email avatarUrl isEmailVerified isSuperAdmin isSuspended googleId createdAt")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  res.json({ users, total, page, limit });
});

export const listWorkspaces = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 25);
  const search = (req.query.search || "").trim();

  const filter = search ? { name: { $regex: search, $options: "i" } } : {};

  const [workspaces, total] = await Promise.all([
    Workspace.find(filter)
      .populate("owner", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Workspace.countDocuments(filter),
  ]);

  const memberCounts = await WorkspaceMember.aggregate([
    { $match: { workspace: { $in: workspaces.map((w) => w._id) } } },
    { $group: { _id: "$workspace", count: { $sum: 1 } } },
  ]);
  const countByWorkspace = new Map(memberCounts.map((m) => [m._id.toString(), m.count]));

  res.json({
    workspaces: workspaces.map((w) => ({
      _id: w._id,
      name: w.name,
      icon: w.icon,
      owner: w.owner,
      createdAt: w.createdAt,
      memberCount: countByWorkspace.get(w._id.toString()) ?? 0,
    })),
    total,
    page,
    limit,
  });
});

export const setUserSuspended = asyncHandler(async (req, res) => {
  const { suspended } = req.body;
  if (typeof suspended !== "boolean") {
    res.status(400);
    throw new Error("suspended must be a boolean");
  }
  if (req.params.id === req.user._id.toString()) {
    res.status(400);
    throw new Error("You can't suspend your own account");
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isSuspended: suspended },
    { new: true }
  ).select("name email avatarUrl isEmailVerified isSuperAdmin isSuspended googleId createdAt");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json({ user });
});

// Issues a short-lived access token for the target user so an admin can
// view the app as them for support purposes. Deliberately does not touch
// the refresh-token cookie, so the admin's own session is untouched and
// impersonation ends automatically once this access token expires.
export const impersonateUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    res.status(400);
    throw new Error("You're already signed in as yourself");
  }

  const target = await User.findById(req.params.id);
  if (!target) {
    res.status(404);
    throw new Error("User not found");
  }
  if (target.isSuspended) {
    res.status(400);
    throw new Error("Can't impersonate a suspended account");
  }

  const accessToken = signAccessToken(target._id.toString());
  res.json({ user: target.toSafeObject(), accessToken });
});
