import Project from "../models/Project.js";
import Task from "../models/Task.js";
import { notify } from "./notify.js";

const REMINDER_WINDOW_MS = 24 * 60 * 60 * 1000; // notify when due within 24h

export async function checkDueDateReminders() {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_MS);

  const dueProjects = await Project.find({
    endDate: { $gte: now, $lte: windowEnd },
    dueReminderSentAt: null,
  }).select("title leads workspace endDate");

  for (const project of dueProjects) {
    if (!project.leads?.length) continue;
    // eslint-disable-next-line no-await-in-loop
    await notify({
      recipientIds: project.leads,
      workspace: project.workspace,
      type: "due_reminder",
      title: `"${project.title}" is due soon`,
      body: `Due ${project.endDate.toLocaleDateString()}`,
      link: `/projects/${project._id}`,
    });
    // eslint-disable-next-line no-await-in-loop
    project.dueReminderSentAt = now;
    // eslint-disable-next-line no-await-in-loop
    await project.save();
  }

  const dueTasks = await Task.find({
    dueDate: { $gte: now, $lte: windowEnd },
    dueReminderSentAt: null,
    status: { $ne: "done" },
  }).select("title owner workspace dueDate");

  for (const task of dueTasks) {
    // eslint-disable-next-line no-await-in-loop
    await notify({
      recipientIds: task.owner,
      workspace: task.workspace,
      type: "due_reminder",
      title: `"${task.title}" is due soon`,
      body: `Due ${task.dueDate.toLocaleDateString()}`,
      link: `/tasks/${task._id}`,
    });
    // eslint-disable-next-line no-await-in-loop
    task.dueReminderSentAt = now;
    // eslint-disable-next-line no-await-in-loop
    await task.save();
  }

  return { projects: dueProjects.length, tasks: dueTasks.length };
}

export function scheduleDueDateReminders(intervalMs = 60 * 60 * 1000) {
  checkDueDateReminders().catch((err) =>
    console.error("Due date reminder check failed:", err)
  );
  return setInterval(() => {
    checkDueDateReminders().catch((err) =>
      console.error("Due date reminder check failed:", err)
    );
  }, intervalMs);
}
