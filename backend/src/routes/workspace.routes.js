import { Router } from "express";
import {
  createWorkspace,
  listWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  listMembers,
  listActivity,
  inviteMember,
  revokeInvite,
  acceptInvite,
  acceptInviteById,
  declineInviteById,
  updateMemberRole,
  removeMember,
} from "../controllers/workspace.controller.js";
import {
  listStageOptions,
  createStageOption,
  updateStageOption,
  deleteStageOption,
} from "../controllers/projectStageOption.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);

router.get("/", listWorkspaces);
router.post("/", createWorkspace);
router.post("/invites/accept", acceptInvite);
router.post("/invites/:inviteId/accept", acceptInviteById);
router.post("/invites/:inviteId/decline", declineInviteById);

router.get("/:id", getWorkspace);
router.patch("/:id", updateWorkspace);
router.delete("/:id", deleteWorkspace);

router.get("/:id/members", listMembers);
router.get("/:id/activity", listActivity);
router.patch("/:id/members/:memberId", updateMemberRole);
router.delete("/:id/members/:memberId", removeMember);

router.post("/:id/invites", inviteMember);
router.delete("/:id/invites/:inviteId", revokeInvite);

router.get("/:id/project-stage-options", listStageOptions);
router.post("/:id/project-stage-options", createStageOption);
router.patch("/:id/project-stage-options/:optionId", updateStageOption);
router.delete("/:id/project-stage-options/:optionId", deleteStageOption);

export default router;
