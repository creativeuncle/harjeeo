import { Router } from "express";
import multer from "multer";
import path from "node:path";
import crypto from "node:crypto";
import { protect } from "../middleware/auth.js";

const ALLOWED_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".pdf",
  ".csv",
  ".webm",
  ".mp3",
  ".wav",
  ".ogg",
  ".m4a",
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, ALLOWED_EXTENSIONS.has(ext));
  },
});

const router = Router();
router.use(protect);

router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No file uploaded, or file type not allowed");
  }
  res.status(201).json({
    url: `/uploads/${req.file.filename}`,
    name: req.file.originalname,
  });
});

export default router;
