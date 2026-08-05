import { Router } from "express";
import { getPublicProject, getPublicTask, getPublicNote } from "../controllers/public.controller.js";

// No auth — anything returned here must already be gated by isPublic:true
// in the controller queries themselves.
const router = Router();

router.get("/projects/:id", getPublicProject);
router.get("/tasks/:id", getPublicTask);
router.get("/notes/:id", getPublicNote);

export default router;
