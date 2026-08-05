import mongoose from "mongoose";

const channelSchema = new mongoose.Schema(
  {
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
    name: { type: String, default: "" },
    isDM: { type: Boolean, default: false },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lastMessageAt: { type: Date, default: null },
  },
  { timestamps: true }
);

channelSchema.index({ workspace: 1, isDM: 1 });

export default mongoose.model("Channel", channelSchema);
