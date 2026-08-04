import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    icon: { type: String, default: "🏢" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Workspace", workspaceSchema);
