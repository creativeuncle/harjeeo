import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    channel: { type: mongoose.Schema.Types.ObjectId, ref: "Channel", required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

messageSchema.index({ channel: 1, createdAt: 1 });

export default mongoose.model("Message", messageSchema);
