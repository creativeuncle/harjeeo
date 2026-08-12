import { useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import Collaboration from "@tiptap/extension-collaboration";
import { Add01Icon } from "hugeicons-react";
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
          class: "harjeeo-editor-content tiptap",
        },
      },
    },
    [session]
  );

  editorRef.current = editor;

  const wrapperRef = useRef(null);
  const [plusRect, setPlusRect] = useState(null);
  const hoveredBlockRef = useRef(null);
  const hideTimeoutRef = useRef(null);

  const GUTTER_SIZE = 22;

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  function clearHide() {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }

  // Small grace delay before hiding, so crossing the gap between a block
  // and the + button (or briefly passing over the button) doesn't flicker.
  function scheduleHide() {
    clearHide();
    hideTimeoutRef.current = setTimeout(() => {
      hoveredBlockRef.current = null;
      setPlusRect(null);
    }, 150);
  }

  function handleMouseMove(e) {
    if (!editable) return;
    if (e.target.closest(".harjeeo-editor-plus")) {
      clearHide();
      return;
    }

    const wrapper = wrapperRef.current;
    const content = wrapper?.querySelector(".harjeeo-editor-content");
    if (!wrapper || !content) return;

    let el = e.target;
    while (el && el.parentElement !== content) el = el.parentElement;
    if (!el || el === content || !content.contains(el)) {
      scheduleHide();
      return;
    }

    clearHide();
    hoveredBlockRef.current = el;
    const wrapperRect = wrapper.getBoundingClientRect();
    const blockRect = el.getBoundingClientRect();
    const compStyle = window.getComputedStyle(el);
    const parsedLineHeight = parseInt(compStyle.lineHeight, 10);
    const lineHeight = Number.isNaN(parsedLineHeight)
      ? parseInt(compStyle.fontSize, 10) * 1.2
      : parsedLineHeight;
    const paddingTop = parseInt(compStyle.paddingTop, 10) || 0;
    setPlusRect({
      top: blockRect.top - wrapperRect.top + (lineHeight - GUTTER_SIZE) / 2 + paddingTop,
    });
  }

  function handleMouseLeave() {
    scheduleHide();
  }

  function handlePlusClick() {
    const el = hoveredBlockRef.current;
    if (!editor || !el) return;
    const pos = editor.view.posAtDOM(el, 0);
    const resolved = editor.state.doc.resolve(pos);
    const afterPos = resolved.after(1);
    editor
      .chain()
      .focus()
      .insertContentAt(afterPos, { type: "paragraph", content: [{ type: "text", text: "/" }] })
      .setTextSelection(afterPos + 2)
      .run();
    setPlusRect(null);
  }

  return (
    <div
      ref={wrapperRef}
      className="harjeeo-editor"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <FormattingBubbleMenu editor={editor} />
      {editable && plusRect && (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onMouseEnter={clearHide}
          onMouseLeave={scheduleHide}
          onClick={handlePlusClick}
          title="Add block"
          className="harjeeo-editor-plus"
          style={{ top: plusRect.top }}
        >
          <Add01Icon size={14} strokeWidth={1.8} />
        </button>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
