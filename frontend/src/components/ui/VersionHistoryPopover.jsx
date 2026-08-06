import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Clock01Icon } from "hugeicons-react";
import { listVersions, restoreVersion } from "@/lib/versions";

function formatTimestamp(iso) {
  return new Date(iso).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function VersionHistoryPopover({ targetType, targetId, onRestore }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const [versions, setVersions] = useState(null);
  const [restoringId, setRestoringId] = useState(null);
  const triggerRef = useRef(null);

  async function handleOpen() {
    const rect = triggerRef.current.getBoundingClientRect();
    setPosition({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    setOpen(true);
    const list = await listVersions(targetType, targetId);
    setVersions(list);
  }

  async function handleRestore(versionId) {
    if (!window.confirm("Restore this version? Your current content will be saved as a version too.")) return;
    setRestoringId(versionId);
    try {
      const target = await restoreVersion(versionId);
      onRestore(target);
      setOpen(false);
    } finally {
      setRestoringId(null);
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        title="Version history"
        className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
      >
        <Clock01Icon size={15} strokeWidth={1.8} />
        History
      </button>

      {open &&
        position &&
        createPortal(
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div
              style={{ top: position.top, right: position.right }}
              className="fixed z-50 w-72 rounded-lg border border-(--color-border) bg-(--color-canvas) p-2 shadow-lg"
            >
              <div className="mb-1 px-1 text-sm font-medium">Version history</div>
              <div className="thin-scrollbar flex max-h-72 flex-col gap-0.5 overflow-y-auto">
                {versions === null && (
                  <div className="px-2 py-4 text-center text-xs text-(--color-text-muted)">Loading…</div>
                )}
                {versions?.length === 0 && (
                  <div className="px-2 py-4 text-center text-xs text-(--color-text-muted)">
                    No earlier versions yet. They're saved automatically as you edit.
                  </div>
                )}
                {versions?.map((v) => (
                  <div
                    key={v._id}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium">{formatTimestamp(v.createdAt)}</div>
                      <div className="text-xs text-(--color-text-muted)">
                        {v.savedBy?.name ?? "Auto-saved"}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={restoringId === v._id}
                      onClick={() => handleRestore(v._id)}
                      className="shrink-0 rounded-md border border-(--color-border) px-2 py-1 text-xs hover:bg-black/5 disabled:opacity-50 dark:hover:bg-white/10"
                    >
                      {restoringId === v._id ? "Restoring…" : "Restore"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
}
