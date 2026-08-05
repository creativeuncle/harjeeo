import { useEffect, useMemo, useRef, useState } from "react";
import { Add01Icon, SentIcon, HashtagIcon } from "hugeicons-react";
import { listChannels, createChannel, getOrCreateDM, listMessages, sendMessage } from "@/lib/chat";
import { listMembers } from "@/lib/workspaces";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import { getSocket } from "@/lib/socket";
import Avatar from "@/components/ui/Avatar";

function channelLabel(channel, currentUserId) {
  if (!channel.isDM) return channel.name || "Untitled channel";
  const other = channel.members.find((m) => m._id !== currentUserId);
  return other?.name ?? "Direct message";
}

export default function ChatPage() {
  const workspaceId = useWorkspaceStore((s) => s.currentId);
  const currentUser = useAuthStore((s) => s.user);

  const [channels, setChannels] = useState([]);
  const [members, setMembers] = useState([]);
  const [activeChannelId, setActiveChannelId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [showNewChannel, setShowNewChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!workspaceId) return;
    listChannels(workspaceId).then((list) => {
      setChannels(list);
      setActiveChannelId((prev) => prev ?? list[0]?._id ?? null);
    });
    listMembers(workspaceId).then((data) =>
      setMembers(data.members.map((m) => m.user).filter((u) => u && u._id !== currentUser?._id))
    );
  }, [workspaceId, currentUser?._id]);

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

  async function handleStartDM(userId) {
    const channel = await getOrCreateDM(workspaceId, userId);
    setChannels((prev) => (prev.some((c) => c._id === channel._id) ? prev : [channel, ...prev]));
    setActiveChannelId(channel._id);
  }

  async function handleCreateChannel(e) {
    e.preventDefault();
    if (!newChannelName.trim()) return;
    const channel = await createChannel(workspaceId, {
      name: newChannelName.trim(),
      memberIds: members.map((m) => m._id),
    });
    setChannels((prev) => [channel, ...prev]);
    setActiveChannelId(channel._id);
    setNewChannelName("");
    setShowNewChannel(false);
  }

  return (
    <div className="flex h-full">
      <div className="flex w-64 shrink-0 flex-col border-r border-(--color-border) p-3">
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="text-xs font-semibold uppercase text-(--color-text-muted)">Channels</span>
          <button
            type="button"
            onClick={() => setShowNewChannel((v) => !v)}
            title="New channel"
            className="rounded-md p-1 text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
          >
            <Add01Icon size={15} strokeWidth={1.8} />
          </button>
        </div>

        {showNewChannel && (
          <form onSubmit={handleCreateChannel} className="mb-2 px-1">
            <input
              autoFocus
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              placeholder="Channel name"
              className="w-full rounded-md border border-(--color-border) bg-(--color-canvas) px-2 py-1 text-sm outline-none"
            />
          </form>
        )}

        <div className="flex flex-col gap-0.5">
          {channels
            .filter((c) => !c.isDM)
            .map((c) => (
              <button
                key={c._id}
                type="button"
                onClick={() => setActiveChannelId(c._id)}
                className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm ${
                  c._id === activeChannelId
                    ? "bg-black/5 dark:bg-white/10"
                    : "text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
                }`}
              >
                <HashtagIcon size={14} strokeWidth={1.8} />
                <span className="truncate">{channelLabel(c, currentUser?._id)}</span>
              </button>
            ))}
        </div>

        <div className="mt-4 mb-2 px-1 text-xs font-semibold uppercase text-(--color-text-muted)">
          Direct messages
        </div>
        <div className="flex flex-col gap-0.5">
          {channels
            .filter((c) => c.isDM)
            .map((c) => (
              <button
                key={c._id}
                type="button"
                onClick={() => setActiveChannelId(c._id)}
                className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm ${
                  c._id === activeChannelId
                    ? "bg-black/5 dark:bg-white/10"
                    : "text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
                }`}
              >
                <Avatar name={channelLabel(c, currentUser?._id)} size={18} />
                <span className="truncate">{channelLabel(c, currentUser?._id)}</span>
              </button>
            ))}
        </div>

        <div className="mt-4 mb-2 px-1 text-xs font-semibold uppercase text-(--color-text-muted)">
          Members
        </div>
        <div className="flex flex-col gap-0.5">
          {members.map((m) => (
            <button
              key={m._id}
              type="button"
              onClick={() => handleStartDM(m._id)}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
            >
              <Avatar name={m.name} size={18} />
              <span className="truncate">{m.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {activeChannel ? (
          <>
            <div className="border-b border-(--color-border) px-4 py-3 text-sm font-medium">
              {activeChannel.isDM ? "" : "# "}
              {channelLabel(activeChannel, currentUser?._id)}
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
              <div className="flex flex-col gap-3">
                {messages.map((m) => (
                  <div key={m._id} className="flex items-start gap-2">
                    <Avatar name={m.author?.name} size={26} />
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium">{m.author?.name ?? "Unknown"}</span>
                        <span className="text-[11px] text-(--color-text-muted)">
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="text-sm whitespace-pre-wrap">{m.body}</div>
                    </div>
                  </div>
                ))}
                {messages.length === 0 && (
                  <div className="py-8 text-center text-sm text-(--color-text-muted)">
                    No messages yet. Say hello!
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-(--color-border) p-3">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Message…"
                className="flex-1 rounded-md border border-(--color-border) bg-(--color-canvas) px-3 py-1.5 text-sm outline-none"
              />
              <button
                type="submit"
                disabled={!draft.trim()}
                className="flex items-center justify-center rounded-md bg-(--color-accent) p-2 text-white disabled:opacity-40"
              >
                <SentIcon size={15} strokeWidth={1.8} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-(--color-text-muted)">
            Select or start a conversation.
          </div>
        )}
      </div>
    </div>
  );
}
