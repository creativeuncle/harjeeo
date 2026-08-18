import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  ShieldUserIcon,
  Home01Icon,
  UserMultiple02Icon,
  Building06Icon,
  Analytics01Icon,
  CreditCardIcon,
  Settings02Icon,
  Logout01Icon,
} from "hugeicons-react";
import { api } from "@/lib/api";
import { disconnectSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/authStore";

const navLinks = [
  { to: "/admin", label: "Dashboard", icon: Home01Icon, end: true },
  { to: "/admin/users", label: "Users", icon: UserMultiple02Icon },
  { to: "/admin/workspaces", label: "Workspaces", icon: Building06Icon },
  { to: "/admin/analytics", label: "Analytics", icon: Analytics01Icon },
];

function AdminLink({ to, label, icon: Icon, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
          isActive
            ? "bg-black/5 font-medium text-(--color-text) dark:bg-white/10"
            : "text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
        }`
      }
    >
      <Icon size={18} strokeWidth={1.8} />
      <span>{label}</span>
    </NavLink>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const clearSession = useAuthStore((s) => s.clearSession);

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
    } finally {
      disconnectSocket();
      clearSession();
      navigate("/login", { replace: true });
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-(--color-canvas) text-(--color-text)">
      <aside className="flex h-full w-60 shrink-0 flex-col border-r border-(--color-border) bg-(--color-sidebar) px-3 py-3">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-(--color-accent)/10 text-(--color-accent)">
            <ShieldUserIcon size={16} strokeWidth={1.8} />
          </span>
          <span className="text-sm font-semibold">Super Admin</span>
        </div>

        <nav className="mt-4 flex flex-col gap-0.5">
          {navLinks.map((link) => (
            <AdminLink key={link.to} {...link} />
          ))}
          <div
            title="Coming soon"
            className="flex cursor-not-allowed items-center justify-between rounded-md px-2 py-1.5 text-sm text-(--color-text-muted) opacity-60"
          >
            <span className="flex items-center gap-2">
              <CreditCardIcon size={18} strokeWidth={1.8} />
              Payments
            </span>
            <span className="rounded-full bg-black/5 px-1.5 py-0.5 text-[10px] dark:bg-white/10">
              Soon
            </span>
          </div>
          <AdminLink to="/admin/settings" label="Settings" icon={Settings02Icon} />
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-auto flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
        >
          <Logout01Icon size={16} strokeWidth={1.8} />
          <span>Logout</span>
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
