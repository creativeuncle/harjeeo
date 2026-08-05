import { useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { prosemirrorJSONToYXmlFragment } from "y-prosemirror";
import { baseExtensions } from "./extensions";
import FormattingBubbleMenu from "./FormattingBubbleMenu";
import { createCollabSession } from "@/lib/collab";
import { useAuthStore } from "@/store/authStore";
import "./editor.css";

const CURSOR_COLORS = ["#f97316", "#8b5cf6", "#10b981", "#3b82f6", "#ec4899", "#eab308"];

function colorForUser(id) {
  let hash = 0;
  for (const ch of id ?? "") hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
}

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
  const currentUser = useAuthStore((s) => s.user);

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
        ...(session
          ? [
              Collaboration.configure({ document: session.ydoc }),
              CollaborationCursor.configure({
                provider: session.provider,
                user: {
                  name: currentUser?.name ?? "Anonymous",
                  color: colorForUser(currentUser?._id),
                },
              }),
            ]
          : []),
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
