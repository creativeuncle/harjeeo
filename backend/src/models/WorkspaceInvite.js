import mongoose from "mongoose";
import { WORKSPACE_ROLES } from "./WorkspaceMember.js";

const workspaceInviteSchema = new mongoose.Schema(
  {
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, enum: WORKSPACE_ROLES, default: "viewer" },
    tokenHash: { type: String, required: true, select: false },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "accepted"], default: "pending" },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("WorkspaceInvite", workspaceInviteSchema);
