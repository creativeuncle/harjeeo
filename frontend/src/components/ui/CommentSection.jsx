import { useEffect, useRef, useState } from "react";
import { Attachment02Icon, AtIcon, ArrowUp01Icon, Delete02Icon } from "hugeicons-react";
import { listComments, createComment, deleteComment } from "@/lib/comments";
import { useAuthStore } from "@/store/authStore";
import Avatar from "./Avatar";

function formatTimestamp(iso) {
  const date = new Date(iso);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  const time = date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  if (sameDay) return time;
  return `${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })} · ${time}`;
}

export default function CommentSection({ targetType, targetId }) {
  const user = useAuthStore((s) => s.user);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState("");
  const [posting, setPosting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!targetId) return;
    setLoading(true);
    listComments(targetType, targetId)
      .then(setComments)
      .finally(() => setLoading(false));
  }, [targetType, targetId]);

  async function handleSubmit() {
    const body = value.trim();
    if (!body || posting) return;
    setPosting(true);
    try {
      const comment = await createComment(targetType, targetId, body);
      setComments((prev) => [...prev, comment]);
      setValue("");
      inputRef.current?.focus();
    } finally {
      setPosting(false);
    }
  }

  async function handleDelete(id) {
    setComments((prev) => prev.filter((c) => c._id !== id));
    deleteComment(id).catch(() => {});
  }

  return (
    <div>
      <div className="text-sm font-medium text-(--color-text-muted)">Comments</div>

      {!loading && comments.length > 0 && (
        <div className="mt-3 flex flex-col gap-3">
          {comments.map((comment) => {
            const isOwn = comment.author?._id === user?.id;
            return (
              <div key={comment._id} className="group flex items-start gap-2.5">
                {comment.author?.avatarUrl ? (
                  <img
                    src={comment.author.avatarUrl}
                    alt={comment.author.name}
                    className="mt-0.5 h-6 w-6 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="mt-0.5">
                    <Avatar name={comment.author?.name} size={24} />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{comment.author?.name ?? "Unknown"}</span>
                    <span className="text-xs text-(--color-text-muted)">
                      {formatTimestamp(comment.createdAt)}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap break-words text-sm">{comment.body}</p>
                </div>
                {isOwn && (
                  <button
                    type="button"
                    onClick={() => handleDelete(comment._id)}
                    className="shrink-0 rounded-md p-1 text-(--color-text-muted) opacity-0 hover:bg-black/5 group-hover:opacity-100 dark:hover:bg-white/10"
                    title="Delete comment"
                  >
                    <Delete02Icon size={14} strokeWidth={1.8} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-3 flex items-center gap-2.5">
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="h-7 w-7 shrink-0 rounded-full object-cover"
          />
        ) : (
          <Avatar name={user?.name} size={28} />
        )}
        <div className="flex flex-1 items-center gap-2 rounded-md border border-(--color-border) px-2.5 py-1.5">
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Add a comment…"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-(--color-text-muted)"
          />
          <button
            type="button"
            title="Attach"
            className="shrink-0 text-(--color-text-muted) hover:text-(--color-text)"
          >
            <Attachment02Icon size={16} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            title="Mention"
            className="shrink-0 text-(--color-text-muted) hover:text-(--color-text)"
          >
            <AtIcon size={16} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!value.trim() || posting}
            title="Send"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black/10 text-(--color-text) disabled:opacity-50 dark:bg-white/15"
          >
            <ArrowUp01Icon size={14} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
