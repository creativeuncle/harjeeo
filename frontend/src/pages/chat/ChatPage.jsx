import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  HashtagIcon,
  Download04Icon,
  Doc01Icon,
  SmileIcon,
  ArrowTurnBackwardIcon,
  Tick01Icon,
  Tick02Icon,
  PinIcon,
  Cancel01Icon,
} from "hugeicons-react";
import { listMessages, sendMessage, toggleReaction, togglePinMessage, markChannelRead } from "@/lib/chat";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { getSocket } from "@/lib/socket";
import Avatar from "@/components/ui/Avatar";
import VoiceMessagePlayer from "@/components/ui/VoiceMessagePlayer";
import ChatComposer from "./ChatComposer";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

function channelLabel(channel, currentUserId) {
  if (!channel.isDM) return channel.name || "Untitled channel";
  const other = channel.members.find((m) => m._id !== currentUserId);
  return other?.name ?? "Direct message";
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function MessageAttachment({ attachment }) {
  if (attachment.type === "image") {
    return (
      <a href={attachment.url} target="_blank" rel="noreferrer">
        <img
          src={attachment.url}
          alt={attachment.name || "Image"}
          className="mt-1 max-h-64 max-w-full rounded-lg object-cover"
        />
      </a>
    );
  }
  if (attachment.type === "audio") {
    return <VoiceMessagePlayer url={attachment.url} />;
  }
  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noreferrer"
      className="mt-1 flex items-center gap-2 rounded-lg border border-black/10 bg-black/[.03] px-3 py-2 text-sm hover:bg-black/5 dark:border-white/10 dark:bg-white/[.05] dark:hover:bg-white/10"
    >
      <Doc01Icon size={16} strokeWidth={1.8} className="shrink-0" />
      <span className="min-w-0 flex-1 truncate">{attachment.name || "File"}</span>
      <Download04Icon size={14} strokeWidth={1.8} className="shrink-0" />
    </a>
  );
}

function ReplyPreview({ replyTo, muted }) {
  if (!replyTo) return null;
  return (
    <div
      className={`mb-1.5 rounded-md border-l-2 px-2 py-1 text-xs ${
        muted
          ? "border-white/50 bg-white/10 text-white/80"
          : "border-(--color-accent) bg-black/5 text-(--color-text-muted) dark:bg-white/10"
      }`}
    >
      <div className={`font-medium ${muted ? "text-white" : "text-(--color-accent)"}`}>
        {replyTo.author?.name ?? "Message"}
      </div>
      <div className="truncate">{replyTo.body || replyTo.attachment?.name || "Attachment"}</div>
    </div>
  );
}

function groupReactions(reactions, currentUserId) {
  const map = new Map();
  for (const r of reactions ?? []) {
    if (!map.has(r.emoji)) map.set(r.emoji, { emoji: r.emoji, count: 0, mine: false });
    const entry = map.get(r.emoji);
    entry.count += 1;
    if (String(r.user) === String(currentUserId)) entry.mine = true;
  }
  return Array.from(map.values());
}

function ReactionRow({ reactions, currentUserId, onToggle }) {
  const grouped = groupReactions(reactions, currentUserId);
  if (grouped.length === 0) return null;
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {grouped.map((r) => (
        <button
          key={r.emoji}
          type="button"
          onClick={() => onToggle(r.emoji)}
          className={`flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs ${
            r.mine
              ? "border-(--color-accent) bg-(--color-accent)/10"
              : "border-(--color-border) bg-black/5 dark:bg-white/10"
          }`}
        >
          <span>{r.emoji}</span>
          <span className="text-(--color-text-muted)">{r.count}</span>
        </button>
      ))}
    </div>
  );
}

function ReactionPicker({ triggerRef, open, onClose, onPick }) {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPosition({ top: rect.bottom + 6, left: Math.min(rect.left, window.innerWidth - 260) });
  }, [open, triggerRef]);

  if (!open || !position) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        style={position}
        className="fixed z-50 flex items-center gap-1 rounded-full border border-(--color-border) bg-(--color-canvas) px-2 py-1.5 shadow-lg"
      >
        {QUICK_REACTIONS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => {
              onPick(emoji);
              onClose();
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full text-base hover:bg-black/5 dark:hover:bg-white/10"
          >
            {emoji}
          </button>
        ))}
      </div>
    </>,
    document.body
  );
}

