import mongoose from "mongoose";

const projectStageOptionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true, trim: true },
    color: { type: String, default: "gray" },
    order: { type: Number, default: 0 },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
  },
  { timestamps: true }
);

projectStageOptionSchema.index({ workspace: 1, key: 1 }, { unique: true });

export const DEFAULT_STAGE_OPTIONS = [
  { key: "not_started", label: "Not started", color: "gray" },
  { key: "planning", label: "Planning", color: "orange" },
  { key: "in_progress", label: "In Progress", color: "amber" },
  { key: "done", label: "Done", color: "emerald" },
];

export default mongoose.model("ProjectStageOption", projectStageOptionSchema);
