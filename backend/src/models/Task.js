import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, default: "New task", trim: true },
    status: {
      type: String,
      enum: ["not_started", "up_next", "in_progress", "done"],
      default: "not_started",
    },
    order: { type: Number, default: 0 },
    properties: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
    content: { type: mongoose.Schema.Types.Mixed, default: null },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, toJSON: { flattenMaps: true } }
);

taskSchema.index({ owner: 1, status: 1, order: 1 });

export default mongoose.model("Task", taskSchema);
