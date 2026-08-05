import { useEffect, useState } from "react";
import { Cancel01Icon, Notification03Icon } from "hugeicons-react";
import { subscribeToPush, shouldShowPushBanner, markPushPromptSeen } from "@/lib/push";

export default function PushPermissionBanner() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setVisible(shouldShowPushBanner());
  }, []);

  async function handleEnable() {
    setLoading(true);
    try {
      await subscribeToPush();
    } catch {
      // Denied, dismissed, or unsupported — nothing more we can do here.
    } finally {
      markPushPromptSeen();
      setLoading(false);
      setVisible(false);
    }
  }

  function handleDismiss() {
    markPushPromptSeen();
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="flex items-center justify-between gap-3 border-b border-(--color-border) bg-(--color-accent)/10 px-4 py-2 text-sm">
      <span className="flex items-center gap-2">
        <Notification03Icon size={16} strokeWidth={1.8} className="shrink-0 text-(--color-accent)" />
        Turn on notifications for comments, task moves, and lead assignments.
      </span>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={handleEnable}
          disabled={loading}
          className="rounded-md bg-(--color-accent) px-3 py-1 text-xs font-medium text-white disabled:opacity-60"
        >
          {loading ? "Enabling…" : "Enable"}
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          title="Dismiss"
          className="rounded-md p-1 text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
        >
          <Cancel01Icon size={14} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}
