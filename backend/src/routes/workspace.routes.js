import { Router } from "express";
import {
  createWorkspace,
  listWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  listMembers,
  inviteMember,
  revokeInvite,
  acceptInvite,
  updateMemberRole,
  removeMember,
} from "../controllers/workspace.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);

router.get("/", listWorkspaces);
router.post("/", createWorkspace);
router.post("/invites/accept", acceptInvite);

router.get("/:id", getWorkspace);
router.patch("/:id", updateWorkspace);
router.delete("/:id", deleteWorkspace);

router.get("/:id/members", listMembers);
router.patch("/:id/members/:memberId", updateMemberRole);
router.delete("/:id/members/:memberId", removeMember);

router.post("/:id/invites", inviteMember);
router.delete("/:id/invites/:inviteId", revokeInvite);

export default router;
