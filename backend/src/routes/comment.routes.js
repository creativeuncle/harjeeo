import { Router } from "express";
import { listComments, createComment, deleteComment } from "../controllers/comment.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);

router.get("/", listComments);
router.post("/", createComment);
router.delete("/:id", deleteComment);

export default router;
