import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowDown01Icon, Add01Icon, Settings02Icon } from "hugeicons-react";
import { listWorkspaces, createWorkspace } from "@/lib/workspaces";
import { useWorkspaceStore } from "@/store/workspaceStore";

export default function WorkspaceSwitcher() {
  const navigate = useNavigate();
  const { workspaces, currentId, setWorkspaces, setCurrentId, addWorkspace } =
    useWorkspaceStore();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    listWorkspaces().then(setWorkspaces);
  }, [setWorkspaces]);

  const current = workspaces.find((w) => w._id === currentId);

  async function handleCreate() {
    const name = window.prompt("Workspace name");
    if (!name) return;
    setCreating(true);
    try {
      const { workspace, role } = await createWorkspace({ name });
      addWorkspace({ ...workspace, role });
      setOpen(false);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/10"
      >
        <span className="text-base">{current?.icon ?? "🏢"}</span>
        <span className="min-w-0 flex-1 truncate text-left">
          {current?.name ?? "Harjeeo"}
        </span>
        <ArrowDown01Icon size={14} strokeWidth={2} className="shrink-0 text-(--color-text-muted)" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 w-56 rounded-lg border border-(--color-border) bg-(--color-canvas) p-1 shadow-lg">
            {workspaces.map((w) => (
              <button
                key={w._id}
                type="button"
                onClick={() => {
                  setCurrentId(w._id);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10 ${
                  w._id === currentId ? "bg-black/5 dark:bg-white/10" : ""
                }`}
              >
                <span>{w.icon}</span>
                <span className="min-w-0 flex-1 truncate">{w.name}</span>
              </button>
            ))}

            {workspaces.length === 0 && (
              <div className="px-2 py-2 text-sm text-(--color-text-muted)">
                No workspaces yet
              </div>
            )}

            <div className="my-1 border-t border-(--color-border)" />

            {current && (
              <button
                type="button"
                onClick={() => {
                  navigate(`/workspace/${current._id}/settings`);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
              >
                <Settings02Icon size={15} strokeWidth={1.8} />
                Workspace settings
              </button>
            )}

            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-black/5 disabled:opacity-60 dark:hover:bg-white/10"
            >
              <Add01Icon size={15} strokeWidth={1.8} />
              {creating ? "Creating…" : "Create workspace"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
