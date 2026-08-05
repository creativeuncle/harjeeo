import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Download04Icon, FileExportIcon, PrinterIcon } from "hugeicons-react";
import { downloadMarkdown } from "@/lib/markdown";

export default function ExportMenu({ title, content }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const triggerRef = useRef(null);

  function handleOpen() {
    const rect = triggerRef.current.getBoundingClientRect();
    setPosition({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    setOpen(true);
  }

  function handleMarkdown() {
    downloadMarkdown(title || "untitled", content);
    setOpen(false);
  }

  function handlePdf() {
    setOpen(false);
    window.print();
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
      >
        <FileExportIcon size={15} strokeWidth={1.8} />
        Export
      </button>

      {open &&
        position &&
        createPortal(
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div
              style={{ top: position.top, right: position.right }}
              className="fixed z-50 w-52 rounded-lg border border-(--color-border) bg-(--color-canvas) p-1 shadow-lg"
            >
              <button
                type="button"
                onClick={handleMarkdown}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
              >
                <Download04Icon size={15} strokeWidth={1.8} />
                Export as Markdown
              </button>
              <button
                type="button"
                onClick={handlePdf}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
              >
                <PrinterIcon size={15} strokeWidth={1.8} />
                Export as PDF
              </button>
            </div>
          </>,
          document.body
        )}
    </>
  );
}
