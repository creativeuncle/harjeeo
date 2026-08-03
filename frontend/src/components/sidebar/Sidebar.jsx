import { NavLink, useNavigate } from "react-router-dom";
import {
  Task01Icon,
  Target02Icon,
  Home01Icon,
  Calendar03Icon,
  BookOpen01Icon,
  Add01Icon,
  Logout01Icon,
} from "hugeicons-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const teamspaceLinks = [
  { to: "/projects", label: "Projects", icon: Target02Icon },
  { to: "/tasks", label: "Tasks", icon: Task01Icon },
  { to: "/meetings", label: "Meetings", icon: Calendar03Icon },
  { to: "/docs", label: "Docs", icon: BookOpen01Icon },
];

function SidebarLink({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
          isActive
            ? "bg-black/5 text-(--color-text) font-medium dark:bg-white/10"
            : "text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
        }`
      }
    >
      <Icon size={18} strokeWidth={1.8} />
      <span>{label}</span>
    </NavLink>
  );
}

export default function Sidebar() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
    } finally {
      clearSession();
      navigate("/login", { replace: true });
    }
  }

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-(--color-border) bg-(--color-sidebar) px-3 py-3">
      <div className="flex items-center gap-2 px-2 py-1.5 text-sm font-semibold">
        Harjeeo
      </div>

      <nav className="mt-2 flex flex-col gap-0.5">
        <SidebarLink to="/" label="Home" icon={Home01Icon} />
      </nav>

      <div className="mt-4 px-2 text-xs font-medium text-(--color-text-muted)">
        Teamspaces
      </div>
      <nav className="mt-1 flex flex-col gap-0.5">
        {teamspaceLinks.map((link) => (
          <SidebarLink key={link.to} {...link} />
        ))}
      </nav>

      <button
        type="button"
        className="mt-auto flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
      >
        <Add01Icon size={18} strokeWidth={1.8} />
        <span>New</span>
      </button>

      <div className="mt-2 flex items-center justify-between gap-2 border-t border-(--color-border) px-2 pt-2">
        <span className="truncate text-sm">{user?.name}</span>
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
