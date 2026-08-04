import { useMemo, useState } from "react";
import { EMOJI_LIST } from "@/lib/emojiList";

export default function IconPicker({ trigger, onSelect, onRemove }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return EMOJI_LIST;
    const q = query.toLowerCase();
    return EMOJI_LIST.filter((e) => e.keywords.includes(q));
  }, [query]);

  function handlePick(emoji) {
    onSelect(emoji);
    setOpen(false);
    setQuery("");
  }

  return (
    <div className="relative inline-block">
      <button type="button" onClick={() => setOpen((o) => !o)}>
        {trigger}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-2 w-72 rounded-lg border border-(--color-border) bg-(--color-canvas) p-2 shadow-lg">
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

            <div className="grid max-h-56 grid-cols-8 gap-0.5 overflow-y-auto">
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
        </>
      )}
    </div>
  );
}
