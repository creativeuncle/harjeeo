import asyncHandler from "express-async-handler";
import Task from "../models/Task.js";
import { requireMembership } from "../utils/workspaceAuth.js";

const STATUSES = ["not_started", "up_next", "in_progress", "done"];

export const listTasks = asyncHandler(async (req, res) => {
  await requireMembership(res, req.query.workspaceId, req.user._id);
  const tasks = await Task.find({ workspace: req.query.workspaceId }).sort({
    status: 1,
    order: 1,
  });
  res.json({ tasks });
});

export const createTask = asyncHandler(async (req, res) => {
  const workspaceId = req.body?.workspaceId;
  await requireMembership(res, workspaceId, req.user._id);

  const status = STATUSES.includes(req.body?.status) ? req.body.status : "not_started";

  const last = await Task.findOne({ workspace: workspaceId, status }).sort({ order: -1 });
  const task = await Task.create({
    owner: req.user._id,
    workspace: workspaceId,
    title: req.body?.title || "New task",
    status,
    order: last ? last.order + 1 : 0,
  });

  res.status(201).json({ task });
});

export const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }
  await requireMembership(res, task.workspace, req.user._id);
  res.json({ task });
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }
  await requireMembership(res, task.workspace, req.user._id);

  if ("title" in req.body) task.title = req.body.title;
  if ("content" in req.body) task.content = req.body.content;
  if ("projectId" in req.body) task.projectId = req.body.projectId || null;
  if ("properties" in req.body) {
    for (const [key, value] of Object.entries(req.body.properties)) {
      task.properties.set(key, value);
    }
  }
  await task.save();
  res.json({ task });
});

export const moveTask = asyncHandler(async (req, res) => {
  const { status, order } = req.body;
  if (!STATUSES.includes(status) || typeof order !== "number") {
    res.status(400);
    throw new Error("status and numeric order are required");
  }

  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }
  await requireMembership(res, task.workspace, req.user._id);

  const sourceStatus = task.status;
  const workspaceId = task.workspace;
  task.status = status;
  await task.save();

  const destTasks = await Task.find({ workspace: workspaceId, status }).sort({ order: 1 });
  const reordered = destTasks.filter((t) => String(t._id) !== String(task._id));
  reordered.splice(Math.min(order, reordered.length), 0, task);
  await Promise.all(
    reordered.map((t, index) => Task.updateOne({ _id: t._id }, { order: index }))
  );

  if (sourceStatus !== status) {
    const sourceTasks = await Task.find({ workspace: workspaceId, status: sourceStatus }).sort({
      order: 1,
    });
    await Promise.all(
      sourceTasks.map((t, index) => Task.updateOne({ _id: t._id }, { order: index }))
    );
  }

  res.json({ ok: true });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }
  await requireMembership(res, task.workspace, req.user._id);

  await task.deleteOne();
  res.status(204).send();
});
