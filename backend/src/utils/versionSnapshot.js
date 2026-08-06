import ContentVersion from "../models/ContentVersion.js";

const MIN_GAP_MS = 5 * 60 * 1000; // don't snapshot more than once per 5 minutes per doc

export async function maybeSnapshotContent({ targetType, targetId, content, userId }) {
  if (content === undefined || content === null) return;

  const latest = await ContentVersion.findOne({ targetType, targetId }).sort({ createdAt: -1 });
  if (latest && Date.now() - latest.createdAt.getTime() < MIN_GAP_MS) return;

  await ContentVersion.create({ targetType, targetId, content, savedBy: userId });
}
