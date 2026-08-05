import asyncHandler from "express-async-handler";
import Note from "../models/Note.js";
import { requireMembership } from "../utils/workspaceAuth.js";

const ALLOWED_UPDATE_FIELDS = ["title", "icon", "date", "place", "content", "isPublic"];

export const listNotes = asyncHandler(async (req, res) => {
  await requireMembership(res, req.query.workspaceId, req.user._id);
  const notes = await Note.find({
    workspace: req.query.workspaceId,
    owner: req.user._id,
  }).sort({ createdAt: -1 });
  res.json({ notes });
});

export const createNote = asyncHandler(async (req, res) => {
  const workspaceId = req.body?.workspaceId;
  await requireMembership(res, workspaceId, req.user._id);

  const note = await Note.create({
    owner: req.user._id,
    workspace: workspaceId,
    title: req.body?.title || "Untitled",
  });
  res.status(201).json({ note });
});

export const getNote = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) {
    res.status(404);
    throw new Error("Note not found");
  }
  await requireMembership(res, note.workspace, req.user._id);
  if (String(note.owner) !== String(req.user._id)) {
    res.status(403);
    throw new Error("This note is private to its owner");
  }
  res.json({ note });
});

export const updateNote = asyncHandler(async (req, res) => {
  const existing = await Note.findById(req.params.id);
  if (!existing) {
    res.status(404);
    throw new Error("Note not found");
  }
  await requireMembership(res, existing.workspace, req.user._id);
  if (String(existing.owner) !== String(req.user._id)) {
    res.status(403);
    throw new Error("This note is private to its owner");
  }

  const updates = {};
  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (field in req.body) updates[field] = req.body[field];
  }

  const note = await Note.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  res.json({ note });
});

export const deleteNote = asyncHandler(async (req, res) => {
  const existing = await Note.findById(req.params.id);
  if (!existing) {
    res.status(404);
    throw new Error("Note not found");
  }
  await requireMembership(res, existing.workspace, req.user._id);
  if (String(existing.owner) !== String(req.user._id)) {
    res.status(403);
    throw new Error("This note is private to its owner");
  }

  await existing.deleteOne();
  res.status(204).send();
});