function StatusTicks({ message, currentUserId }) {
  const seen = (message.readBy ?? []).some((id) => String(id) !== String(currentUserId));
  const delivered = (message.deliveredTo ?? []).some((id) => String(id) !== String(currentUserId));

  if (seen) {
    return (
      <span className="relative inline-flex w-3.5 shrink-0 text-sky-300">
        <Tick02Icon size={13} strokeWidth={2.4} />
      </span>
    );
  }
  if (delivered) {
    return (
      <span className="relative inline-flex w-3.5 shrink-0 text-white/70">
        <Tick02Icon size={13} strokeWidth={2.4} />
      </span>
    );
  }
  return (
    <span className="relative inline-flex w-3.5 shrink-0 text-white/70">
      <Tick01Icon size={13} strokeWidth={2.4} />
    </span>
  );
}

function MessageRow({ message, isMine, currentUser, onReply, onReact, onPin }) {
  const reactTriggerRef = useRef(null);
  const [reactOpen, setReactOpen] = useState(false);

  const toolbar = (
    <div
      className={`flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 ${
        isMine ? "order-first" : ""
      }`}
    >
      <button
        ref={reactTriggerRef}
        type="button"
        onClick={() => setReactOpen(true)}
        title="React"
        className="flex h-6 w-6 items-center justify-center rounded-full text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
      >
        <SmileIcon size={13} strokeWidth={1.8} />
      </button>
      <button
        type="button"
        onClick={() => onReply(message)}
        title="Reply"
        className="flex h-6 w-6 items-center justify-center rounded-full text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
      >
        <ArrowTurnBackwardIcon size={13} strokeWidth={1.8} />
      </button>
      <button
        type="button"
        onClick={() => onPin(message._id)}
        title={message.pinned ? "Unpin" : "Pin"}
        className={`flex h-6 w-6 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 ${
          message.pinned ? "text-amber-500" : "text-(--color-text-muted)"
        }`}
      >
        <PinIcon size={13} strokeWidth={1.8} className={message.pinned ? "fill-current" : ""} />
      </button>
      <ReactionPicker
        triggerRef={reactTriggerRef}
        open={reactOpen}
        onClose={() => setReactOpen(false)}
        onPick={(emoji) => onReact(message._id, emoji)}
      />
    </div>
  );

  if (isMine) {
    return (
      <div id={`msg-${message._id}`} className="group flex items-center justify-end gap-1">
        {toolbar}
        <div className="max-w-[75%]">
          <div className="rounded-2xl rounded-tr-sm bg-(--color-accent) px-4 py-2.5 text-sm text-white">
            <ReplyPreview replyTo={message.replyTo} muted />
            {message.body && <div className="whitespace-pre-wrap">{message.body}</div>}
            {message.attachment && <MessageAttachment attachment={message.attachment} />}
            <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-white/70">
              {formatTime(message.createdAt)}
              <StatusTicks message={message} currentUserId={currentUser?._id} />
            </div>
          </div>
          <ReactionRow
            reactions={message.reactions}
            currentUserId={currentUser?._id}
            onToggle={(emoji) => onReact(message._id, emoji)}
          />
        </div>
      </div>
    );
  }

  return (
    <div id={`msg-${message._id}`} className="group flex items-start gap-2.5">
      <Avatar name={message.author?.name} size={24} />
      <div className="min-w-0 max-w-[75%] flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-semibold">{message.author?.name ?? "Unknown"}</span>
          <span className="text-[10px] text-(--color-text-muted)">{formatTime(message.createdAt)}</span>
        </div>
        <ReplyPreview replyTo={message.replyTo} />
        {message.body && <div className="text-sm whitespace-pre-wrap">{message.body}</div>}
        {message.attachment && <MessageAttachment attachment={message.attachment} />}
        <ReactionRow
          reactions={message.reactions}
          currentUserId={currentUser?._id}
          onToggle={(emoji) => onReact(message._id, emoji)}
        />
      </div>
      {toolbar}
    </div>
  );
}

