import { Router } from "express";
import { listTrash, restoreItem, permanentlyDeleteItem } from "../controllers/trash.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);

router.get("/", listTrash);
router.post("/:type/:id/restore", restoreItem);
router.delete("/:type/:id", permanentlyDeleteItem);

export default router;
