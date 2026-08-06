import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, default: "New task", trim: true },
    status: {
      type: String,
      enum: ["not_started", "up_next", "in_progress", "done"],
      default: "not_started",
    },
    order: { type: Number, default: 0 },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },
    dueDate: { type: Date, default: null },
    dependsOn: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
    dueReminderSentAt: { type: Date, default: null },
    properties: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
    content: { type: mongoose.Schema.Types.Mixed, default: null },
    isPublic: { type: Boolean, default: false },
    ydoc: { type: Buffer, default: null, select: false },
    deletedAt: { type: Date, default: null },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
  },
  { timestamps: true, toJSON: { flattenMaps: true } }
);

taskSchema.index({ workspace: 1, status: 1, order: 1 });

export default mongoose.model("Task", taskSchema);
