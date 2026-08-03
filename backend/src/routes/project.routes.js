import { Router } from "express";
import {
  listProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
} from "../controllers/project.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.get("/", listProjects);
router.post("/", createProject);
router.get("/:id", getProject);
router.patch("/:id", updateProject);
router.delete("/:id", deleteProject);

export default router;
