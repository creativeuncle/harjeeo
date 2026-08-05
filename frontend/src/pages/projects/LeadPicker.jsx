import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { CheckmarkCircle02Icon, UserAdd01Icon } from "hugeicons-react";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { listMembers } from "@/lib/workspaces";
import Avatar from "@/components/ui/Avatar";
import AvatarStack from "@/components/ui/AvatarStack";

export default function LeadPicker({ value, onChange }) {
  const navigate = useNavigate();
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentId);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [members, setMembers] = useState(null);
  const [position, setPosition] = useState(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!open || !currentWorkspaceId || members) return;
    listMembers(currentWorkspaceId).then((data) =>
      setMembers(data.members.map((m) => m.user).filter(Boolean))
    );
  }, [open, currentWorkspaceId, members]);

  const people = members ?? [];
  const filtered = people.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
  const selectedIds = new Set(value.map((p) => p._id));

  function handleOpen() {
    const rect = triggerRef.current.getBoundingClientRect();
    setPosition({ top: rect.bottom + 4, left: rect.left });
    setOpen(true);
  }

  function toggle(person) {
    if (selectedIds.has(person._id)) {
      onChange(value.filter((p) => p._id !== person._id));
    } else {
      onChange([...value, person]);
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className="flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10"
      >
        {value.length > 0 ? (
          <AvatarStack people={value} size={22} />
        ) : (
          <span className="text-sm text-(--color-text-muted)">Empty</span>
        )}
      </button>

      {open &&
        position &&
        createPortal(
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div
              style={{ top: position.top, left: position.left }}
              className="fixed z-50 w-64 rounded-lg border border-(--color-border) bg-(--color-canvas) p-2 shadow-lg"
            >
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for people…"
                className="mb-2 w-full rounded-md border border-(--color-border) bg-transparent px-2 py-1.5 text-sm outline-none focus:border-(--color-accent)"
              />

              <div className="mb-1 px-1 text-xs font-medium text-(--color-text-muted)">
                People
              </div>
              <div className="flex max-h-56 flex-col gap-0.5 overflow-y-auto">
                {filtered.length === 0 && (
                  <div className="px-2 py-1.5 text-sm text-(--color-text-muted)">
                    No matches
                  </div>
                )}
                {filtered.map((person) => {
                  const checked = selectedIds.has(person._id);
                  return (
                    <button
                      key={person._id}
                      type="button"
                      onClick={() => toggle(person)}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      <Avatar name={person.name} size={22} />
                      <span className="min-w-0 flex-1 truncate">{person.name}</span>
                      {checked && (
                        <CheckmarkCircle02Icon
                          size={15}
                          strokeWidth={1.8}
                          className="shrink-0 text-(--color-accent)"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-1 border-t border-(--color-border) pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    if (currentWorkspaceId) {
                      navigate(`/workspace/${currentWorkspaceId}/settings`);
                    } else {
                      window.alert("Create a workspace first to invite teammates.");
                    }
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <UserAdd01Icon size={15} strokeWidth={1.8} />
                  Invite people
                </button>
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
}
