import asyncHandler from "express-async-handler";
import Project from "../models/Project.js";
import { requireMembership } from "../utils/workspaceAuth.js";
import { notify } from "../utils/notify.js";
import { newlyMentionedIds } from "../utils/mentions.js";
import { logActivity } from "../utils/activity.js";

const ALLOWED_UPDATE_FIELDS = [
  "title",
  "icon",
  "stage",
  "startDate",
  "endDate",
  "leads",
  "content",
];

const LEAD_POPULATE = { path: "leads", select: "name avatarUrl" };

export const listProjects = asyncHandler(async (req, res) => {
  await requireMembership(res, req.query.workspaceId, req.user._id);
  const projects = await Project.find({ workspace: req.query.workspaceId })
    .sort({ createdAt: -1 })
    .populate(LEAD_POPULATE);
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

  logActivity({
    workspace: workspaceId,
    actorId: req.user._id,
    action: "created",
    targetType: "project",
    targetId: project._id,
    targetLabel: project.title,
    link: `/projects/${project._id}`,
  });
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate(LEAD_POPULATE);
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
  if ("endDate" in updates && String(updates.endDate) !== String(existing.endDate)) {
    updates.dueReminderSentAt = null;
  }

  const previousLeads = existing.leads.map(String);

  const project = await Project.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  }).populate(LEAD_POPULATE);

  if (updates.leads) {
    const newlyAdded = updates.leads.filter((id) => !previousLeads.includes(String(id)));
    if (newlyAdded.length) {
      try {
        await notify({
          recipientIds: newlyAdded,
          actorId: req.user._id,
          workspace: project.workspace,
          type: "lead_assigned",
          title: `${req.user.name} added you as lead`,
          body: project.title,
          link: `/projects/${project._id}`,
        });
      } catch (err) {
        console.error("Failed to send lead-assigned notification:", err);
      }
    }
  }

  if ("content" in updates) {
    const newMentions = newlyMentionedIds(existing.content, updates.content);
    if (newMentions.length) {
      try {
        await notify({
          recipientIds: newMentions,
          actorId: req.user._id,
          workspace: project.workspace,
          type: "mention",
          title: `${req.user.name} mentioned you in "${project.title}"`,
          body: "",
          link: `/projects/${project._id}`,
        });
      } catch (err) {
        console.error("Failed to send mention notification:", err);
      }
    }
  }

  res.json({ project });

  if (Object.keys(updates).length) {
    logActivity({
      workspace: project.workspace,
      actorId: req.user._id,
      action: "updated",
      targetType: "project",
      targetId: project._id,
      targetLabel: project.title,
      detail: Object.keys(updates).join(", "),
      link: `/projects/${project._id}`,
    });
  }
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

  logActivity({
    workspace: existing.workspace,
    actorId: req.user._id,
    action: "deleted",
    targetType: "project",
    targetId: existing._id,
    targetLabel: existing.title,
  });
});
