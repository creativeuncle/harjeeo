import { Router } from "express";
import { listExpenses, createExpense, deleteExpense } from "../controllers/expense.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/projects/:projectId/expenses", protect, listExpenses);
router.post("/projects/:projectId/expenses", protect, createExpense);
router.delete("/expenses/:id", protect, deleteExpense);

export default router;
