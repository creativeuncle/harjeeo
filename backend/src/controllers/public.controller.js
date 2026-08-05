import asyncHandler from "express-async-handler";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Note from "../models/Note.js";

export const getPublicProject = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, isPublic: true })
    .select("title icon stage startDate endDate content leads")
    .populate("leads", "name avatarUrl");
  if (!project) {
    res.status(404);
    throw new Error("This page isn't shared publicly");
  }
  res.json({ project });
});

export const getPublicTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, isPublic: true }).select(
    "title status dueDate content properties"
  );
  if (!task) {
    res.status(404);
    throw new Error("This page isn't shared publicly");
  }
  res.json({ task });
});

export const getPublicNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, isPublic: true }).select(
    "title icon date place content"
  );
  if (!note) {
    res.status(404);
    throw new Error("This page isn't shared publicly");
  }
  res.json({ note });
});
