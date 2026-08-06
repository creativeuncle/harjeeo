import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import Message from "../models/Message.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, "..", "..", "uploads");
const RETENTION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function purgeExpiredAttachments() {
  const cutoff = new Date(Date.now() - RETENTION_MS);
  const messages = await Message.find({
    attachment: { $ne: null },
    createdAt: { $lte: cutoff },
  }).select("attachment");

  for (const message of messages) {
    const url = message.attachment?.url;
    if (url && url.startsWith("/uploads/")) {
      const filePath = path.join(UPLOADS_DIR, path.basename(url));
      await fs.unlink(filePath).catch(() => {});
    }
    message.attachment = null;
    if (!message.body) {
      message.body = "This attachment was removed after 30 days.";
    }
    await message.save();
  }

  return { removed: messages.length };
}

export function schedulePurgeAttachments(intervalMs = 24 * 60 * 60 * 1000) {
  purgeExpiredAttachments().catch((err) => console.error("Attachment purge failed:", err));
  return setInterval(() => {
    purgeExpiredAttachments().catch((err) => console.error("Attachment purge failed:", err));
  }, intervalMs);
}
