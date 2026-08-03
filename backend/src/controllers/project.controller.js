import asyncHandler from "express-async-handler";
import Project from "../models/Project.js";

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
  const projects = await Project.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.json({ projects });
});

export const createProject = asyncHandler(async (req, res) => {
  const project = await Project.create({
    owner: req.user._id,
    title: req.body?.title || "Untitled",
  });
  res.status(201).json({ project });
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  res.json({ project });
});

export const updateProject = asyncHandler(async (req, res) => {
  const updates = {};
  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (field in req.body) updates[field] = req.body[field];
  }

  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    updates,
    { new: true, runValidators: true }
  );

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  res.json({ project });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findOneAndDelete({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  res.status(204).send();
});
