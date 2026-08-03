import { Router } from "express";
import {
  listTasks,
  createTask,
  getTask,
  updateTask,
  moveTask,
  deleteTask,
} from "../controllers/task.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);

router.get("/", listTasks);
router.post("/", createTask);
router.get("/:id", getTask);
router.patch("/:id", updateTask);
router.patch("/:id/move", moveTask);
router.delete("/:id", deleteTask);

export default router;
