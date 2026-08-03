import StarterKit from "@tiptap/starter-kit";
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
import SlashCommand from "./extensions/SlashCommand";

const lowlight = createLowlight();

export function baseExtensions({ placeholder = "Type '/' for commands…" } = {}) {
  return [
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
    Callout,
    Toggle,
    Placeholder.configure({ placeholder }),
    SlashCommand,
  ];
}
