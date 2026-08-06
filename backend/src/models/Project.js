import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, default: "Untitled", trim: true },
    icon: { type: String, default: "🎯" },
    stage: { type: String, default: "not_started" },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    leads: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    dueReminderSentAt: { type: Date, default: null },
    content: { type: mongoose.Schema.Types.Mixed, default: null },
    isPublic: { type: Boolean, default: false },
    ydoc: { type: Buffer, default: null, select: false },
    deletedAt: { type: Date, default: null },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
    memberRoles: [
      new mongoose.Schema(
        {
          user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
          role: { type: String, enum: ["viewer", "editor"], required: true },
        },
        { _id: false }
      ),
    ],
  },
  { timestamps: true }
);

projectSchema.index({ workspace: 1 });

export default mongoose.model("Project", projectSchema);
