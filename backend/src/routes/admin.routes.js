import { Router } from "express";
import { getStats, listUsers, listWorkspaces } from "../controllers/admin.controller.js";
import { protect } from "../middleware/auth.js";
import { requireSuperAdmin } from "../middleware/requireSuperAdmin.js";

const router = Router();
router.use(protect, requireSuperAdmin);

router.get("/stats", getStats);
router.get("/users", listUsers);
router.get("/workspaces", listWorkspaces);

export default router;
