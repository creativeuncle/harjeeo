import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Note from "../models/Note.js";

const RETENTION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function purgeExpiredTrash() {
  const cutoff = new Date(Date.now() - RETENTION_MS);
  const query = { deletedAt: { $ne: null, $lte: cutoff } };

  const [projects, tasks, notes] = await Promise.all([
    Project.deleteMany(query),
    Task.deleteMany(query),
    Note.deleteMany(query),
  ]);

  return {
    projects: projects.deletedCount,
    tasks: tasks.deletedCount,
    notes: notes.deletedCount,
  };
}

export function schedulePurgeTrash(intervalMs = 24 * 60 * 60 * 1000) {
  purgeExpiredTrash().catch((err) => console.error("Trash purge failed:", err));
  return setInterval(() => {
    purgeExpiredTrash().catch((err) => console.error("Trash purge failed:", err));
  }, intervalMs);
}
