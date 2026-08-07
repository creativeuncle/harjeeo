import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Task01Icon,
  Target02Icon,
  Home01Icon,
  BubbleChatIcon,
  Calendar03Icon,
  BookOpen01Icon,
  Note01Icon,
  Add01Icon,
  HashtagIcon,
  Logout01Icon,
  Delete02Icon,
  DashboardSquare01Icon,
} from "hugeicons-react";
import { api } from "@/lib/api";
import { disconnectSocket } from "@/lib/socket";
import { createNote } from "@/lib/notes";
import { listChannels, createChannel, getOrCreateDM } from "@/lib/chat";
import { listMembers } from "@/lib/workspaces";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useChatStore } from "@/store/chatStore";
import { usePresence } from "@/store/presenceStore";
import Avatar from "@/components/ui/Avatar";
import WorkspaceSwitcher from "./WorkspaceSwitcher";
import StatusPicker from "./StatusPicker";

function PresentAvatar({ user, size = 18 }) {
  const presence = usePresence(user._id, {
    online: user.online,
    manualStatus: user.manualStatus,
    statusMessage: user.statusMessage,
  });
  return <Avatar name={user.name} size={size} online={presence.online} manualStatus={presence.manualStatus} />;
}

function channelLabel(channel, currentUserId) {
  if (!channel.isDM) return channel.name || "Untitled channel";
  const other = channel.members.find((m) => m._id !== currentUserId);
  return other?.name ?? "Direct message";
}

const teamspaceLinks = [
  { to: "/dashboard", label: "Dashboard", icon: DashboardSquare01Icon },
  { to: "/projects", label: "Projects", icon: Target02Icon },
  { to: "/tasks", label: "Tasks", icon: Task01Icon },
  { to: "/meetings", label: "Meetings", icon: Calendar03Icon },
  { to: "/docs", label: "Docs", icon: BookOpen01Icon },
];

