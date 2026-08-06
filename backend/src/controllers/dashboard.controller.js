import asyncHandler from "express-async-handler";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import { requireMembership } from "../utils/workspaceAuth.js";

const TASK_STATUSES = ["not_started", "up_next", "in_progress", "done"];

export const getDashboard = asyncHandler(async (req, res) => {
  const { workspaceId } = req.query;
  await requireMembership(res, workspaceId, req.user._id);

  const [projects, tasks] = await Promise.all([
    Project.find({ workspace: workspaceId, deletedAt: null }).select("title icon stage"),
    Task.find({ workspace: workspaceId, deletedAt: null }).select("title status dueDate projectId"),
  ]);

  const taskStatusCounts = Object.fromEntries(TASK_STATUSES.map((s) => [s, 0]));
  const now = new Date();
  let overdueCount = 0;

  for (const t of tasks) {
    if (t.status in taskStatusCounts) taskStatusCounts[t.status] += 1;
    if (t.dueDate && new Date(t.dueDate) < now && t.status !== "done") overdueCount += 1;
  }

  const stageCounts = {};
  for (const p of projects) {
    stageCounts[p.stage] = (stageCounts[p.stage] ?? 0) + 1;
  }

  const projectProgress = projects.map((p) => {
    const projectTasks = tasks.filter((t) => String(t.projectId) === String(p._id));
    const doneTasks = projectTasks.filter((t) => t.status === "done").length;
    return {
      _id: p._id,
      title: p.title,
      icon: p.icon,
      stage: p.stage,
      totalTasks: projectTasks.length,
      doneTasks,
      percent: projectTasks.length ? Math.round((doneTasks / projectTasks.length) * 100) : 0,
    };
  });

  res.json({
    totalProjects: projects.length,
    totalTasks: tasks.length,
    overdueCount,
    taskStatusCounts,
    stageCounts,
    projectProgress,
  });
});
