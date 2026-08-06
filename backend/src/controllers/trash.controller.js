import asyncHandler from "express-async-handler";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Note from "../models/Note.js";
import { requireMembership } from "../utils/workspaceAuth.js";

const MODELS = { projects: Project, tasks: Task, notes: Note };

async function loadOwnedItem(type, id, res, req) {
  const Model = MODELS[type];
  if (!Model) {
    res.status(400);
    throw new Error("Unknown item type");
  }
  const item = await Model.findById(id);
  if (!item) {
    res.status(404);
    throw new Error("Item not found");
  }
  await requireMembership(res, item.workspace, req.user._id);
  if (type === "notes" && String(item.owner) !== String(req.user._id)) {
    res.status(403);
    throw new Error("This note is private to its owner");
  }
  return item;
}

export const listTrash = asyncHandler(async (req, res) => {
  const { workspaceId } = req.query;
  await requireMembership(res, workspaceId, req.user._id);

  const [projects, tasks, notes] = await Promise.all([
    Project.find({ workspace: workspaceId, deletedAt: { $ne: null } })
      .select("title icon deletedAt")
      .sort({ deletedAt: -1 }),
    Task.find({ workspace: workspaceId, deletedAt: { $ne: null } })
      .select("title deletedAt")
      .sort({ deletedAt: -1 }),
    Note.find({ workspace: workspaceId, owner: req.user._id, deletedAt: { $ne: null } })
      .select("title icon deletedAt")
      .sort({ deletedAt: -1 }),
  ]);

  res.json({ projects, tasks, notes });
});

export const restoreItem = asyncHandler(async (req, res) => {
  const item = await loadOwnedItem(req.params.type, req.params.id, res, req);
  item.deletedAt = null;
  await item.save();
  res.json({ item });
});

export const permanentlyDeleteItem = asyncHandler(async (req, res) => {
  const item = await loadOwnedItem(req.params.type, req.params.id, res, req);
  await item.deleteOne();
  res.status(204).send();
});
