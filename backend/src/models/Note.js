import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, default: "Untitled", trim: true },
    icon: { type: String, default: "📄" },
    date: { type: Date, default: null },
    place: { type: String, default: "" },
    content: { type: mongoose.Schema.Types.Mixed, default: null },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
  },
  { timestamps: true }
);

noteSchema.index({ workspace: 1, owner: 1 });

export default mongoose.model("Note", noteSchema);
