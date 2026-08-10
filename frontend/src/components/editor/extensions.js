import StarterKit from "@tiptap/starter-kit";
import GlobalDragHandle from "tiptap-extension-global-drag-handle";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { createLowlight } from "lowlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Callout from "./extensions/Callout";
import Toggle from "./extensions/Toggle";
import Video from "./extensions/Video";
import Audio from "./extensions/Audio";
import Pdf from "./extensions/Pdf";
import Embed from "./extensions/Embed";
import SlashCommand from "./extensions/SlashCommand";
import { createMentionExtension } from "./extensions/MentionExtension";

const lowlight = createLowlight();

export function baseExtensions({
  placeholder = "Type '/' for commands…",
  getMentionItems = () => [],
  collab = false,
} = {}) {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4, 5, 6] },
      codeBlock: false,
      link: false,
      underline: false,
      // Collaboration extension owns undo/redo history when live-collab is on.
      undoRedo: collab ? false : undefined,
    }),
    CodeBlockLowlight.configure({ lowlight }),
    Underline,
    Highlight.configure({ multicolor: true }),
    Link.configure({ openOnClick: false, autolink: true }),
    Image,
    TaskList,
    TaskItem.configure({ nested: true }),
    Callout,
    Toggle,
    Video,
    Audio,
    Pdf,
    Embed,
    Placeholder.configure({ placeholder }),
    GlobalDragHandle.configure({ dragHandleWidth: 20 }),
    SlashCommand,
    createMentionExtension(getMentionItems),
  ];
}
