import User from "../models/User.js";
import Workspace from "../models/Workspace.js";
import WorkspaceMember from "../models/WorkspaceMember.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import TaskProperty from "../models/TaskProperty.js";

// Ensures every user has a workspace, and backfills any Project/Task/
// TaskProperty created before workspaces existed onto that user's
// (oldest) workspace. Safe to run on every startup.
export async function migrateWorkspaces() {
  const users = await User.find();

  for (const user of users) {
    // eslint-disable-next-line no-await-in-loop
    let membership = await WorkspaceMember.findOne({ user: user._id }).sort({ createdAt: 1 });

    if (!membership) {
      // eslint-disable-next-line no-await-in-loop
      const workspace = await Workspace.create({
        name: `${user.name}'s Workspace`,
        owner: user._id,
      });
      // eslint-disable-next-line no-await-in-loop
      membership = await WorkspaceMember.create({
        workspace: workspace._id,
        user: user._id,
        role: "owner",
      });
      console.log(`Migration: created default workspace for ${user.email}`);
    }

    const workspaceId = membership.workspace;

    // eslint-disable-next-line no-await-in-loop
    const projectResult = await Project.updateMany(
      { owner: user._id, workspace: { $exists: false } },
      { workspace: workspaceId }
    );
    // eslint-disable-next-line no-await-in-loop
    const taskResult = await Task.updateMany(
      { owner: user._id, workspace: { $exists: false } },
      { workspace: workspaceId }
    );
    // eslint-disable-next-line no-await-in-loop
    const propertyResult = await TaskProperty.updateMany(
      { owner: user._id, workspace: { $exists: false } },
      { workspace: workspaceId }
    );

    const total =
      projectResult.modifiedCount + taskResult.modifiedCount + propertyResult.modifiedCount;
    if (total > 0) {
      console.log(
        `Migration: backfilled workspace on ${projectResult.modifiedCount} projects, ` +
          `${taskResult.modifiedCount} tasks, ${propertyResult.modifiedCount} properties ` +
          `for ${user.email}`
      );
    }
  }
}

// Older projects stored Lead as a plain name string. Converts each to the
// new `leads` array by matching the name against the project's workspace
// members; drops the legacy field either way. Safe to run on every startup.
export async function migrateLegacyProjectLeads() {
  const legacyDocs = await Project.collection
    .find({ lead: { $exists: true } })
    .toArray();

  for (const doc of legacyDocs) {
    // eslint-disable-next-line no-await-in-loop
    const members = await WorkspaceMember.find({ workspace: doc.workspace }).populate(
      "user",
      "name"
    );
    const match = members.find((m) => m.user?.name === doc.lead);
    // eslint-disable-next-line no-await-in-loop
    await Project.collection.updateOne(
      { _id: doc._id },
      {
        $set: { leads: match ? [match.user._id] : [] },
        $unset: { lead: "" },
      }
    );
  }

  if (legacyDocs.length > 0) {
    console.log(`Migration: converted lead field on ${legacyDocs.length} projects to leads[]`);
  }
}
