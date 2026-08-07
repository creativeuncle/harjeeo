import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    title: { type: String, default: "", trim: true },
    notes: { type: String, default: "", trim: true },
    tags: [{ type: String, trim: true }],
    read: { type: Boolean, default: false },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
  },
  { timestamps: true }
);

bookmarkSchema.index({ workspace: 1, owner: 1 });

export default mongoose.model("Bookmark", bookmarkSchema);
