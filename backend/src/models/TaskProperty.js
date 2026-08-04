import mongoose from "mongoose";

export const PROPERTY_TYPES = [
  "text",
  "number",
  "select",
  "multiSelect",
  "status",
  "date",
  "person",
  "checkbox",
  "url",
  "email",
  "phone",
  "createdTime",
  "createdBy",
];

const optionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    color: { type: String, default: "gray" },
  },
  { _id: false }
);

const taskPropertySchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: PROPERTY_TYPES, required: true },
    options: { type: [optionSchema], default: undefined },
    order: { type: Number, default: 0 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
  },
  { timestamps: true }
);

taskPropertySchema.index({ workspace: 1, key: 1 }, { unique: true });

export default mongoose.model("TaskProperty", taskPropertySchema);
