import asyncHandler from "express-async-handler";
import Workspace from "../models/Workspace.js";
import WorkspaceMember from "../models/WorkspaceMember.js";
import WorkspaceInvite from "../models/WorkspaceInvite.js";
import User from "../models/User.js";
import { generateRawToken, hashToken } from "../utils/hashToken.js";
import { sendWorkspaceInviteEmail } from "../utils/email.js";

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MANAGE_ROLES = ["owner", "admin"];

async function getMembership(workspaceId, userId) {
  return WorkspaceMember.findOne({ workspace: workspaceId, user: userId });
}

export const createWorkspace = asyncHandler(async (req, res) => {
  const { name, icon } = req.body;
  if (!name) {
    res.status(400);
    throw new Error("Workspace name is required");
  }

  const workspace = await Workspace.create({
    name,
    icon: icon || "🏢",
    owner: req.user._id,
  });
  await WorkspaceMember.create({
    workspace: workspace._id,
    user: req.user._id,
    role: "owner",
  });

  res.status(201).json({ workspace, role: "owner" });
});

export const listWorkspaces = asyncHandler(async (req, res) => {
  const memberships = await WorkspaceMember.find({ user: req.user._id }).populate("workspace");
  const workspaces = memberships
    .filter((m) => m.workspace)
    .map((m) => ({ ...m.workspace.toObject(), role: m.role }));
  res.json({ workspaces });
});

export const getWorkspace = asyncHandler(async (req, res) => {
  const membership = await getMembership(req.params.id, req.user._id);
  if (!membership) {
    res.status(404);
    throw new Error("Workspace not found");
  }
  const workspace = await Workspace.findById(req.params.id);
  res.json({ workspace, role: membership.role });
});

export const updateWorkspace = asyncHandler(async (req, res) => {
  const membership = await getMembership(req.params.id, req.user._id);
  if (!membership || !MANAGE_ROLES.includes(membership.role)) {
    res.status(403);
    throw new Error("Only owners and admins can update this workspace");
  }

  const updates = {};
  if ("name" in req.body) updates.name = req.body.name;
  if ("icon" in req.body) updates.icon = req.body.icon;

  const workspace = await Workspace.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  res.json({ workspace });
});

export const deleteWorkspace = asyncHandler(async (req, res) => {
  const membership = await getMembership(req.params.id, req.user._id);
  if (!membership || membership.role !== "owner") {
    res.status(403);
    throw new Error("Only the owner can delete this workspace");
  }

  await Workspace.findByIdAndDelete(req.params.id);
  await WorkspaceMember.deleteMany({ workspace: req.params.id });
  await WorkspaceInvite.deleteMany({ workspace: req.params.id });
  res.status(204).send();
});

export const listMembers = asyncHandler(async (req, res) => {
  const membership = await getMembership(req.params.id, req.user._id);
  if (!membership) {
    res.status(404);
    throw new Error("Workspace not found");
  }

  const members = await WorkspaceMember.find({ workspace: req.params.id })
    .populate("user", "name email avatarUrl")
    .sort({ createdAt: 1 });
  const invites = await WorkspaceInvite.find({
    workspace: req.params.id,
    status: "pending",
  }).sort({ createdAt: 1 });

  res.json({ members, invites });
});

export const inviteMember = asyncHandler(async (req, res) => {
  const membership = await getMembership(req.params.id, req.user._id);
  if (!membership || !MANAGE_ROLES.includes(membership.role)) {
    res.status(403);
    throw new Error("Only owners and admins can invite members");
  }

  const { email, role } = req.body;
  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }
  const safeRole = ["admin", "editor", "viewer", "guest"].includes(role) ? role : "viewer";

  const workspace = await Workspace.findById(req.params.id);
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    const alreadyMember = await getMembership(req.params.id, existingUser._id);
    if (alreadyMember) {
      res.status(409);
      throw new Error("This person is already a member");
    }
  }

  const rawToken = generateRawToken();
  const invite = await WorkspaceInvite.create({
    workspace: req.params.id,
    email,
    role: safeRole,
    tokenHash: hashToken(rawToken),
    invitedBy: req.user._id,
    expiresAt: new Date(Date.now() + INVITE_TTL_MS),
  });

  try {
    await sendWorkspaceInviteEmail(email, {
      workspaceName: workspace.name,
      inviterName: req.user.name,
      token: rawToken,
    });
  } catch (err) {
    console.error("Failed to send workspace invite email:", err.message);
  }

  res.status(201).json({ invite });
});

export const revokeInvite = asyncHandler(async (req, res) => {
  const membership = await getMembership(req.params.id, req.user._id);
  if (!membership || !MANAGE_ROLES.includes(membership.role)) {
    res.status(403);
    throw new Error("Only owners and admins can revoke invites");
  }

  await WorkspaceInvite.findOneAndDelete({ _id: req.params.inviteId, workspace: req.params.id });
  res.status(204).send();
});

export const acceptInvite = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) {
    res.status(400);
    throw new Error("Invite token is required");
  }

  const invite = await WorkspaceInvite.findOne({
    tokenHash: hashToken(token),
    status: "pending",
    expiresAt: { $gt: new Date() },
  }).select("+tokenHash");

  if (!invite) {
    res.status(400);
    throw new Error("This invite is invalid or has expired");
  }
  if (invite.email !== req.user.email.toLowerCase()) {
    res.status(403);
    throw new Error("This invite was sent to a different email address");
  }

  const existing = await getMembership(invite.workspace, req.user._id);
  if (!existing) {
    await WorkspaceMember.create({
      workspace: invite.workspace,
      user: req.user._id,
      role: invite.role,
    });
  }
  invite.status = "accepted";
  await invite.save();

  const workspace = await Workspace.findById(invite.workspace);
  res.json({ workspace });
});

export const updateMemberRole = asyncHandler(async (req, res) => {
  const membership = await getMembership(req.params.id, req.user._id);
  if (!membership || !MANAGE_ROLES.includes(membership.role)) {
    res.status(403);
    throw new Error("Only owners and admins can change roles");
  }

  const target = await WorkspaceMember.findOne({
    _id: req.params.memberId,
    workspace: req.params.id,
  });
  if (!target) {
    res.status(404);
    throw new Error("Member not found");
  }
  if (target.role === "owner") {
    res.status(400);
    throw new Error("Cannot change the owner's role");
  }
  const { role } = req.body;
  if (!["admin", "editor", "viewer", "guest"].includes(role)) {
    res.status(400);
    throw new Error("Invalid role");
  }

  target.role = role;
  await target.save();
  res.json({ member: target });
});

export const removeMember = asyncHandler(async (req, res) => {
  const membership = await getMembership(req.params.id, req.user._id);
  if (!membership || !MANAGE_ROLES.includes(membership.role)) {
    res.status(403);
    throw new Error("Only owners and admins can remove members");
  }

  const target = await WorkspaceMember.findOne({
    _id: req.params.memberId,
    workspace: req.params.id,
  });
  if (!target) {
    res.status(404);
    throw new Error("Member not found");
  }
  if (target.role === "owner") {
    res.status(400);
    throw new Error("Cannot remove the workspace owner");
  }

  await target.deleteOne();
  res.status(204).send();
});
