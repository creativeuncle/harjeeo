import { Router } from "express";
import {
  listChannels,
  createChannel,
  getOrCreateDM,
  listMessages,
  createMessage,
} from "../controllers/chat.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);

router.get("/channels", listChannels);
router.post("/channels", createChannel);
router.post("/dm", getOrCreateDM);
router.get("/channels/:channelId/messages", listMessages);
router.post("/channels/:channelId/messages", createMessage);

export default router;
