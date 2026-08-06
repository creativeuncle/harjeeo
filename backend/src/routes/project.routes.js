import { Router } from "express";
import {
  listProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  setProjectMemberRole,
  removeProjectMemberRole,
} from "../controllers/project.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.get("/", listProjects);
router.post("/", createProject);
router.get("/:id", getProject);
router.patch("/:id", updateProject);
router.delete("/:id", deleteProject);
router.put("/:id/members", setProjectMemberRole);
router.delete("/:id/members/:userId", removeProjectMemberRole);

export default router;
