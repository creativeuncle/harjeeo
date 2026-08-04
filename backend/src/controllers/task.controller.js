import asyncHandler from "express-async-handler";
import Task from "../models/Task.js";

const STATUSES = ["not_started", "up_next", "in_progress", "done"];

export const listTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ owner: req.user._id }).sort({ status: 1, order: 1 });
  res.json({ tasks });
});

export const createTask = asyncHandler(async (req, res) => {
  const status = STATUSES.includes(req.body?.status) ? req.body.status : "not_started";

  const last = await Task.findOne({ owner: req.user._id, status }).sort({ order: -1 });
  const task = await Task.create({
    owner: req.user._id,
    title: req.body?.title || "New task",
    status,
    order: last ? last.order + 1 : 0,
  });

  res.status(201).json({ task });
});

export const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }
  res.json({ task });
});

export const updateTask = asyncHandler(async (req, res) => {
  const updates = {};
  if ("title" in req.body) updates.title = req.body.title;
  if ("content" in req.body) updates.content = req.body.content;
  if ("projectId" in req.body) updates.projectId = req.body.projectId || null;
  if ("properties" in req.body) {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
    if (!task) {
      res.status(404);
      throw new Error("Task not found");
    }
    for (const [key, value] of Object.entries(req.body.properties)) {
      task.properties.set(key, value);
    }
    Object.assign(task, updates);
    await task.save();
    res.json({ task });
    return;
  }

  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    updates,
    { new: true, runValidators: true }
  );

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  res.json({ task });
});

export const moveTask = asyncHandler(async (req, res) => {
  const { status, order } = req.body;
  if (!STATUSES.includes(status) || typeof order !== "number") {
    res.status(400);
    throw new Error("status and numeric order are required");
  }

  const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  const sourceStatus = task.status;
  task.status = status;
  await task.save();

  const destTasks = await Task.find({ owner: req.user._id, status }).sort({ order: 1 });
  const reordered = destTasks.filter((t) => String(t._id) !== String(task._id));
  reordered.splice(Math.min(order, reordered.length), 0, task);
  await Promise.all(
    reordered.map((t, index) => Task.updateOne({ _id: t._id }, { order: index }))
  );

  if (sourceStatus !== status) {
    const sourceTasks = await Task.find({ owner: req.user._id, status: sourceStatus }).sort({
      order: 1,
    });
    await Promise.all(
      sourceTasks.map((t, index) => Task.updateOne({ _id: t._id }, { order: index }))
    );
  }

  res.json({ ok: true });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }
  res.status(204).send();
});
