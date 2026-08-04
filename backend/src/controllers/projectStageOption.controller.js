import asyncHandler from "express-async-handler";
import ProjectStageOption, { DEFAULT_STAGE_OPTIONS } from "../models/ProjectStageOption.js";
import { requireMembership } from "../utils/workspaceAuth.js";

function slugify(label) {
  return (
    label
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "stage"
  );
}

async function uniqueKey(workspaceId, label) {
  const base = slugify(label);
  let key = base;
  let i = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await ProjectStageOption.exists({ workspace: workspaceId, key })) {
    key = `${base}_${i}`;
    i += 1;
  }
  return key;
}

export const listStageOptions = asyncHandler(async (req, res) => {
  await requireMembership(res, req.params.id, req.user._id);

  let options = await ProjectStageOption.find({ workspace: req.params.id }).sort({ order: 1 });
  if (options.length === 0) {
    options = await ProjectStageOption.insertMany(
      DEFAULT_STAGE_OPTIONS.map((opt, index) => ({
        ...opt,
        order: index,
        workspace: req.params.id,
      }))
    );
  }

  res.json({ options });
});

export const createStageOption = asyncHandler(async (req, res) => {
  await requireMembership(res, req.params.id, req.user._id);

  const { label, color } = req.body;
  if (!label) {
    res.status(400);
    throw new Error("Label is required");
  }

  const key = await uniqueKey(req.params.id, label);
  const last = await ProjectStageOption.findOne({ workspace: req.params.id }).sort({
    order: -1,
  });

  const option = await ProjectStageOption.create({
    workspace: req.params.id,
    key,
    label,
    color: color || "gray",
    order: last ? last.order + 1 : 0,
  });

  res.status(201).json({ option });
});

export const updateStageOption = asyncHandler(async (req, res) => {
  await requireMembership(res, req.params.id, req.user._id);

  const updates = {};
  for (const field of ["label", "color", "order"]) {
    if (field in req.body) updates[field] = req.body[field];
  }

  const option = await ProjectStageOption.findOneAndUpdate(
    { _id: req.params.optionId, workspace: req.params.id },
    updates,
    { new: true, runValidators: true }
  );
  if (!option) {
    res.status(404);
    throw new Error("Stage option not found");
  }
  res.json({ option });
});

export const deleteStageOption = asyncHandler(async (req, res) => {
  await requireMembership(res, req.params.id, req.user._id);

  const option = await ProjectStageOption.findOneAndDelete({
    _id: req.params.optionId,
    workspace: req.params.id,
  });
  if (!option) {
    res.status(404);
    throw new Error("Stage option not found");
  }
  res.status(204).send();
});
