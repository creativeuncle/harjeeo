import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
    type: {
      type: String,
      enum: ["comment", "task_moved", "lead_assigned", "workspace_invite"],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, default: "" },
    link: { type: String, default: "" },
    meta: { type: mongoose.Schema.Types.Mixed, default: null },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
