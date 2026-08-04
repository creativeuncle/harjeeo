import asyncHandler from "express-async-handler";
import TaskProperty, { PROPERTY_TYPES } from "../models/TaskProperty.js";
import { requireMembership } from "../utils/workspaceAuth.js";

function slugify(name) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "property"
  );
}

async function uniqueKey(workspaceId, name) {
  const base = slugify(name);
  let key = base;
  let i = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await TaskProperty.exists({ workspace: workspaceId, key })) {
    key = `${base}_${i}`;
    i += 1;
  }
  return key;
}

export const listTaskProperties = asyncHandler(async (req, res) => {
  await requireMembership(res, req.query.workspaceId, req.user._id);
  const properties = await TaskProperty.find({ workspace: req.query.workspaceId }).sort({
    order: 1,
  });
  res.json({ properties });
});

export const createTaskProperty = asyncHandler(async (req, res) => {
  const { name, type, options, workspaceId } = req.body;
  await requireMembership(res, workspaceId, req.user._id);

  if (!name || !type) {
    res.status(400);
    throw new Error("Name and type are required");
  }
  if (!PROPERTY_TYPES.includes(type)) {
    res.status(400);
    throw new Error(`Unsupported property type: ${type}`);
  }

  const key = await uniqueKey(workspaceId, name);
  const last = await TaskProperty.findOne({ workspace: workspaceId }).sort({ order: -1 });

  const needsOptions = type === "select" || type === "multiSelect" || type === "status";
  const property = await TaskProperty.create({
    owner: req.user._id,
    workspace: workspaceId,
    key,
    name,
    type,
    options: needsOptions ? options ?? [] : undefined,
    order: last ? last.order + 1 : 0,
  });

  res.status(201).json({ property });
});

export const updateTaskProperty = asyncHandler(async (req, res) => {
  const existing = await TaskProperty.findById(req.params.id);
  if (!existing) {
    res.status(404);
    throw new Error("Property not found");
  }
  await requireMembership(res, existing.workspace, req.user._id);

  const updates = {};
  for (const field of ["name", "options"]) {
    if (field in req.body) updates[field] = req.body[field];
  }

  const property = await TaskProperty.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  res.json({ property });
});

export const deleteTaskProperty = asyncHandler(async (req, res) => {
  const existing = await TaskProperty.findById(req.params.id);
  if (!existing) {
    res.status(404);
    throw new Error("Property not found");
  }
  await requireMembership(res, existing.workspace, req.user._id);

  await existing.deleteOne();
  res.status(204).send();
});
