import asyncHandler from "express-async-handler";
import ContentVersion from "../models/ContentVersion.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Note from "../models/Note.js";
import { requireMembership } from "../utils/workspaceAuth.js";
import { canEditProject } from "../utils/projectPermissions.js";

const MODELS = { project: Project, task: Task, note: Note };

async function loadTarget(targetType, targetId, req, res) {
  const Model = MODELS[targetType];
  if (!Model) {
    res.status(400);
    throw new Error("Unknown target type");
  }
  const target = await Model.findById(targetId);
  if (!target) {
    res.status(404);
    throw new Error("Not found");
  }
  const membership = await requireMembership(res, target.workspace, req.user._id);
  if (targetType === "project" && !canEditProject(target, req.user._id, membership.role)) {
    res.status(403);
    throw new Error("You only have viewer access to this project");
  }
  if (targetType === "note" && String(target.owner) !== String(req.user._id)) {
    res.status(403);
    throw new Error("This note is private to its owner");
  }
  return target;
}

export const listVersions = asyncHandler(async (req, res) => {
  const { targetType, targetId } = req.query;
  await loadTarget(targetType, targetId, req, res);

  const versions = await ContentVersion.find({ targetType, targetId })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("savedBy", "name avatarUrl")
    .select("-content");
  res.json({ versions });
});

export const getVersion = asyncHandler(async (req, res) => {
  const version = await ContentVersion.findById(req.params.id).populate("savedBy", "name avatarUrl");
  if (!version) {
    res.status(404);
    throw new Error("Version not found");
  }
  await loadTarget(version.targetType, version.targetId, req, res);
  res.json({ version });
});

export const restoreVersion = asyncHandler(async (req, res) => {
  const version = await ContentVersion.findById(req.params.id);
  if (!version) {
    res.status(404);
    throw new Error("Version not found");
  }
  const target = await loadTarget(version.targetType, version.targetId, req, res);

  // Snapshot the current content first, so a restore is itself undoable.
  await ContentVersion.create({
    targetType: version.targetType,
    targetId: version.targetId,
    content: target.content,
    savedBy: req.user._id,
  });

  target.content = version.content;
  await target.save();

  res.json({ target });
});
