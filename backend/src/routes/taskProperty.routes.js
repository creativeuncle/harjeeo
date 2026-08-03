import { Router } from "express";
import {
  listTaskProperties,
  createTaskProperty,
  updateTaskProperty,
  deleteTaskProperty,
} from "../controllers/taskProperty.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);

router.get("/", listTaskProperties);
router.post("/", createTaskProperty);
router.patch("/:id", updateTaskProperty);
router.delete("/:id", deleteTaskProperty);

export default router;
