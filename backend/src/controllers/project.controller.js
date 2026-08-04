import asyncHandler from "express-async-handler";
import Project from "../models/Project.js";
import { requireMembership } from "../utils/workspaceAuth.js";

const ALLOWED_UPDATE_FIELDS = [
  "title",
  "icon",
  "stage",
  "startDate",
  "endDate",
  "lead",
  "content",
];

export const listProjects = asyncHandler(async (req, res) => {
  await requireMembership(res, req.query.workspaceId, req.user._id);
  const projects = await Project.find({ workspace: req.query.workspaceId }).sort({
    createdAt: -1,
  });
  res.json({ projects });
});

export const createProject = asyncHandler(async (req, res) => {
  const workspaceId = req.body?.workspaceId;
  await requireMembership(res, workspaceId, req.user._id);

  const project = await Project.create({
    owner: req.user._id,
    workspace: workspaceId,
    title: req.body?.title || "Untitled",
  });
  res.status(201).json({ project });
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  await requireMembership(res, project.workspace, req.user._id);
  res.json({ project });
});

export const updateProject = asyncHandler(async (req, res) => {
  const existing = await Project.findById(req.params.id);
  if (!existing) {
    res.status(404);
    throw new Error("Project not found");
  }
  await requireMembership(res, existing.workspace, req.user._id);

  const updates = {};
  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (field in req.body) updates[field] = req.body[field];
  }

  const project = await Project.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  res.json({ project });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const existing = await Project.findById(req.params.id);
  if (!existing) {
    res.status(404);
    throw new Error("Project not found");
  }
  await requireMembership(res, existing.workspace, req.user._id);

  await existing.deleteOne();
  res.status(204).send();
});
