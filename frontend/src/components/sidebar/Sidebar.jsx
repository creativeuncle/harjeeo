import { useState } from "react";
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
  Logout01Icon,
} from "hugeicons-react";
import { api } from "@/lib/api";
import { disconnectSocket } from "@/lib/socket";
import { createNote } from "@/lib/notes";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import Avatar from "@/components/ui/Avatar";
import WorkspaceSwitcher from "./WorkspaceSwitcher";

const teamspaceLinks = [
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
        </>
      )}

      <button
        type="button"
        className="mt-auto flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
      >
        <Add01Icon size={18} strokeWidth={1.8} />
        <span>New</span>
      </button>

      <div className="mt-2 flex items-center justify-between gap-2 border-t border-(--color-border) px-2 pt-2">
        <NavLink
          to="/profile"
          className="flex min-w-0 flex-1 items-center gap-2 rounded-md py-1 text-sm hover:bg-black/5 dark:hover:bg-white/10"
        >
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-5 w-5 shrink-0 rounded-full object-cover"
            />
          ) : (
            <Avatar name={user?.name} />
          )}
          <span className="truncate">{user?.name}</span>
        </NavLink>
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
