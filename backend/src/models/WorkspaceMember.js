import mongoose from "mongoose";

export const WORKSPACE_ROLES = ["owner", "admin", "editor", "viewer", "guest"];

const workspaceMemberSchema = new mongoose.Schema(
  {
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: WORKSPACE_ROLES, default: "viewer" },
  },
  { timestamps: true }
);

workspaceMemberSchema.index({ workspace: 1, user: 1 }, { unique: true });

export default mongoose.model("WorkspaceMember", workspaceMemberSchema);
