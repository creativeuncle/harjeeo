import { Hocuspocus } from "@hocuspocus/server";
import * as Y from "yjs";
import { prosemirrorJSONToYXmlFragment, yXmlFragmentToProsemirrorJSON } from "y-prosemirror";
import Project from "./models/Project.js";
import Task from "./models/Task.js";
import Note from "./models/Note.js";
import WorkspaceMember from "./models/WorkspaceMember.js";
import { verifyAccessToken } from "./utils/tokens.js";
import { getCollabSchema } from "./collabSchema.js";

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
    const { Model, id } = parseDocumentName(documentName);
    if (!Model || !id) return;

    const target = await Model.findById(id).select("+ydoc content");
    if (!target) return;

    if (target.ydoc && target.ydoc.length > 0) {
      Y.applyUpdate(document, target.ydoc);
      return;
    }

    if (target.content) {
      try {
        const schema = getCollabSchema();
        prosemirrorJSONToYXmlFragment(schema, target.content, document.getXmlFragment("default"));
      } catch (err) {
        console.error(`Failed to seed collab doc ${documentName} from existing content:`, err.message);
      }
    }
  },

  async onStoreDocument({ documentName, document }) {
    const { Model, id } = parseDocumentName(documentName);
    if (!Model || !id) return;

    const update = Y.encodeStateAsUpdate(document);
    let contentJSON = null;
    try {
      const schema = getCollabSchema();
      contentJSON = yXmlFragmentToProsemirrorJSON(document.getXmlFragment("default"), schema);
    } catch (err) {
      console.error(`Failed to snapshot collab doc ${documentName} to JSON:`, err.message);
    }

    const update$ = { ydoc: Buffer.from(update) };
    if (contentJSON) update$.content = contentJSON;
    await Model.findByIdAndUpdate(id, update$);
  },
});
