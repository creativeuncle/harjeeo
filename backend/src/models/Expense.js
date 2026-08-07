import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
    description: { type: String, default: "", trim: true },
    amount: { type: Number, required: true },
    category: { type: String, default: "General", trim: true },
    date: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

expenseSchema.index({ project: 1, date: 1 });

export default mongoose.model("Expense", expenseSchema);
