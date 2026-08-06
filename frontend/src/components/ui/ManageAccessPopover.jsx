import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Shield01Icon } from "hugeicons-react";
import Avatar from "@/components/ui/Avatar";
import { listMembers } from "@/lib/workspaces";
import { setProjectMemberRole, removeProjectMemberRole } from "@/lib/projects";

export default function ManageAccessPopover({ projectId, workspaceId, memberRoles, onChange }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const [members, setMembers] = useState([]);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!open || !workspaceId) return;
    listMembers(workspaceId).then((data) =>
      setMembers(data.members.map((m) => m.user).filter(Boolean))
    );
  }, [open, workspaceId]);

  function handleOpen() {
    const rect = triggerRef.current.getBoundingClientRect();
    setPosition({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
    setOpen(true);
  }

  function roleFor(userId) {
    return memberRoles?.find((m) => String(m.user?._id ?? m.user) === String(userId))?.role ?? "";
  }

  async function handleChangeRole(userId, role) {
    const project = role
      ? await setProjectMemberRole(projectId, userId, role)
      : await removeProjectMemberRole(projectId, userId);
    onChange(project);
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        title="Manage access"
        className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
      >
        <Shield01Icon size={15} strokeWidth={1.8} />
        Access
      </button>

      {open &&
        position &&
        createPortal(
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div
              style={{ top: position.top, right: position.right }}
              className="fixed z-50 w-80 rounded-lg border border-(--color-border) bg-(--color-canvas) p-3 shadow-lg"
            >
              <div className="mb-2 text-sm font-medium">Project access</div>
              <p className="mb-3 text-xs text-(--color-text-muted)">
                Override this member's access to just this project. Leave as "Workspace role" to
                use their default workspace permissions.
              </p>
              <div className="thin-scrollbar flex max-h-72 flex-col gap-1 overflow-y-auto">
                {members.map((m) => (
                  <div key={m._id} className="flex items-center gap-2 rounded-md px-1 py-1.5">
                    <Avatar name={m.name} size={22} />
                    <span className="min-w-0 flex-1 truncate text-sm">{m.name}</span>
                    <select
                      value={roleFor(m._id)}
                      onChange={(e) => handleChangeRole(m._id, e.target.value)}
                      className="shrink-0 rounded-md border border-(--color-border) bg-(--color-canvas) px-1.5 py-1 text-xs outline-none"
                    >
                      <option value="">Workspace role</option>
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                    </select>
                  </div>
                ))}
                {members.length === 0 && (
                  <div className="py-3 text-center text-xs text-(--color-text-muted)">
                    No other members in this workspace.
                  </div>
                )}
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
}
