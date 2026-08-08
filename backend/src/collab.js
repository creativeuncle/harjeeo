import { Hocuspocus } from "@hocuspocus/server";
import * as Y from "yjs";
import { prosemirrorJSONToYXmlFragment, yXmlFragmentToProsemirrorJSON } from "y-prosemirror";
import Project from "./models/Project.js";
import Task from "./models/Task.js";
import Note from "./models/Note.js";
import WorkspaceMember from "./models/WorkspaceMember.js";
import { verifyAccessToken } from "./utils/tokens.js";
import { getCollabSchema } from "./collabSchema.js";
import { maybeSnapshotContent } from "./utils/versionSnapshot.js";

const MODELS = { project: Project, task: Task, note: Note };

function parseDocumentName(documentName) {
  const [type, id] = documentName.split(":");
  const Model = MODELS[type];
  return { type, id, Model };
}

export const hocuspocus = new Hocuspocus({
  async onAuthenticate({ token, documentName }) {
    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      throw new Error("Not authorized");
    }

    const { Model, id } = parseDocumentName(documentName);
    if (!Model || !id) {
      throw new Error("Unknown document");
    }

    const target = await Model.findById(id).select("workspace");
    if (!target) {
      throw new Error("Document not found");
    }

    const membership = await WorkspaceMember.findOne({
      workspace: target.workspace,
      user: payload.sub,
    });
    if (!membership) {
      throw new Error("Not a member of this workspace");
    }

    return { userId: payload.sub };
  },

  async onLoadDocument({ documentName, document }) {
    console.log(`[collab] onLoadDocument ${documentName}`);
    const { Model, id } = parseDocumentName(documentName);
    if (!Model || !id) {
      console.warn(`[collab] onLoadDocument: unknown document ${documentName}`);
      return;
    }

    const target = await Model.findById(id).select("+ydoc content");
    if (!target) {
      console.warn(`[collab] onLoadDocument: target not found for ${documentName}`);
      return;
    }

    if (target.ydoc && target.ydoc.length > 0) {
      console.log(`[collab] onLoadDocument: applying existing ydoc for ${documentName} (${target.ydoc.length} bytes)`);
      Y.applyUpdate(document, target.ydoc);
      return;
    }

    if (target.content) {
      try {
        const schema = getCollabSchema();
        prosemirrorJSONToYXmlFragment(schema, target.content, document.getXmlFragment("default"));
        console.log(`[collab] onLoadDocument: seeded ${documentName} from existing content field`);
      } catch (err) {
        console.error(`[collab] Failed to seed collab doc ${documentName} from existing content:`, err);
      }
    } else {
      console.log(`[collab] onLoadDocument: no ydoc/content for ${documentName}, starting blank`);
    }
  },

  async onStoreDocument({ documentName, document }) {
    console.log(`[collab] onStoreDocument fired for ${documentName}`);
    const { Model, id, type } = parseDocumentName(documentName);
    if (!Model || !id) {
      console.warn(`[collab] onStoreDocument: unknown document ${documentName}`);
      return;
    }

    const update = Y.encodeStateAsUpdate(document);
    let contentJSON = null;
    try {
      const schema = getCollabSchema();
      contentJSON = yXmlFragmentToProsemirrorJSON(document.getXmlFragment("default"), schema);
    } catch (err) {
      console.error(`[collab] Failed to snapshot collab doc ${documentName} to JSON:`, err);
    }

    if (contentJSON) {
      const existing = await Model.findById(id).select("content");
      if (existing) {
        maybeSnapshotContent({
          targetType: type,
          targetId: id,
          content: existing.content,
          userId: null,
        }).catch((err) => console.error(`[collab] Failed to snapshot collab doc ${documentName}:`, err));
      }
    }

    const update$ = { ydoc: Buffer.from(update) };
    if (contentJSON) update$.content = contentJSON;
    try {
      await Model.findByIdAndUpdate(id, update$);
      console.log(`[collab] onStoreDocument: saved ${documentName} (${update.length} bytes ydoc, content=${contentJSON ? "yes" : "no"})`);
    } catch (err) {
      console.error(`[collab] onStoreDocument: FAILED to save ${documentName}:`, err);
    }
  },
});