function PinnedBar({ messages, onJumpTo, onUnpin }) {
  const pinned = messages.filter((m) => m.pinned);
  const [open, setOpen] = useState(false);
  if (pinned.length === 0) return null;

  return (
    <div className="border-b border-(--color-border) bg-amber-500/5 px-10 py-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400"
      >
        <PinIcon size={13} strokeWidth={1.8} className="fill-current" />
        {pinned.length} pinned message{pinned.length > 1 ? "s" : ""}
      </button>
      {open && (
        <div className="mt-2 flex flex-col gap-1">
          {pinned.map((m) => (
            <div
              key={m._id}
              className="flex items-center gap-2 rounded-md px-2 py-1 text-xs hover:bg-black/5 dark:hover:bg-white/10"
            >
              <button
                type="button"
                onClick={() => onJumpTo(m._id)}
                className="min-w-0 flex-1 truncate text-left"
              >
                <span className="font-medium">{m.author?.name}: </span>
                {m.body || m.attachment?.name || "Attachment"}
              </button>
              <button
                type="button"
                onClick={() => onUnpin(m._id)}
                className="shrink-0 rounded-full p-1 text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
              >
                <Cancel01Icon size={12} strokeWidth={1.8} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  const currentUser = useAuthStore((s) => s.user);
  const channels = useChatStore((s) => s.channels);
  const activeChannelId = useChatStore((s) => s.activeChannelId);

  const [messages, setMessages] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    setReplyingTo(null);
    if (!activeChannelId) return;
    listMessages(activeChannelId).then(setMessages);
    markChannelRead(activeChannelId);

    const socket = getSocket();
    socket.emit("join_channel", activeChannelId);

    function handleNew({ channelId, message }) {
      if (channelId !== activeChannelId) return;
      setMessages((prev) => [...prev, message]);
      if (message.author?._id !== currentUser?._id) markChannelRead(activeChannelId);
    }
    function handleReaction({ channelId, message }) {
      if (channelId !== activeChannelId) return;
      setMessages((prev) => prev.map((m) => (m._id === message._id ? message : m)));
    }
    function handlePinned({ channelId, message }) {
      if (channelId !== activeChannelId) return;
      setMessages((prev) => prev.map((m) => (m._id === message._id ? message : m)));
    }
    function handleRead({ channelId, userId }) {
      if (channelId !== activeChannelId) return;
      setMessages((prev) =>
        prev.map((m) => ({
          ...m,
          readBy: m.readBy?.includes(userId) ? m.readBy : [...(m.readBy ?? []), userId],
          deliveredTo: m.deliveredTo?.includes(userId) ? m.deliveredTo : [...(m.deliveredTo ?? []), userId],
        }))
      );
    }

    socket.on("message:new", handleNew);
    socket.on("message:reaction", handleReaction);
    socket.on("message:pinned", handlePinned);
    socket.on("message:read", handleRead);

    return () => {
      socket.emit("leave_channel", activeChannelId);
      socket.off("message:new", handleNew);
      socket.off("message:reaction", handleReaction);
      socket.off("message:pinned", handlePinned);
      socket.off("message:read", handleRead);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChannelId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const activeChannel = useMemo(
    () => channels.find((c) => c._id === activeChannelId) ?? null,
    [channels, activeChannelId]
  );

  async function handleSend(body, attachment, replyTo) {
    if (!activeChannelId) return;
    await sendMessage(activeChannelId, body, attachment, replyTo);
  }

  async function handleReact(messageId, emoji) {
    const message = await toggleReaction(messageId, emoji);
    setMessages((prev) => prev.map((m) => (m._id === message._id ? message : m)));
  }

  async function handlePin(messageId) {
    const message = await togglePinMessage(messageId);
    setMessages((prev) => prev.map((m) => (m._id === message._id ? message : m)));
  }

  function handleJumpTo(messageId) {
    document.getElementById(`msg-${messageId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <div className="flex h-full flex-col">
      {activeChannel ? (
        <>
          <div className="flex items-center gap-2 border-b border-(--color-border) px-10 py-3.5">
            {activeChannel.isDM ? (
              <Avatar name={channelLabel(activeChannel, currentUser?._id)} size={22} />
            ) : (
              <HashtagIcon size={16} strokeWidth={1.8} className="text-(--color-text-muted)" />
            )}
            <span className="text-sm font-semibold">{channelLabel(activeChannel, currentUser?._id)}</span>
          </div>

          <PinnedBar messages={messages} onJumpTo={handleJumpTo} onUnpin={handlePin} />

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-10 py-6">
            <div className="flex flex-col gap-5">
              {messages.map((m) => (
                <MessageRow
                  key={m._id}
                  message={m}
                  isMine={m.author?._id === currentUser?._id}
                  currentUser={currentUser}
                  onReply={setReplyingTo}
                  onReact={handleReact}
                  onPin={handlePin}
                />
              ))}
              {messages.length === 0 && (
                <div className="py-16 text-center text-sm text-(--color-text-muted)">
                  No messages yet. Say hello 👋
                </div>
              )}
            </div>
          </div>

          <div className="px-10 pb-6">
            <ChatComposer
              onSend={handleSend}
              replyingTo={replyingTo}
              onCancelReply={() => setReplyingTo(null)}
            />
          </div>
        </>
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-(--color-text-muted)">
          Select a person from the sidebar to start a conversation.
        </div>
      )}
    </div>
  );
}
