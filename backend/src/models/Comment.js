import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    body: { type: String, required: true, trim: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
    targetType: { type: String, enum: ["project", "task"], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },
  },
  { timestamps: true }
);

commentSchema.index({ targetType: 1, targetId: 1, createdAt: 1 });

export default mongoose.model("Comment", commentSchema);
