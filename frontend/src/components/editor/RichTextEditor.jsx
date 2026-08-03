import { EditorContent, useEditor } from "@tiptap/react";
import { baseExtensions } from "./extensions";
import FormattingBubbleMenu from "./FormattingBubbleMenu";
import "./editor.css";

export default function RichTextEditor({
  content,
  onChange,
  placeholder,
  editable = true,
}) {
  const editor = useEditor({
    extensions: baseExtensions({ placeholder }),
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
