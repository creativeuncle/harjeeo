import { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { EMOJI_LIST } from "@/lib/emojiList";

const POPUP_WIDTH = 288;
const POPUP_HEIGHT_ESTIMATE = 320;

export default function IconPicker({ trigger, onSelect, onRemove }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState(null);
  const triggerRef = useRef(null);

  const filtered = useMemo(() => {
    if (!query) return EMOJI_LIST;
    const q = query.toLowerCase();
    return EMOJI_LIST.filter((e) => e.keywords.includes(q));
  }, [query]);

  function handleOpen() {
    const rect = triggerRef.current.getBoundingClientRect();
    const openUpward = window.innerHeight - rect.bottom < POPUP_HEIGHT_ESTIMATE;
    const left = Math.min(rect.left, window.innerWidth - POPUP_WIDTH - 8);
    setPosition(
      openUpward
        ? { bottom: window.innerHeight - rect.top + 8, left }
        : { top: rect.bottom + 8, left }
    );
    setOpen(true);
  }

  function handlePick(emoji) {
    onSelect(emoji);
    setOpen(false);
    setQuery("");
  }

  return (
    <>
      <button ref={triggerRef} type="button" onClick={handleOpen}>
        {trigger}
      </button>

      {open &&
        position &&
        createPortal(
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div
              style={{ width: POPUP_WIDTH, ...position }}
              className="fixed z-50 rounded-lg border border-(--color-border) bg-(--color-canvas) p-2 shadow-lg"
            >
              <div className="mb-2 flex items-center gap-2">
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter…"
                  className="flex-1 rounded-md border border-(--color-border) bg-transparent px-2 py-1.5 text-sm outline-none focus:border-(--color-accent)"
                />
                {onRemove && (
                  <button
                    type="button"
                    onClick={() => {
                      onRemove();
                      setOpen(false);
                    }}
                    className="shrink-0 text-xs text-(--color-text-muted) hover:text-(--color-text)"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="thin-scrollbar grid max-h-56 grid-cols-8 gap-0.5 overflow-x-hidden overflow-y-auto">
                {filtered.map(({ emoji }) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handlePick(emoji)}
                    className="flex h-8 w-8 items-center justify-center rounded text-lg hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    {emoji}
                  </button>
                ))}
                {filtered.length === 0 && (
                  <div className="col-span-8 py-4 text-center text-sm text-(--color-text-muted)">
                    No results
                  </div>
                )}
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
}
