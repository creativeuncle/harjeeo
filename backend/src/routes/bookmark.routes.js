import { Router } from "express";
import {
  listBookmarks,
  createBookmark,
  updateBookmark,
  deleteBookmark,
} from "../controllers/bookmark.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, listBookmarks);
router.post("/", protect, createBookmark);
router.patch("/:id", protect, updateBookmark);
router.delete("/:id", protect, deleteBookmark);

export default router;
