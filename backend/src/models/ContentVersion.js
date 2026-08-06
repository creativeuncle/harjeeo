import mongoose from "mongoose";

const contentVersionSchema = new mongoose.Schema(
  {
    targetType: { type: String, enum: ["project", "task", "note"], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    content: { type: mongoose.Schema.Types.Mixed, default: null },
    savedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

contentVersionSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });

export default mongoose.model("ContentVersion", contentVersionSchema);
