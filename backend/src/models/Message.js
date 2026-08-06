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
  },
  { timestamps: true }
);

messageSchema.index({ channel: 1, createdAt: 1 });

export default mongoose.model("Message", messageSchema);
