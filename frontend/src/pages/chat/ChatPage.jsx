import { useEffect, useMemo, useRef, useState } from "react";
import { SentIcon, HashtagIcon } from "hugeicons-react";
import { listMessages, sendMessage } from "@/lib/chat";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { getSocket } from "@/lib/socket";
import Avatar from "@/components/ui/Avatar";

function channelLabel(channel, currentUserId) {
  if (!channel.isDM) return channel.name || "Untitled channel";
  const other = channel.members.find((m) => m._id !== currentUserId);
  return other?.name ?? "Direct message";
}

export default function ChatPage() {
  const currentUser = useAuthStore((s) => s.user);
  const channels = useChatStore((s) => s.channels);
  const activeChannelId = useChatStore((s) => s.activeChannelId);

  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!activeChannelId) return;
    listMessages(activeChannelId).then(setMessages);

    const socket = getSocket();
    socket.emit("join_channel", activeChannelId);

    function handleNew({ channelId, message }) {
      if (channelId !== activeChannelId) return;
      setMessages((prev) => [...prev, message]);
    }
    socket.on("message:new", handleNew);

    return () => {
      socket.emit("leave_channel", activeChannelId);
      socket.off("message:new", handleNew);
    };
  }, [activeChannelId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const activeChannel = useMemo(
    () => channels.find((c) => c._id === activeChannelId) ?? null,
    [channels, activeChannelId]
  );

  async function handleSend(e) {
    e.preventDefault();
    if (!draft.trim() || !activeChannelId) return;
    const body = draft.trim();
    setDraft("");
    await sendMessage(activeChannelId, body);
  }

  return (
    <div className="flex h-full flex-col">
      {activeChannel ? (
        <>
          <div className="flex items-center gap-2 border-b border-(--color-border) px-6 py-3.5">
            {activeChannel.isDM ? (
              <Avatar name={channelLabel(activeChannel, currentUser?._id)} size={22} />
            ) : (
              <HashtagIcon size={16} strokeWidth={1.8} className="text-(--color-text-muted)" />
            )}
            <span className="text-sm font-semibold">{channelLabel(activeChannel, currentUser?._id)}</span>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
            <div className="mx-auto flex max-w-2xl flex-col gap-5">
              {messages.map((m) => {
                const isMine = m.author?._id === currentUser?._id;
                return isMine ? (
                  <div key={m._id} className="flex justify-end">
                    <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-(--color-accent) px-4 py-2.5 text-sm text-white">
                      <div className="whitespace-pre-wrap">{m.body}</div>
                      <div className="mt-1 text-right text-[10px] text-white/70">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={m._id} className="flex items-start gap-2.5">
                    <Avatar name={m.author?.name} size={24} />
                    <div className="min-w-0 max-w-[75%]">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-semibold">{m.author?.name ?? "Unknown"}</span>
                        <span className="text-[10px] text-(--color-text-muted)">
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div className="text-sm whitespace-pre-wrap">{m.body}</div>
                    </div>
                  </div>
                );
              })}
              {messages.length === 0 && (
                <div className="py-16 text-center text-sm text-(--color-text-muted)">
                  No messages yet. Say hello 👋
                </div>
              )}
            </div>
          </div>

          <div className="px-6 pb-6">
            <form
              onSubmit={handleSend}
              className="mx-auto flex max-w-2xl items-center gap-2 rounded-2xl border border-(--color-border) bg-(--color-canvas) px-3 py-2.5 shadow-sm"
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Message…"
                className="flex-1 border-none bg-transparent text-sm outline-none placeholder:text-(--color-text-muted)"
              />
              <button
                type="submit"
                disabled={!draft.trim()}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--color-accent) text-white disabled:opacity-30"
              >
                <SentIcon size={14} strokeWidth={1.8} />
              </button>
            </form>
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
