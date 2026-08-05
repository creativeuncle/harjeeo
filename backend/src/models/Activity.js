import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: {
      type: String,
      enum: ["created", "updated", "deleted", "moved", "commented"],
      required: true,
    },
    targetType: { type: String, enum: ["project", "task", "note"], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    targetLabel: { type: String, default: "" },
    detail: { type: String, default: "" },
    link: { type: String, default: "" },
  },
  { timestamps: true }
);

activitySchema.index({ workspace: 1, createdAt: -1 });

export default mongoose.model("Activity", activitySchema);
