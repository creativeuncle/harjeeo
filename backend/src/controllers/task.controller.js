import asyncHandler from "express-async-handler";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import { requireMembership } from "../utils/workspaceAuth.js";
import { notify } from "../utils/notify.js";
import { newlyMentionedIds } from "../utils/mentions.js";
import { logActivity } from "../utils/activity.js";

const STATUS_LABELS = {
  not_started: "Not started",
  up_next: "Up next",
  in_progress: "In progress",
  done: "Done",
};

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

  logActivity({
    workspace: workspaceId,
    actorId: req.user._id,
    action: "created",
    targetType: "task",
    targetId: task._id,
    targetLabel: task.title,
    link: `/tasks/${task._id}`,
  });
});

export const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate("dependsOn", "title status");
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

  const previousContent = task.content;

  if ("title" in req.body) task.title = req.body.title;
  if ("content" in req.body) task.content = req.body.content;
  if ("projectId" in req.body) task.projectId = req.body.projectId || null;
  if ("dueDate" in req.body) {
    const nextDueDate = req.body.dueDate || null;
    if (String(nextDueDate) !== String(task.dueDate)) task.dueReminderSentAt = null;
    task.dueDate = nextDueDate;
  }
  if ("dependsOn" in req.body) task.dependsOn = req.body.dependsOn || [];
  if ("properties" in req.body) {
    for (const [key, value] of Object.entries(req.body.properties)) {
      task.properties.set(key, value);
    }
  }
  await task.save();
  res.json({ task });

  const changedFields = Object.keys(req.body).filter((key) =>
    ["title", "content", "projectId", "dueDate", "dependsOn", "properties"].includes(key)
  );
  if (changedFields.length) {
    logActivity({
      workspace: task.workspace,
      actorId: req.user._id,
      action: "updated",
      targetType: "task",
      targetId: task._id,
      targetLabel: task.title,
      detail: changedFields.join(", "),
      link: `/tasks/${task._id}`,
    });
  }

  if ("content" in req.body) {
    const newMentions = newlyMentionedIds(previousContent, task.content);
    if (newMentions.length) {
      try {
        await notify({
          recipientIds: newMentions,
          actorId: req.user._id,
          workspace: task.workspace,
          type: "mention",
          title: `${req.user.name} mentioned you in "${task.title}"`,
          body: "",
          link: `/tasks/${task._id}`,
        });
      } catch (err) {
        console.error("Failed to send mention notification:", err);
      }
    }
  }
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

  if (status === "done" && task.dependsOn?.length) {
    const deps = await Task.find({ _id: { $in: task.dependsOn } }).select("title status");
    const incomplete = deps.filter((d) => d.status !== "done");
    if (incomplete.length) {
      res.status(409);
      throw new Error(
        `Blocked by unfinished task${incomplete.length > 1 ? "s" : ""}: ${incomplete
          .map((d) => d.title)
          .join(", ")}`
      );
    }
  }

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

  if (sourceStatus !== status) {
    logActivity({
      workspace: workspaceId,
      actorId: req.user._id,
      action: "moved",
      targetType: "task",
      targetId: task._id,
      targetLabel: task.title,
      detail: `${STATUS_LABELS[sourceStatus]} → ${STATUS_LABELS[status]}`,
      link: `/tasks/${task._id}`,
    });
  }

  if (sourceStatus !== status && task.projectId) {
    try {
      const project = await Project.findById(task.projectId).select("leads title");
      if (project?.leads?.length) {
        await notify({
          recipientIds: project.leads,
          actorId: req.user._id,
          workspace: workspaceId,
          type: "task_moved",
          title: `${req.user.name} moved "${task.title}"`,
          body: `${STATUS_LABELS[sourceStatus]} → ${STATUS_LABELS[status]}`,
          link: `/tasks/${task._id}`,
        });
      }
    } catch (err) {
      console.error("Failed to send task-moved notification:", err);
    }
  }
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

  logActivity({
    workspace: task.workspace,
    actorId: req.user._id,
    action: "deleted",
    targetType: "task",
    targetId: task._id,
    targetLabel: task.title,
  });
});
