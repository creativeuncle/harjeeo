import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Tick01Icon } from "hugeicons-react";
import { updatePresence, MANUAL_STATUS_META } from "@/lib/presence";
import { useAuthStore } from "@/store/authStore";
import { usePresenceStore } from "@/store/presenceStore";

export default function StatusPicker({ trigger }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const [message, setMessage] = useState("");
  const triggerRef = useRef(null);
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const setStatus = usePresenceStore((s) => s.setStatus);

  function handleOpen() {
    const rect = triggerRef.current.getBoundingClientRect();
    setPosition({ bottom: window.innerHeight - rect.top + 8, left: rect.left });
    setMessage(user?.statusMessage ?? "");
    setOpen(true);
  }

  async function applyStatus(manualStatus, statusMessage = "") {
    const updated = await updatePresence({ manualStatus, statusMessage });
    updateUser(updated);
    if (user?._id) setStatus(String(user._id), updated.manualStatus, updated.statusMessage);
    setOpen(false);
  }

  return (
    <>
      <button ref={triggerRef} type="button" onClick={handleOpen} title="Set status">
        {trigger}
      </button>

      {open &&
        position &&
        createPortal(
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div
              style={{ bottom: position.bottom, left: position.left }}
              className="fixed z-50 w-60 rounded-lg border border-(--color-border) bg-(--color-canvas) p-1.5 shadow-lg"
            >
              <button
                type="button"
                onClick={() => applyStatus(null, "")}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Online
                {!user?.manualStatus && <Tick01Icon size={14} strokeWidth={1.8} className="ml-auto" />}
              </button>
              {Object.entries(MANUAL_STATUS_META).map(([key, meta]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => applyStatus(key, message)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                  {meta.label}
                  {user?.manualStatus === key && (
                    <Tick01Icon size={14} strokeWidth={1.8} className="ml-auto" />
                  )}
                </button>
              ))}
              <div className="mt-1 border-t border-(--color-border) pt-1.5">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") applyStatus(user?.manualStatus ?? "away", message);
                  }}
                  placeholder="Custom status message…"
                  className="w-full rounded-md border border-(--color-border) bg-(--color-canvas) px-2 py-1.5 text-xs outline-none"
                />
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
}
