import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search01Icon, CheckmarkCircle02Icon, ShieldUserIcon, UserSwitchIcon } from "hugeicons-react";
import { listAdminUsers, setUserSuspended, impersonateUser } from "@/lib/admin";
import { useAuthStore } from "@/store/authStore";
import Avatar from "@/components/ui/Avatar";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const currentUserId = useAuthStore((s) => s.user?._id);
  const startImpersonation = useAuthStore((s) => s.startImpersonation);

  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      listAdminUsers({ search })
        .then((data) => {
          setUsers(data.users);
          setTotal(data.total);
        })
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timeout);
  }, [search]);

  async function handleToggleSuspend(user) {
    setBusyId(user._id);
    try {
      const updated = await setUserSuspended(user._id, !user.isSuspended);
      setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
    } catch (err) {
      alert(err.response?.data?.message ?? "Something went wrong");
    } finally {
      setBusyId(null);
    }
  }

  async function handleImpersonate(user) {
    setBusyId(user._id);
    try {
      const { user: targetUser, accessToken } = await impersonateUser(user._id);
      startImpersonation(targetUser, accessToken);
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message ?? "Something went wrong");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="px-10 py-8">
      <h1 className="text-2xl font-semibold">Users</h1>
      <p className="mt-1 text-sm text-(--color-text-muted)">{total} total across the platform.</p>

      <div className="mt-4 flex items-center gap-2 rounded-md border border-(--color-border) px-3 py-2 sm:w-80">
        <Search01Icon size={16} strokeWidth={1.8} className="text-(--color-text-muted)" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-(--color-text-muted)"
        />
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-(--color-border)">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-(--color-border) text-left text-xs text-(--color-text-muted)">
              <th className="px-4 py-2.5 font-medium">User</th>
              <th className="px-4 py-2.5 font-medium">Email</th>
              <th className="px-4 py-2.5 font-medium">Verified</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Joined</th>
              <th className="px-4 py-2.5 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isSelf = u._id === currentUserId;
              const busy = busyId === u._id;
              return (
                <tr key={u._id} className="border-b border-(--color-border) last:border-0">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt={u.name} className="h-6 w-6 rounded-full object-cover" />
                      ) : (
                        <Avatar name={u.name} size={24} />
                      )}
                      <span className="font-medium">{u.name}</span>
                      {u.isSuperAdmin && (
                        <span title="Super admin" className="text-(--color-accent)">
                          <ShieldUserIcon size={14} strokeWidth={1.8} />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-(--color-text-muted)">{u.email}</td>
                  <td className="px-4 py-2.5">
                    {u.isEmailVerified ? (
                      <CheckmarkCircle02Icon size={16} strokeWidth={1.8} className="text-(--color-accent)" />
                    ) : (
                      <span className="text-xs text-(--color-text-muted)">No</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    {u.isSuspended ? (
                      <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-500">
                        Suspended
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-(--color-text-muted)">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-2.5">
                    {isSelf ? (
                      <span className="text-xs text-(--color-text-muted)">You</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleToggleSuspend(u)}
                          className={`rounded-md px-2 py-1 text-xs font-medium disabled:opacity-50 ${
                            u.isSuspended
                              ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400"
                              : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                          }`}
                        >
                          {u.isSuspended ? "Unsuspend" : "Suspend"}
                        </button>
                        <button
                          type="button"
                          disabled={busy || u.isSuspended}
                          title={u.isSuspended ? "Can't impersonate a suspended account" : "Impersonate"}
                          onClick={() => handleImpersonate(u)}
                          className="flex items-center gap-1 rounded-md bg-black/5 px-2 py-1 text-xs font-medium text-(--color-text) hover:bg-black/10 disabled:opacity-50 dark:bg-white/10 dark:hover:bg-white/15"
                        >
                          <UserSwitchIcon size={13} strokeWidth={1.8} />
                          Impersonate
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-(--color-text-muted)">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
