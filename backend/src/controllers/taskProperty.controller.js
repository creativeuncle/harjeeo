import asyncHandler from "express-async-handler";
import TaskProperty, { PROPERTY_TYPES } from "../models/TaskProperty.js";

function slugify(name) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "property"
  );
}

async function uniqueKey(ownerId, name) {
  const base = slugify(name);
  let key = base;
  let i = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await TaskProperty.exists({ owner: ownerId, key })) {
    key = `${base}_${i}`;
    i += 1;
  }
  return key;
}

export const listTaskProperties = asyncHandler(async (req, res) => {
  const properties = await TaskProperty.find({ owner: req.user._id }).sort({ order: 1 });
  res.json({ properties });
});

export const createTaskProperty = asyncHandler(async (req, res) => {
  const { name, type, options } = req.body;

  if (!name || !type) {
    res.status(400);
    throw new Error("Name and type are required");
  }
  if (!PROPERTY_TYPES.includes(type)) {
    res.status(400);
    throw new Error(`Unsupported property type: ${type}`);
  }

  const key = await uniqueKey(req.user._id, name);
  const last = await TaskProperty.findOne({ owner: req.user._id }).sort({ order: -1 });

  const needsOptions = type === "select" || type === "multiSelect" || type === "status";
  const property = await TaskProperty.create({
    owner: req.user._id,
    key,
    name,
    type,
    options: needsOptions ? options ?? [] : undefined,
    order: last ? last.order + 1 : 0,
  });

  res.status(201).json({ property });
});

export const updateTaskProperty = asyncHandler(async (req, res) => {
  const updates = {};
  for (const field of ["name", "options"]) {
    if (field in req.body) updates[field] = req.body[field];
  }

  const property = await TaskProperty.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    updates,
    { new: true, runValidators: true }
  );

  if (!property) {
    res.status(404);
    throw new Error("Property not found");
  }

  res.json({ property });
});

export const deleteTaskProperty = asyncHandler(async (req, res) => {
  const property = await TaskProperty.findOneAndDelete({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!property) {
    res.status(404);
    throw new Error("Property not found");
  }

  res.status(204).send();
});
