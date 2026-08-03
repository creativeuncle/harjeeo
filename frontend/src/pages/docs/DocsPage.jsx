import { useState } from "react";
import { BookOpen01Icon } from "hugeicons-react";
import RichTextEditor from "@/components/editor/RichTextEditor";

export default function DocsPage() {
  const [content, setContent] = useState(null);

  return (
    <div className="px-10 py-8">
      <div className="mb-6 flex items-center gap-2">
        <BookOpen01Icon size={26} strokeWidth={1.8} />
        <h1 className="text-2xl font-semibold">Untitled</h1>
      </div>

      <RichTextEditor
        placeholder="Type '/' for commands…"
        onChange={setContent}
      />
    </div>
  );
}
