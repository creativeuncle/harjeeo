import { Router } from "express";
import { updateMe, updatePresence } from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.patch("/me", protect, updateMe);
router.patch("/me/presence", protect, updatePresence);

export default router;
