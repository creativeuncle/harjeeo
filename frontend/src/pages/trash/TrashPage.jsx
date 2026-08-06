import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Delete02Icon, Refresh01Icon, Target02Icon, DocumentValidationIcon } from "hugeicons-react";
import { listTrash, restoreItem, permanentlyDeleteItem } from "@/lib/trash";
import { useWorkspaceStore } from "@/store/workspaceStore";

const SECTIONS = [
  { type: "projects", label: "Projects", icon: Target02Icon },
  { type: "tasks", label: "Tasks", icon: DocumentValidationIcon },
  { type: "notes", label: "Notes", icon: DocumentValidationIcon },
];

function daysLeft(deletedAt) {
  const purgeAt = new Date(deletedAt).getTime() + 30 * 24 * 60 * 60 * 1000;
  const days = Math.ceil((purgeAt - Date.now()) / (24 * 60 * 60 * 1000));
  return Math.max(days, 0);
}

export default function TrashPage() {
  const navigate = useNavigate();
  const workspaceId = useWorkspaceStore((s) => s.currentId);
  const [trash, setTrash] = useState({ projects: [], tasks: [], notes: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) return;
    setLoading(true);
    listTrash(workspaceId)
      .then(setTrash)
      .finally(() => setLoading(false));
  }, [workspaceId]);

  async function handleRestore(type, id) {
    await restoreItem(type, id);
    setTrash((prev) => ({ ...prev, [type]: prev[type].filter((item) => item._id !== id) }));
  }

  async function handleDeleteForever(type, id) {
    if (!window.confirm("Permanently delete this item? This cannot be undone.")) return;
    await permanentlyDeleteItem(type, id);
    setTrash((prev) => ({ ...prev, [type]: prev[type].filter((item) => item._id !== id) }));
  }

  const isEmpty = !loading && SECTIONS.every((s) => trash[s.type].length === 0);

  return (
    <div className="mx-auto max-w-3xl px-10 py-8">
      <div className="mb-1 flex items-center gap-2 text-2xl font-bold">
        <Delete02Icon size={24} strokeWidth={1.8} />
        Trash
      </div>
      <p className="mb-6 text-sm text-(--color-text-muted)">
        Items are kept for 30 days after deletion, then removed automatically.
      </p>

      {loading && <div className="text-sm text-(--color-text-muted)">Loading…</div>}

      {isEmpty && <div className="text-sm text-(--color-text-muted)">Trash is empty.</div>}

      <div className="flex flex-col gap-6">
        {SECTIONS.map(({ type, label, icon: Icon }) =>
          trash[type].length === 0 ? null : (
            <div key={type}>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-(--color-text-muted)">
                {label}
              </div>
              <div className="flex flex-col gap-1">
                {trash[type].map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <button
                      type="button"
                      onClick={() => navigate(`/${type}/${item._id}`)}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm"
                    >
                      {item.icon ? (
                        <span className="shrink-0 text-base">{item.icon}</span>
                      ) : (
                        <Icon size={18} strokeWidth={1.8} className="shrink-0 text-(--color-text-muted)" />
                      )}
                      <span className="min-w-0 truncate">{item.title || "Untitled"}</span>
                    </button>
                    <span className="shrink-0 text-xs text-(--color-text-muted)">
                      {daysLeft(item.deletedAt)}d left
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRestore(type, item._id)}
                      title="Restore"
                      className="shrink-0 rounded-md p-1.5 text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      <Refresh01Icon size={16} strokeWidth={1.8} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteForever(type, item._id)}
                      title="Delete forever"
                      className="shrink-0 rounded-md p-1.5 text-(--color-text-muted) hover:bg-red-500/10 hover:text-red-500"
                    >
                      <Delete02Icon size={16} strokeWidth={1.8} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
