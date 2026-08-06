import { Router } from "express";
import {
  listChannels,
  createChannel,
  getOrCreateDM,
  listMessages,
  createMessage,
  toggleReaction,
  markChannelRead,
} from "../controllers/chat.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);

router.get("/channels", listChannels);
router.post("/channels", createChannel);
router.post("/dm", getOrCreateDM);
router.get("/channels/:channelId/messages", listMessages);
router.post("/channels/:channelId/messages", createMessage);
router.post("/channels/:channelId/read", markChannelRead);
router.post("/messages/:messageId/reactions", toggleReaction);

export default router;
