import { BubbleMenu } from "@tiptap/react/menus";
import {
  TextBoldIcon,
  TextItalicIcon,
  TextUnderlineIcon,
  TextStrikethroughIcon,
  PaintBoardIcon,
  Link03Icon,
} from "hugeicons-react";

function ToolbarButton({ active, onClick, title, children }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex h-7 w-7 items-center justify-center rounded ${
        active
          ? "bg-(--color-accent) text-white"
          : "text-(--color-text) hover:bg-black/10 dark:hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

export default function FormattingBubbleMenu({ editor }) {
  if (!editor) return null;

  return (
    <BubbleMenu
      editor={editor}
      options={{ placement: "top" }}
      shouldShow={({ state }) => !state.selection.empty}
      className="flex items-center gap-0.5 rounded-md border border-(--color-border) bg-(--color-canvas) p-1 shadow-lg"
    >
      <ToolbarButton
        title="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <TextBoldIcon size={16} strokeWidth={1.8} />
      </ToolbarButton>
      <ToolbarButton
        title="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <TextItalicIcon size={16} strokeWidth={1.8} />
      </ToolbarButton>
      <ToolbarButton
        title="Underline"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <TextUnderlineIcon size={16} strokeWidth={1.8} />
      </ToolbarButton>
      <ToolbarButton
        title="Strikethrough"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <TextStrikethroughIcon size={16} strokeWidth={1.8} />
      </ToolbarButton>
      <ToolbarButton
        title="Highlight"
        active={editor.isActive("highlight")}
        onClick={() => editor.chain().focus().toggleHighlight().run()}
      >
        <PaintBoardIcon size={16} strokeWidth={1.8} />
      </ToolbarButton>
      <ToolbarButton
        title="Link"
        active={editor.isActive("link")}
        onClick={() => {
          const previousUrl = editor.getAttributes("link").href;
          const url = window.prompt("URL", previousUrl ?? "");
          if (url === null) return;
          if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
          }
          editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        }}
      >
        <Link03Icon size={16} strokeWidth={1.8} />
      </ToolbarButton>
    </BubbleMenu>
  );
}
