import { useMemo, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { baseExtensions } from "./extensions";
import FormattingBubbleMenu from "./FormattingBubbleMenu";
import "./editor.css";

export default function RichTextEditor({
  content,
  onChange,
  placeholder,
  editable = true,
  mentionItems = [],
}) {
  const mentionItemsRef = useRef(mentionItems);
  mentionItemsRef.current = mentionItems;

  const getMentionItems = useMemo(
    () => (query) =>
      mentionItemsRef.current
        .filter((m) => m.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 8),
    []
  );

  const editor = useEditor({
    extensions: baseExtensions({ placeholder, getMentionItems }),
    content,
    editable,
    onUpdate: ({ editor: e }) => {
      onChange?.(e.getJSON());
    },
    editorProps: {
      attributes: {
        class: "harjeeo-editor-content",
      },
    },
  });

  return (
    <div className="harjeeo-editor">
      <FormattingBubbleMenu editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
