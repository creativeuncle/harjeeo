import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Share08Icon, Copy01Icon, Globe02Icon, CheckmarkCircle02Icon } from "hugeicons-react";

export default function SharePopover({ isPublic, onToggle, shareType, id }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const [copied, setCopied] = useState(false);
  const triggerRef = useRef(null);

  const shareUrl = `${window.location.origin}/share/${shareType}/${id}`;

  const POPOVER_WIDTH = 288; // matches w-72

  function handleOpen() {
    const rect = triggerRef.current.getBoundingClientRect();
    const left = Math.min(
      Math.max(rect.right - POPOVER_WIDTH, 8),
      window.innerWidth - POPOVER_WIDTH - 8
    );
    setPosition({ top: rect.bottom + 4, left });
    setOpen(true);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
      >
        <Share08Icon size={15} strokeWidth={1.8} />
        Share
      </button>

      {open &&
        position &&
        createPortal(
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div
              style={{ top: position.top, left: position.left }}
              className="fixed z-50 w-72 rounded-lg border border-(--color-border) bg-(--color-canvas) p-3 shadow-lg"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Globe02Icon size={16} strokeWidth={1.8} />
                  Publish to web
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isPublic}
                  onClick={() => onToggle(!isPublic)}
                  className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                    isPublic ? "bg-(--color-accent)" : "bg-black/15 dark:bg-white/20"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                      isPublic ? "translate-x-4.5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
              <p className="mt-1.5 text-xs text-(--color-text-muted)">
                {isPublic
                  ? "Anyone with the link can view this page."
                  : "Only workspace members can see this page."}
              </p>

              {isPublic && (
                <div className="mt-3 flex items-center gap-1.5 rounded-md border border-(--color-border) px-2 py-1.5">
                  <span className="min-w-0 flex-1 truncate text-xs text-(--color-text-muted)">
                    {shareUrl}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    title="Copy link"
                    className="shrink-0 text-(--color-text-muted) hover:text-(--color-text)"
                  >
                    {copied ? (
                      <CheckmarkCircle02Icon size={15} strokeWidth={1.8} className="text-(--color-accent)" />
                    ) : (
                      <Copy01Icon size={15} strokeWidth={1.8} />
                    )}
                  </button>
                </div>
              )}
            </div>
          </>,
          document.body
        )}
    </>
  );
}
