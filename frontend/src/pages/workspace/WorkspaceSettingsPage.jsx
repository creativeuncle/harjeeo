import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Delete02Icon, Mail01Icon } from "hugeicons-react";
import {
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  listWorkspaces,
  listMembers,
  inviteMember,
  revokeInvite,
  updateMemberRole,
  removeMember,
  ROLE_LABELS,
  ASSIGNABLE_ROLES,
} from "@/lib/workspaces";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import IconPicker from "@/components/ui/IconPicker";
import Avatar from "@/components/ui/Avatar";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function WorkspaceSettingsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const { setWorkspaces } = useWorkspaceStore();

  const [workspace, setWorkspace] = useState(null);
  const [role, setRole] = useState(null);
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState("");
  const saveTimeout = useRef(null);

  const load = useCallback(async () => {
    const [ws, mem] = await Promise.all([getWorkspace(id), listMembers(id)]);
    setWorkspace(ws.workspace);
    setRole(ws.role);
    setMembers(mem.members);
    setInvites(mem.invites);
  }, [id]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const canManage = role === "owner" || role === "admin";

  function patchField(field, value) {
    setWorkspace((prev) => ({ ...prev, [field]: value }));
    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      await updateWorkspace(id, { [field]: value });
      setWorkspaces(await listWorkspaces());
    }, 500);
  }

  async function handleInvite(e) {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviting(true);
    setError("");
    try {
      const invite = await inviteMember(id, { email: inviteEmail, role: inviteRole });
      setInvites((prev) => [...prev, invite]);
      setInviteEmail("");
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to send invite");
    } finally {
      setInviting(false);
    }
  }

  async function handleRevoke(inviteId) {
    await revokeInvite(id, inviteId);
    setInvites((prev) => prev.filter((i) => i._id !== inviteId));
  }

  async function handleRoleChange(memberId, newRole) {
    const updated = await updateMemberRole(id, memberId, newRole);
    setMembers((prev) => prev.map((m) => (m._id === memberId ? updated : m)));
  }

  async function handleRemove(memberId) {
    if (!window.confirm("Remove this member from the workspace?")) return;
    await removeMember(id, memberId);
    setMembers((prev) => prev.filter((m) => m._id !== memberId));
  }

  async function handleDeleteWorkspace() {
    if (!window.confirm(`Delete "${workspace.name}"? This can't be undone.`)) return;
    await deleteWorkspace(id);
    setWorkspaces(await listWorkspaces());
    navigate("/", { replace: true });
  }

  if (loading || !workspace) {
    return <div className="px-10 py-8 text-sm text-(--color-text-muted)">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-10 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Workspace settings</h1>

      <div className="flex items-center gap-3">
        <IconPicker
          trigger={
            <span className="flex h-14 w-14 items-center justify-center rounded-lg text-4xl hover:bg-black/5 dark:hover:bg-white/10">
              {workspace.icon}
            </span>
          }
          onSelect={(emoji) => canManage && patchField("icon", emoji)}
        />
        <input
          value={workspace.name}
          disabled={!canManage}
          onChange={(e) => patchField("name", e.target.value)}
          className="flex-1 rounded-md border border-(--color-border) bg-(--color-canvas) px-3 py-2 text-lg font-semibold outline-none disabled:opacity-60"
        />
      </div>

      <h2 className="mt-8 mb-2 text-sm font-medium text-(--color-text-muted)">Appearance</h2>
      <ThemeToggle />

      <h2 className="mt-8 mb-2 text-sm font-medium text-(--color-text-muted)">Members</h2>
      <div className="flex flex-col gap-1">
        {members.map((m) => (
          <div
            key={m._id}
            className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-black/[.02] dark:hover:bg-white/[.03]"
          >
            <Avatar name={m.user?.name ?? m.user?.email} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{m.user?.name}</div>
              <div className="truncate text-xs text-(--color-text-muted)">{m.user?.email}</div>
            </div>
            {m.role === "owner" || !canManage ? (
              <span className="text-sm text-(--color-text-muted)">{ROLE_LABELS[m.role]}</span>
            ) : (
              <select
                value={m.role}
                onChange={(e) => handleRoleChange(m._id, e.target.value)}
                className="rounded-md border border-(--color-border) bg-(--color-canvas) px-2 py-1 text-sm outline-none"
              >
                {ASSIGNABLE_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            )}
            {canManage && m.role !== "owner" && m.user?._id !== currentUser?.id && (
              <button
                type="button"
                onClick={() => handleRemove(m._id)}
                className="rounded p-1 text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
              >
                <Delete02Icon size={14} strokeWidth={1.8} />
              </button>
            )}
          </div>
        ))}
      </div>

      {invites.length > 0 && (
        <>
          <h2 className="mt-6 mb-2 text-sm font-medium text-(--color-text-muted)">
            Pending invites
          </h2>
          <div className="flex flex-col gap-1">
            {invites.map((inv) => (
              <div
                key={inv._id}
                className="flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-black/[.02] dark:hover:bg-white/[.03]"
              >
                <Mail01Icon size={16} strokeWidth={1.8} className="text-(--color-text-muted)" />
                <span className="min-w-0 flex-1 truncate">{inv.email}</span>
                <span className="text-(--color-text-muted)">{ROLE_LABELS[inv.role]}</span>
                {canManage && (
                  <button
                    type="button"
                    onClick={() => handleRevoke(inv._id)}
                    className="rounded p-1 text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <Delete02Icon size={14} strokeWidth={1.8} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {canManage && (
        <form onSubmit={handleInvite} className="mt-6 flex items-center gap-2">
          <input
            type="email"
            required
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Email address"
            className="flex-1 rounded-md border border-(--color-border) bg-(--color-canvas) px-3 py-2 text-sm outline-none focus:border-(--color-accent)"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="rounded-md border border-(--color-border) bg-(--color-canvas) px-2 py-2 text-sm outline-none"
          >
            {ASSIGNABLE_ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={inviting}
            className="rounded-md bg-(--color-accent) px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {inviting ? "Inviting…" : "Invite"}
          </button>
        </form>
      )}
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      {role === "owner" && (
        <div className="mt-10 border-t border-(--color-border) pt-6">
          <button
            type="button"
            onClick={handleDeleteWorkspace}
            className="text-sm text-red-500 hover:underline"
          >
            Delete this workspace
          </button>
        </div>
      )}
    </div>
  );
}
