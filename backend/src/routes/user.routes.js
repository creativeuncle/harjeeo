import { Router } from "express";
import { updateMe } from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.patch("/me", protect, updateMe);

export default router;
