import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, default: "Untitled", trim: true },
    icon: { type: String, default: "🎯" },
    stage: {
      type: String,
      enum: ["not_started", "planning", "in_progress", "done"],
      default: "not_started",
    },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    lead: { type: String, default: "" },
    content: { type: mongoose.Schema.Types.Mixed, default: null },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
