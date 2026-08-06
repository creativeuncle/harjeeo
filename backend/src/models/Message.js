import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    channel: { type: mongoose.Schema.Types.ObjectId, ref: "Channel", required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, default: "", trim: true },
    attachment: {
      type: new mongoose.Schema(
        {
          url: { type: String, required: true },
          type: { type: String, enum: ["image", "file", "audio"], required: true },
          name: { type: String, default: "" },
        },
        { _id: false }
      ),
      default: null,
    },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message", default: null },
    reactions: [
      new mongoose.Schema(
        {
          user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
          emoji: { type: String, required: true },
        },
        { _id: false }
      ),
    ],
    deliveredTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

messageSchema.index({ channel: 1, createdAt: 1 });

export default mongoose.model("Message", messageSchema);