function SidebarLink({ to, label, icon: Icon, end = false, pill = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-2 text-sm transition-colors ${
          pill ? "rounded-full px-3 py-1.5" : "rounded-md px-2 py-1.5"
        } ${
          isActive
            ? "bg-black/5 text-(--color-text) font-medium dark:bg-white/10"
            : "text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={18} strokeWidth={1.8} />
          {(!pill || isActive) && <span>{label}</span>}
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isChatActive = location.pathname.startsWith("/chat");
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);
  const workspaceId = useWorkspaceStore((s) => s.currentId);
  const [creatingNote, setCreatingNote] = useState(false);
  const [showNewChannel, setShowNewChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");

  const channels = useChatStore((s) => s.channels);
  const setChannels = useChatStore((s) => s.setChannels);
  const addChannel = useChatStore((s) => s.addChannel);
  const chatMembers = useChatStore((s) => s.members);
  const setChatMembers = useChatStore((s) => s.setMembers);
  const activeChannelId = useChatStore((s) => s.activeChannelId);
  const setActiveChannelId = useChatStore((s) => s.setActiveChannelId);

  useEffect(() => {
    if (!workspaceId) return;
    listChannels(workspaceId).then((list) => {
      setChannels(list);
      setActiveChannelId((prev) => prev ?? list[0]?._id ?? null);
    });
    listMembers(workspaceId).then((data) =>
      setChatMembers(data.members.map((m) => m.user).filter((u) => u && u._id !== user?._id))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, user?._id]);

  function dmChannelFor(userId) {
    return channels.find((c) => c.isDM && c.members.some((m) => m._id === userId));
  }

  async function handleStartDM(userId) {
    const channel = await getOrCreateDM(workspaceId, userId);
    addChannel(channel);
    setActiveChannelId(channel._id);
  }

  async function handleCreateChannel(e) {
    e.preventDefault();
    if (!newChannelName.trim()) return;
    const channel = await createChannel(workspaceId, {
      name: newChannelName.trim(),
      memberIds: chatMembers.map((m) => m._id),
    });
    addChannel(channel);
    setActiveChannelId(channel._id);
    setNewChannelName("");
    setShowNewChannel(false);
  }

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
    } finally {
      disconnectSocket();
      clearSession();
      navigate("/login", { replace: true });
    }
  }

  async function handleNewNote() {
    if (creatingNote || !workspaceId) return;
    setCreatingNote(true);
    try {
      const note = await createNote(workspaceId);
      navigate(`/notes/${note._id}`);
    } finally {
      setCreatingNote(false);
    }
  }

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-(--color-border) bg-(--color-sidebar) px-3 py-3">
      <WorkspaceSwitcher />

      <nav className="mt-2 flex items-center gap-1">
        <SidebarLink to="/" end label="Home" icon={Home01Icon} pill />
        <SidebarLink to="/chat" label="Chat" icon={BubbleChatIcon} pill />
      </nav>

      {!isChatActive && (
        <>
          <div className="mt-4 px-2 text-xs font-medium text-(--color-text-muted)">
            Private
          </div>
          <nav className="mt-1 flex flex-col gap-0.5">
            <SidebarLink to="/notes" label="Notes" icon={Note01Icon} />
            <button
              type="button"
              onClick={handleNewNote}
              disabled={creatingNote}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-(--color-text-muted) hover:bg-black/5 disabled:opacity-60 dark:hover:bg-white/10"
            >
              <Add01Icon size={18} strokeWidth={1.8} />
              <span>{creatingNote ? "Creating…" : "Add new"}</span>
            </button>
          </nav>

          <div className="mt-4 px-2 text-xs font-medium text-(--color-text-muted)">
            Teamspaces
          </div>
          <nav className="mt-1 flex flex-col gap-0.5">
            {teamspaceLinks.map((link) => (
              <SidebarLink key={link.to} {...link} />
            ))}
          </nav>

          <nav className="mt-4 flex flex-col gap-0.5">
            <SidebarLink to="/trash" label="Trash" icon={Delete02Icon} />
          </nav>
        </>
      )}

      {isChatActive && (
        <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-y-auto">
          {channels.filter((c) => !c.isDM).length > 0 && (
            <>
              <div className="px-2 text-xs font-medium text-(--color-text-muted)">Channels</div>
              <nav className="mt-1 mb-3 flex flex-col gap-0.5">
                {channels
                  .filter((c) => !c.isDM)
                  .map((c) => (
                    <button
                      key={c._id}
                      type="button"
                      onClick={() => setActiveChannelId(c._id)}
                      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                        c._id === activeChannelId
                          ? "bg-black/5 font-medium text-(--color-text) dark:bg-white/10"
                          : "text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
                      }`}
                    >
                      <HashtagIcon size={18} strokeWidth={1.8} />
                      <span className="truncate">{channelLabel(c, user?._id)}</span>
                    </button>
                  ))}
              </nav>
            </>
          )}

          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-medium text-(--color-text-muted)">Members</span>
            <button
              type="button"
              onClick={() => setShowNewChannel((v) => !v)}
              title="New channel"
              className="rounded-md p-1 text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
            >
              <Add01Icon size={14} strokeWidth={1.8} />
            </button>
          </div>

          {showNewChannel && (
            <form onSubmit={handleCreateChannel} className="mt-1 px-2">
              <input
                autoFocus
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="New channel name…"
                className="w-full rounded-md border border-(--color-border) bg-(--color-canvas) px-2 py-1 text-sm outline-none"
              />
            </form>
          )}

          <nav className="mt-1 flex flex-col gap-0.5">
            {chatMembers.map((m) => {
              const dm = dmChannelFor(m._id);
              const isActive = dm && dm._id === activeChannelId;
              return (
                <button
                  key={m._id}
                  type="button"
                  onClick={() => handleStartDM(m._id)}
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                    isActive
                      ? "bg-black/5 font-medium text-(--color-text) dark:bg-white/10"
                      : "text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
                  }`}
                >
                  <PresentAvatar user={m} size={18} />
                  <span className="min-w-0 flex-1 truncate">{m.name}</span>
                </button>
              );
            })}
            {chatMembers.length === 0 && (
              <div className="px-2 py-2 text-xs text-(--color-text-muted)">No other members yet.</div>
            )}
          </nav>
        </div>
      )}

      <button
        type="button"
        className="mt-auto flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
      >
        <Add01Icon size={18} strokeWidth={1.8} />
        <span>New</span>
      </button>

      <div className="mt-2 flex items-center justify-between gap-2 border-t border-(--color-border) px-2 pt-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md py-1 text-sm">
          <StatusPicker
            trigger={
              user?.avatarUrl ? (
                <span className="relative inline-flex h-5 w-5 shrink-0">
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-5 w-5 shrink-0 rounded-full object-cover"
                  />
                </span>
              ) : (
                <Avatar name={user?.name} online manualStatus={user?.manualStatus} />
              )
            }
          />
          <NavLink to="/profile" className="min-w-0 flex-1 truncate hover:underline">
            {user?.name}
          </NavLink>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          title="Log out"
          className="rounded-md p-1.5 text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
        >
          <Logout01Icon size={16} strokeWidth={1.8} />
        </button>
      </div>
    </aside>
  );
}
