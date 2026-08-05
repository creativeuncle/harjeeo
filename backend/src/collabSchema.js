import { getSchema } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Mention from "@tiptap/extension-mention";
import { createLowlight } from "lowlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";

const lowlight = createLowlight();

// A schema-only mirror of the frontend's editor extensions (see
// frontend/src/components/editor/extensions.js). Custom NodeView-based
// blocks (Callout, Toggle, Video, Audio, Pdf, Embed) are intentionally
// left out — they aren't needed to build a ProseMirror schema for Yjs
// seeding, and importing them here would pull in React/DOM code.
export const collabExtensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3, 4, 5, 6] },
    codeBlock: false,
    link: false,
    underline: false,
  }),
  CodeBlockLowlight.configure({ lowlight }),
  Underline,
  Highlight.configure({ multicolor: true }),
  Link.configure({ openOnClick: false, autolink: true }),
  Image,
  TaskList,
  TaskItem.configure({ nested: true }),
  Mention,
];

let cachedSchema = null;

export function getCollabSchema() {
  cachedSchema ??= getSchema(collabExtensions);
  return cachedSchema;
}
