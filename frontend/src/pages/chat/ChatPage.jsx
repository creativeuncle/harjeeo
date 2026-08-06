import { useEffect, useMemo, useRef, useState } from "react";
import { HashtagIcon, Download04Icon, Doc01Icon } from "hugeicons-react";
import { listMessages, sendMessage } from "@/lib/chat";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { getSocket } from "@/lib/socket";
import Avatar from "@/components/ui/Avatar";
import VoiceMessagePlayer from "@/components/ui/VoiceMessagePlayer";
import ChatComposer from "./ChatComposer";

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

  async function handleSend(body, attachment) {
    if (!activeChannelId) return;
    await sendMessage(activeChannelId, body, attachment);
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
                      {m.body && <div className="whitespace-pre-wrap">{m.body}</div>}
                      {m.attachment && <MessageAttachment attachment={m.attachment} />}
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
                      {m.body && <div className="text-sm whitespace-pre-wrap">{m.body}</div>}
                      {m.attachment && <MessageAttachment attachment={m.attachment} />}
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
            <ChatComposer onSend={handleSend} />
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
