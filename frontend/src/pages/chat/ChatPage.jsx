import { useEffect, useMemo, useRef, useState } from "react";
import { Add01Icon, SentIcon, HashtagIcon, Search01Icon } from "hugeicons-react";
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
  const [query, setQuery] = useState("");
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

  const filteredMembers = useMemo(
    () => members.filter((m) => m.name.toLowerCase().includes(query.toLowerCase())),
    [members, query]
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

  function dmChannelFor(userId) {
    return channels.find((c) => c.isDM && c.members.some((m) => m._id === userId));
  }

  return (
    <div className="flex h-full">
      {/* Left rail — mirrors Notion's "Welcome to Notion" sidebar list, but for people */}
      <div className="flex w-72 shrink-0 flex-col border-r border-(--color-border) bg-black/[.015] p-3 dark:bg-white/[.02]">
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-(--color-border) bg-(--color-canvas) px-2.5 py-1.5">
          <Search01Icon size={14} strokeWidth={1.8} className="text-(--color-text-muted)" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people…"
            className="w-full border-none bg-transparent text-sm outline-none placeholder:text-(--color-text-muted)"
          />
        </div>

        {channels.filter((c) => !c.isDM).length > 0 && (
          <>
            <div className="mb-1 flex items-center justify-between px-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-(--color-text-muted)">
                Channels
              </span>
            </div>
            <div className="mb-3 flex flex-col gap-0.5">
              {channels
                .filter((c) => !c.isDM)
                .map((c) => (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => setActiveChannelId(c._id)}
                    className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
                      c._id === activeChannelId
                        ? "bg-black/[.06] font-medium dark:bg-white/[.08]"
                        : "text-(--color-text-muted) hover:bg-black/[.04] dark:hover:bg-white/[.06]"
                    }`}
                  >
                    <HashtagIcon size={14} strokeWidth={1.8} />
                    <span className="truncate">{channelLabel(c, currentUser?._id)}</span>
                  </button>
                ))}
            </div>
          </>
        )}

        <div className="mb-1 flex items-center justify-between px-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-(--color-text-muted)">
            Members
          </span>
          <button
            type="button"
            onClick={() => setShowNewChannel((v) => !v)}
            title="New channel"
            className="rounded-md p-1 text-(--color-text-muted) hover:bg-black/[.06] dark:hover:bg-white/[.08]"
          >
            <Add01Icon size={14} strokeWidth={1.8} />
          </button>
        </div>

        {showNewChannel && (
          <form onSubmit={handleCreateChannel} className="mb-2 px-1">
            <input
              autoFocus
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              placeholder="New channel name…"
              className="w-full rounded-md border border-(--color-border) bg-(--color-canvas) px-2 py-1 text-sm outline-none"
            />
          </form>
        )}

        <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
          {filteredMembers.map((m) => {
            const dm = dmChannelFor(m._id);
            const isActive = dm && dm._id === activeChannelId;
            return (
              <button
                key={m._id}
                type="button"
                onClick={() => handleStartDM(m._id)}
                className={`flex items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm transition-colors ${
                  isActive
                    ? "bg-black/[.06] font-medium dark:bg-white/[.08]"
                    : "text-(--color-text-muted) hover:bg-black/[.04] dark:hover:bg-white/[.06]"
                }`}
              >
                <Avatar name={m.name} size={26} />
                <span className="min-w-0 flex-1 truncate">{m.name}</span>
              </button>
            );
          })}
          {filteredMembers.length === 0 && (
            <div className="px-2 py-4 text-center text-xs text-(--color-text-muted)">No members found.</div>
          )}
        </div>
      </div>

      {/* Chat surface — centered thread + pill composer, Notion-AI style */}
      <div className="flex min-w-0 flex-1 flex-col">
        {activeChannel ? (
          <>
            <div className="flex items-center gap-2 border-b border-(--color-border) px-6 py-3.5">
              {activeChannel.isDM ? (
                <Avatar
                  name={channelLabel(activeChannel, currentUser?._id)}
                  size={22}
                />
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
            Select a person to start a conversation.
          </div>
        )}
      </div>
    </div>
  );
}
