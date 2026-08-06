import { useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import Collaboration from "@tiptap/extension-collaboration";
import { prosemirrorJSONToYXmlFragment } from "y-prosemirror";
import { baseExtensions } from "./extensions";
import FormattingBubbleMenu from "./FormattingBubbleMenu";
import { createCollabSession } from "@/lib/collab";
import "./editor.css";

export default function RichTextEditor({
  content,
  onChange,
  placeholder,
  editable = true,
  mentionItems = [],
  collabDocName = null,
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

  const [session, setSession] = useState(null);

  useEffect(() => {
    if (!collabDocName) {
      setSession(null);
      return;
    }
    const s = createCollabSession(collabDocName);
    setSession(s);
    return () => {
      s.provider.destroy();
      s.ydoc.destroy();
    };
  }, [collabDocName]);

  const seededRef = useRef(false);
  useEffect(() => {
    if (!session) return;
    seededRef.current = false;
    function seedIfEmpty() {
      if (seededRef.current) return;
      seededRef.current = true;
      const fragment = session.ydoc.getXmlFragment("default");
      if (fragment.length === 0 && content) {
        try {
          const schema = editorRef.current?.schema;
          if (schema) prosemirrorJSONToYXmlFragment(schema, content, fragment);
        } catch (err) {
          console.error("Failed to seed collaborative doc:", err);
        }
      }
    }
    session.provider.on("synced", seedIfEmpty);
    return () => session.provider.off("synced", seedIfEmpty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const editorRef = useRef(null);

  const editor = useEditor(
    {
      extensions: [
        ...baseExtensions({ placeholder, getMentionItems, collab: !!session }),
        // @tiptap/extension-collaboration-cursor's only 3.x release (3.0.0)
        // is broken against @tiptap/core 3.x — it crashes every editor mount
        // with "Cannot read properties of undefined (reading 'doc')" because
        // its yCursorPlugin looks up ySyncPlugin state that isn't there yet.
        // Live cursors are dropped; core Yjs sync (Collaboration) is unaffected.
        ...(session ? [Collaboration.configure({ document: session.ydoc })] : []),
      ],
      content: session ? undefined : content,
      editable,
      onUpdate: session
        ? undefined
        : ({ editor: e }) => {
            onChange?.(e.getJSON());
          },
      editorProps: {
        attributes: {
          class: "harjeeo-editor-content",
        },
      },
    },
    [session]
  );

  editorRef.current = editor;

  return (
    <div className="harjeeo-editor">
      <FormattingBubbleMenu editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
