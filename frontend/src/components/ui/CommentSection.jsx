import { useEffect, useRef, useState } from "react";
import {
  Attachment02Icon,
  AtIcon,
  ArrowUp01Icon,
  Delete02Icon,
  ArrowTurnBackwardIcon,
  Cancel01Icon,
} from "hugeicons-react";
import { listComments, createComment, deleteComment } from "@/lib/comments";
import { listMembers } from "@/lib/workspaces";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import Avatar from "./Avatar";

function formatTimestamp(iso) {
  const date = new Date(iso);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  const time = date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  if (sameDay) return time;
  return `${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })} · ${time}`;
}

// Finds an in-progress "@partial" token ending at the cursor, if any.
function findMentionTrigger(text, cursor) {
  const upToCursor = text.slice(0, cursor);
  const at = upToCursor.lastIndexOf("@");
  if (at === -1) return null;
  const between = upToCursor.slice(at + 1);
  if (/\s/.test(between)) return null;
  return { start: at, query: between };
}

export default function CommentSection({ targetType, targetId }) {
  const user = useAuthStore((s) => s.user);
  const workspaceId = useWorkspaceStore((s) => s.currentId);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState("");
  const [posting, setPosting] = useState(false);
  const [members, setMembers] = useState(null);
  const [mentioned, setMentioned] = useState([]); // [{ id, name }]
  const [mentionTrigger, setMentionTrigger] = useState(null); // { start, query }
  const [replyingTo, setReplyingTo] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!targetId) return;
    setLoading(true);
    listComments(targetType, targetId)
      .then(setComments)
      .finally(() => setLoading(false));
  }, [targetType, targetId]);

  function ensureMembersLoaded() {
    if (members || !workspaceId) return;
    listMembers(workspaceId).then((data) =>
      setMembers(data.members.map((m) => m.user).filter(Boolean))
    );
  }

  function handleChange(e) {
    const text = e.target.value;
    setValue(text);
    const trigger = findMentionTrigger(text, e.target.selectionStart);
    setMentionTrigger(trigger);
    if (trigger) ensureMembersLoaded();
  }

  function handleSelectMention(member) {
    if (!mentionTrigger) return;
    const before = value.slice(0, mentionTrigger.start);
    const after = value.slice(mentionTrigger.start + 1 + mentionTrigger.query.length);
    const text = `${before}@${member.name} ${after}`;
    setValue(text);
    setMentioned((prev) => [...prev, { id: member._id, name: member.name }]);
    setMentionTrigger(null);
    inputRef.current?.focus();
  }

  const filteredMembers = (members ?? []).filter((m) =>
    m.name.toLowerCase().includes((mentionTrigger?.query ?? "").toLowerCase())
  );

  async function handleSubmit() {
    const body = value.trim();
    if (!body || posting) return;
    setPosting(true);
    try {
      const mentionIds = mentioned.filter((m) => body.includes(`@${m.name}`)).map((m) => m.id);
      const comment = await createComment(targetType, targetId, body, mentionIds, replyingTo?._id ?? null);
      setComments((prev) => [...prev, comment]);
      setValue("");
      setMentioned([]);
      setReplyingTo(null);
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
            const isOwn = comment.author?._id === user?._id;
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
                  {comment.replyTo && (
                    <div className="mt-1 mb-1 rounded-md border-l-2 border-(--color-border) bg-black/5 px-2 py-1 text-xs text-(--color-text-muted) dark:bg-white/5">
                      <span className="font-medium text-(--color-text)">
                        {comment.replyTo.author?.name ?? "Comment"}
                      </span>{" "}
                      <span className="truncate">{comment.replyTo.body}</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap break-words text-sm">{comment.body}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setReplyingTo(comment);
                    inputRef.current?.focus();
                  }}
                  className="shrink-0 rounded-md p-1 text-(--color-text-muted) opacity-0 hover:bg-black/5 group-hover:opacity-100 dark:hover:bg-white/10"
                  title="Reply"
                >
                  <ArrowTurnBackwardIcon size={14} strokeWidth={1.8} />
                </button>
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

      {replyingTo && (
        <div className="mt-3 flex items-center justify-between rounded-md border-l-2 border-(--color-accent) bg-black/5 px-2.5 py-1.5 text-xs dark:bg-white/5">
          <div className="min-w-0 truncate">
            Replying to <span className="font-medium">{replyingTo.author?.name ?? "comment"}</span>:{" "}
            <span className="text-(--color-text-muted)">{replyingTo.body}</span>
          </div>
          <button
            type="button"
            onClick={() => setReplyingTo(null)}
            className="shrink-0 rounded-full p-0.5 text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
          >
            <Cancel01Icon size={12} strokeWidth={1.8} />
          </button>
        </div>
      )}

      <div className="relative mt-3 flex items-center gap-2.5">
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
            onChange={handleChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !mentionTrigger) {
                e.preventDefault();
                handleSubmit();
              }
              if (e.key === "Escape") setMentionTrigger(null);
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
            onClick={() => {
              setValue((prev) => `${prev}@`);
              setMentionTrigger({ start: value.length, query: "" });
              ensureMembersLoaded();
              inputRef.current?.focus();
            }}
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

        {mentionTrigger && (
          <div className="absolute bottom-full left-9 z-30 mb-1 w-56 rounded-lg border border-(--color-border) bg-(--color-canvas) p-1 shadow-lg">
            {filteredMembers.length === 0 && (
              <div className="px-2 py-1.5 text-sm text-(--color-text-muted)">No matches</div>
            )}
            {filteredMembers.map((member) => (
              <button
                key={member._id}
                type="button"
                onClick={() => handleSelectMention(member)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
              >
                <Avatar name={member.name} size={20} />
                {member.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
