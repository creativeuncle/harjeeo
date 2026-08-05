import asyncHandler from "express-async-handler";
import Comment from "../models/Comment.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import { requireMembership } from "../utils/workspaceAuth.js";
import { notify } from "../utils/notify.js";
import { logActivity } from "../utils/activity.js";

const TARGET_MODELS = { project: Project, task: Task };

async function resolveTarget(targetType, targetId) {
  const Model = TARGET_MODELS[targetType];
  if (!Model || !targetId) return null;
  return Model.findById(targetId);
}

// Leads of the project this comment lives under (directly, or via the
// task's linked project) are who gets notified about new comments.
async function resolveProjectLeads(targetType, target) {
  const project =
    targetType === "project"
      ? target
      : target.projectId
        ? await Project.findById(target.projectId).select("leads title")
        : null;
  return project;
}

export const listComments = asyncHandler(async (req, res) => {
  const { targetType, targetId } = req.query;
  const target = await resolveTarget(targetType, targetId);
  if (!target) {
    res.status(404);
    throw new Error("Not found");
  }
  await requireMembership(res, target.workspace, req.user._id);

  const comments = await Comment.find({ targetType, targetId })
    .sort({ createdAt: 1 })
    .populate("author", "name avatarUrl");
  res.json({ comments });
});

export const createComment = asyncHandler(async (req, res) => {
  const { targetType, targetId, body, mentions } = req.body;
  if (!body || !body.trim()) {
    res.status(400);
    throw new Error("Comment body is required");
  }
  const target = await resolveTarget(targetType, targetId);
  if (!target) {
    res.status(404);
    throw new Error("Not found");
  }
  await requireMembership(res, target.workspace, req.user._id);

  const comment = await Comment.create({
    body: body.trim(),
    author: req.user._id,
    workspace: target.workspace,
    targetType,
    targetId,
  });
  await comment.populate("author", "name avatarUrl");
  res.status(201).json({ comment });

  const link = targetType === "project" ? `/projects/${target._id}` : `/tasks/${target._id}`;

  logActivity({
    workspace: target.workspace,
    actorId: req.user._id,
    action: "commented",
    targetType,
    targetId: target._id,
    targetLabel: target.title,
    link,
  });

  try {
    const project = await resolveProjectLeads(targetType, target);
    if (project?.leads?.length) {
      await notify({
        recipientIds: project.leads,
        actorId: req.user._id,
        workspace: target.workspace,
        type: "comment",
        title: `${req.user.name} commented`,
        body: comment.body,
        link,
      });
    }
  } catch (err) {
    console.error("Failed to send comment notification:", err);
  }

  if (Array.isArray(mentions) && mentions.length) {
    try {
      await notify({
        recipientIds: mentions,
        actorId: req.user._id,
        workspace: target.workspace,
        type: "mention",
        title: `${req.user.name} mentioned you in a comment`,
        body: comment.body,
        link,
      });
    } catch (err) {
      console.error("Failed to send mention notification:", err);
    }
  }
});

export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }
  await requireMembership(res, comment.workspace, req.user._id);
  if (String(comment.author) !== String(req.user._id)) {
    res.status(403);
    throw new Error("You can only delete your own comments");
  }
  await comment.deleteOne();
  res.status(204).send();
});
