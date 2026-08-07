import {
  TextIcon,
  Heading01Icon,
  Heading02Icon,
  Heading03Icon,
  LeftToRightListBulletIcon,
  LeftToRightListNumberIcon,
  CheckListIcon,
  ArrowRight01Icon,
  QuoteUpIcon,
  MinusSignIcon,
  SourceCodeIcon,
  Note01Icon,
  Image02Icon,
  Video01Icon,
  MusicNote01Icon,
  Pdf01Icon,
  Link04Icon,
} from "hugeicons-react";

function insertMediaNode({ editor, range, type, promptLabel }) {
  const url = window.prompt(promptLabel);
  if (!url) {
    editor.chain().focus().deleteRange(range).run();
    return;
  }
  editor
    .chain()
    .focus()
    .deleteRange(range)
    .insertContent({ type, attrs: { src: url } })
    .run();
}

export function getSlashItems({ query }) {
  const items = [
    {
      title: "Text",
      icon: TextIcon,
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setParagraph().run(),
    },
    {
      title: "Heading 1",
      icon: Heading01Icon,
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run(),
    },
    {
      title: "Heading 2",
      icon: Heading02Icon,
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run(),
    },
    {
      title: "Heading 3",
      icon: Heading03Icon,
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run(),
    },
    {
      title: "Bullet list",
      icon: LeftToRightListBulletIcon,
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).toggleBulletList().run(),
    },
    {
      title: "Numbered list",
      icon: LeftToRightListNumberIcon,
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
    },
    {
      title: "To-do list",
      icon: CheckListIcon,
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).toggleTaskList().run(),
    },
    {
      title: "Toggle list",
      icon: ArrowRight01Icon,
      command: ({ editor, range }) =>
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertContent({
            type: "toggle",
            attrs: { open: true },
            content: [{ type: "paragraph" }],
          })
          .run(),
    },
    {
      title: "Quote",
      icon: QuoteUpIcon,
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
    },
    {
      title: "Callout",
      icon: Note01Icon,
      command: ({ editor, range }) =>
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertContent({
            type: "callout",
            attrs: { emoji: "💡" },
            content: [{ type: "paragraph" }],
          })
          .run(),
    },
    {
      title: "Divider",
      icon: MinusSignIcon,
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
    },
    {
      title: "Code block",
      icon: SourceCodeIcon,
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
    },
    {
      title: "Image",
      icon: Image02Icon,
      command: ({ editor, range }) => {
        const url = window.prompt("Image URL");
        if (!url) {
          editor.chain().focus().deleteRange(range).run();
          return;
        }
        editor.chain().focus().deleteRange(range).setImage({ src: url }).run();
      },
    },
    {
      title: "Video",
      icon: Video01Icon,
      command: (ctx) =>
        insertMediaNode({ ...ctx, type: "video", promptLabel: "Video URL (YouTube, Vimeo, or .mp4 link)" }),
    },
    {
      title: "Audio",
      icon: MusicNote01Icon,
      command: (ctx) =>
        insertMediaNode({ ...ctx, type: "audio", promptLabel: "Audio file URL" }),
    },
    {
      title: "PDF",
      icon: Pdf01Icon,
      command: (ctx) =>
        insertMediaNode({ ...ctx, type: "pdf", promptLabel: "PDF file URL" }),
    },
    {
      title: "Embed",
      icon: Link04Icon,
      command: (ctx) =>
        insertMediaNode({ ...ctx, type: "embed", promptLabel: "URL to embed (Figma, YouTube, Google Maps, CodePen, etc.)" }),
    },
  ];

  if (!query) return items;
  return items.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase())
  );
}
