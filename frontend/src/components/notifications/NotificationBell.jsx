import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Notification03Icon, BubbleChatIcon, ArrowMoveUpRightIcon, UserIcon } from "hugeicons-react";
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/notifications";
import {
  isPushSupported,
  getExistingSubscription,
  subscribeToPush,
  markPushPromptSeen,
} from "@/lib/push";
import Avatar from "@/components/ui/Avatar";

const TYPE_ICON = {
  comment: BubbleChatIcon,
  task_moved: ArrowMoveUpRightIcon,
  lead_assigned: UserIcon,
};

function formatTimestamp(iso) {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}d ago`;
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [pushEnabled, setPushEnabled] = useState(null);
  const [position, setPosition] = useState(null);
  const triggerRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    listNotifications().then(setNotifications).catch(() => {});

    if (!isPushSupported()) {
      setPushEnabled(false);
      return;
    }
    getExistingSubscription()
      .then((sub) => setPushEnabled(Boolean(sub)))
      .catch(() => setPushEnabled(false));
  }, []);

  function handleOpen() {
    const rect = triggerRef.current.getBoundingClientRect();
    setPosition({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    setOpen(true);
  }

  async function handleEnablePush() {
    try {
      await subscribeToPush();
      setPushEnabled(true);
    } catch {
      setPushEnabled(false);
    } finally {
      markPushPromptSeen();
    }
  }

  async function handleNotificationClick(notification) {
    setOpen(false);
    if (!notification.read) {
      setNotifications((prev) =>
        prev.map((n) => (n._id === notification._id ? { ...n, read: true } : n))
      );
      markNotificationRead(notification._id).catch(() => {});
    }
    if (notification.link) navigate(notification.link);
  }

  async function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    markAllNotificationsRead().catch(() => {});
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        title="Notifications"
        className="relative rounded-md p-1.5 text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
      >
        <Notification03Icon size={18} strokeWidth={1.8} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-red-500" />
        )}
      </button>

      {open &&
        position &&
        createPortal(
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div
              style={{ top: position.top, right: position.right }}
              className="fixed z-50 flex max-h-[70vh] w-80 flex-col rounded-lg border border-(--color-border) bg-(--color-canvas) shadow-lg"
            >
              <div className="flex items-center justify-between border-b border-(--color-border) px-3 py-2.5">
                <span className="text-sm font-medium">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-xs text-(--color-text-muted) hover:text-(--color-text)"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {pushEnabled === false && (
                <button
                  type="button"
                  onClick={handleEnablePush}
                  className="border-b border-(--color-border) px-3 py-2 text-left text-xs text-(--color-accent) hover:bg-black/5 dark:hover:bg-white/10"
                >
                  Enable push notifications
                </button>
              )}

              <div className="flex-1 overflow-y-auto">
                {notifications.length === 0 && (
                  <div className="px-3 py-6 text-center text-sm text-(--color-text-muted)">
                    No notifications yet
                  </div>
                )}
                {notifications.map((notification) => {
                  const Icon = TYPE_ICON[notification.type] ?? Notification03Icon;
                  return (
                    <button
                      key={notification._id}
                      type="button"
                      onClick={() => handleNotificationClick(notification)}
                      className={`flex w-full items-start gap-2.5 px-3 py-2.5 text-left hover:bg-black/5 dark:hover:bg-white/10 ${
                        notification.read ? "" : "bg-(--color-accent)/5"
                      }`}
                    >
                      {notification.actor ? (
                        <Avatar name={notification.actor.name} size={26} />
                      ) : (
                        <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-black/5 dark:bg-white/10">
                          <Icon size={14} strokeWidth={1.8} />
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-sm">{notification.title}</div>
                        {notification.body && (
                          <div className="truncate text-xs text-(--color-text-muted)">
                            {notification.body}
                          </div>
                        )}
                        <div className="mt-0.5 text-xs text-(--color-text-muted)">
                          {formatTimestamp(notification.createdAt)}
                        </div>
                      </div>
                      {!notification.read && (
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-(--color-accent)" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
}
