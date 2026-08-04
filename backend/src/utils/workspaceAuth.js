import WorkspaceMember from "../models/WorkspaceMember.js";

export async function requireMembership(res, workspaceId, userId) {
  if (!workspaceId) {
    res.status(400);
    throw new Error("workspaceId is required");
  }
  const membership = await WorkspaceMember.findOne({ workspace: workspaceId, user: userId });
  if (!membership) {
    res.status(403);
    throw new Error("You are not a member of this workspace");
  }
  return membership;
}
