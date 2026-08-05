import Activity from "../models/Activity.js";

export async function logActivity({
  workspace,
  actorId,
  action,
  targetType,
  targetId,
  targetLabel,
  detail = "",
  link = "",
}) {
  try {
    await Activity.create({
      workspace,
      actor: actorId,
      action,
      targetType,
      targetId,
      targetLabel,
      detail,
      link,
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}
