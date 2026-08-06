import { Router } from "express";
import { listVersions, getVersion, restoreVersion } from "../controllers/version.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);

router.get("/", listVersions);
router.get("/:id", getVersion);
router.post("/:id/restore", restoreVersion);

export default router;
