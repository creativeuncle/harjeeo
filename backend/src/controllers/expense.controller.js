import asyncHandler from "express-async-handler";
import Project from "../models/Project.js";
import Expense from "../models/Expense.js";
import { requireMembership } from "../utils/workspaceAuth.js";
import { projectRoleFor } from "../utils/projectPermissions.js";

async function requireProjectAccess(req, res, { requireEdit = false } = {}) {
  const project = await Project.findOne({ _id: req.params.projectId, deletedAt: null });
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  const membership = await requireMembership(res, project.workspace, req.user._id);
  const role = projectRoleFor(project, req.user._id, membership.role);
  if (requireEdit && role !== "editor") {
    res.status(403);
    throw new Error("You have read-only access to this project");
  }
  return project;
}

export const listExpenses = asyncHandler(async (req, res) => {
  const project = await requireProjectAccess(req, res);
  const expenses = await Expense.find({ project: project._id })
    .sort({ date: -1, createdAt: -1 })
    .populate("createdBy", "name avatarUrl");
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  res.json({ expenses, total, budget: project.budget });
});

export const createExpense = asyncHandler(async (req, res) => {
  const project = await requireProjectAccess(req, res, { requireEdit: true });
  const { description, amount, category, date } = req.body;

  if (typeof amount !== "number" || Number.isNaN(amount)) {
    res.status(400);
    throw new Error("A valid amount is required");
  }

  const expense = await Expense.create({
    project: project._id,
    workspace: project.workspace,
    description: description ?? "",
    amount,
    category: category || "General",
    date: date || Date.now(),
    createdBy: req.user._id,
  });
  await expense.populate("createdBy", "name avatarUrl");
  res.status(201).json({ expense });
});

export const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) {
    res.status(404);
    throw new Error("Expense not found");
  }
  req.params.projectId = String(expense.project);
  await requireProjectAccess(req, res, { requireEdit: true });
  await expense.deleteOne();
  res.status(204).end();
});
