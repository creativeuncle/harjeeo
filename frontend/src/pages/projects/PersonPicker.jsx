import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Cancel01Icon, UserAdd01Icon } from "hugeicons-react";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { listMembers } from "@/lib/workspaces";
import Avatar from "@/components/ui/Avatar";

export default function PersonPicker({ value, onChange }) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentId);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [members, setMembers] = useState(null);
  const [position, setPosition] = useState(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!open || !currentWorkspaceId || members) return;
    listMembers(currentWorkspaceId).then((data) =>
      setMembers(data.members.map((m) => m.user?.name).filter(Boolean))
    );
  }, [open, currentWorkspaceId, members]);

  const people = members ?? (user ? [user.name] : []);
  const filtered = people.filter((name) =>
    name.toLowerCase().includes(query.toLowerCase())
  );

  function handleOpen() {
    const rect = triggerRef.current.getBoundingClientRect();
    setPosition({ top: rect.bottom + 4, left: rect.left });
    setOpen(true);
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm hover:bg-black/5 dark:hover:bg-white/10"
      >
        {value ? (
          <span className="flex items-center gap-1.5">
            <Avatar name={value} size={18} />
            {value}
          </span>
        ) : (
          <span className="text-(--color-text-muted)">Empty</span>
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
              {value && (
                <div className="mb-2 flex items-center gap-1.5 rounded-md bg-black/5 px-2 py-1 text-sm dark:bg-white/10">
                  <Avatar name={value} />
                  <span className="flex-1 truncate">{value}</span>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(null);
                      setOpen(false);
                    }}
                    className="text-(--color-text-muted) hover:text-(--color-text)"
                  >
                    <Cancel01Icon size={14} strokeWidth={1.8} />
                  </button>
                </div>
              )}

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
              <div className="flex flex-col gap-0.5">
                {filtered.length === 0 && (
                  <div className="px-2 py-1.5 text-sm text-(--color-text-muted)">
                    No matches
                  </div>
                )}
                {filtered.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      onChange(name);
                      setOpen(false);
                    }}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <Avatar name={name} />
                    {name}
                  </button>
                ))}
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
