import { useEffect, useMemo, useState } from "react";
import {
  BookOpen01Icon,
  Add01Icon,
  Delete02Icon,
  Tick02Icon,
  LinkSquare01Icon,
} from "hugeicons-react";
import { listBookmarks, createBookmark, updateBookmark, deleteBookmark, faviconFor } from "@/lib/bookmarks";
import { useWorkspaceStore } from "@/store/workspaceStore";

export default function ReadingListPage() {
  const workspaceId = useWorkspaceStore((s) => s.currentId);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [activeTag, setActiveTag] = useState(null);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    if (!workspaceId) {
      setBookmarks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    listBookmarks(workspaceId)
      .then(setBookmarks)
      .finally(() => setLoading(false));
  }, [workspaceId]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!url.trim() || adding) return;
    setAdding(true);
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const bookmark = await createBookmark(workspaceId, { url: url.trim(), tags });
      setBookmarks((prev) => [bookmark, ...prev]);
      setUrl("");
      setTagsInput("");
    } finally {
      setAdding(false);
    }
  }

  function patch(id, updates) {
    setBookmarks((prev) => prev.map((b) => (b._id === id ? { ...b, ...updates } : b)));
    updateBookmark(id, updates).catch(() => {});
  }

  async function handleDelete(id) {
    if (!window.confirm("Remove this bookmark?")) return;
    await deleteBookmark(id);
    setBookmarks((prev) => prev.filter((b) => b._id !== id));
  }

  const allTags = useMemo(() => {
    const set = new Set();
    for (const b of bookmarks) for (const t of b.tags ?? []) set.add(t);
    return Array.from(set).sort();
  }, [bookmarks]);

  const visible = bookmarks.filter((b) => {
    if (activeTag && !(b.tags ?? []).includes(activeTag)) return false;
    if (showUnreadOnly && b.read) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-3xl px-10 py-8">
      <div className="mb-6 flex items-center gap-2">
        <BookOpen01Icon size={26} strokeWidth={1.8} />
        <h1 className="text-2xl font-semibold">Reading List</h1>
      </div>

      <form onSubmit={handleAdd} className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a link…"
          className="min-w-0 flex-1 rounded-md border border-(--color-border) bg-(--color-canvas) px-3 py-2 text-sm outline-none"
        />
        <input
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="Tags, comma separated"
          className="w-48 rounded-md border border-(--color-border) bg-(--color-canvas) px-3 py-2 text-sm outline-none"
        />
        <button
          type="submit"
          disabled={adding || !url.trim()}
          className="flex items-center gap-1.5 rounded-md bg-(--color-accent) px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          <Add01Icon size={15} strokeWidth={1.8} />
          Add
        </button>
      </form>

      {(allTags.length > 0 || bookmarks.length > 0) && (
        <div className="mb-4 flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowUnreadOnly((v) => !v)}
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              showUnreadOnly
                ? "bg-(--color-accent) text-white"
                : "bg-black/5 text-(--color-text-muted) hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15"
            }`}
          >
            Unread only
          </button>
          {activeTag && (
            <button
              type="button"
              onClick={() => setActiveTag(null)}
              className="rounded-full bg-black/5 px-2.5 py-1 text-xs text-(--color-text-muted) hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15"
            >
              Clear tag ×
            </button>
          )}
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag === activeTag ? null : tag)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                activeTag === tag
                  ? "bg-(--color-accent) text-white"
                  : "bg-black/5 text-(--color-text-muted) hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15"
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-1">
        {!loading && visible.length === 0 && (
          <div className="py-16 text-center text-sm text-(--color-text-muted)">
            {bookmarks.length === 0 ? "No bookmarks yet — paste a link above." : "No bookmarks match this filter."}
          </div>
        )}
        {visible.map((b) => (
          <div
            key={b._id}
            className={`group flex items-start gap-3 rounded-md px-2 py-2.5 hover:bg-black/[.02] dark:hover:bg-white/[.03] ${
              b.read ? "opacity-60" : ""
            }`}
          >
            <img
              src={faviconFor(b.url)}
              alt=""
              className="mt-0.5 h-5 w-5 shrink-0 rounded"
              onError={(e) => {
                e.currentTarget.style.visibility = "hidden";
              }}
            />
            <div className="min-w-0 flex-1">
              <a
                href={b.url}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center gap-1 truncate text-sm font-medium hover:underline ${
                  b.read ? "line-through" : ""
                }`}
              >
                {b.title || b.url}
                <LinkSquare01Icon size={12} strokeWidth={1.8} className="shrink-0 text-(--color-text-muted)" />
              </a>
              <div className="truncate text-xs text-(--color-text-muted)">{b.url}</div>
              {(b.tags ?? []).length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {b.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-black/5 px-2 py-0.5 text-[11px] text-(--color-text-muted) dark:bg-white/10"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100">
              <button
                type="button"
                onClick={() => patch(b._id, { read: !b.read })}
                title={b.read ? "Mark as unread" : "Mark as read"}
                className={`rounded-md p-1.5 hover:bg-black/5 dark:hover:bg-white/10 ${
                  b.read ? "text-emerald-500" : "text-(--color-text-muted)"
                }`}
              >
                <Tick02Icon size={15} strokeWidth={1.8} />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(b._id)}
                title="Remove"
                className="rounded-md p-1.5 text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
              >
                <Delete02Icon size={15} strokeWidth={1.8} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
