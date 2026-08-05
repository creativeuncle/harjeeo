import { useNavigate } from "react-router-dom";
import {
  Add01Icon,
  PencilEdit02Icon,
  Delete02Icon,
  ArrowMoveUpRightIcon,
  BubbleChatIcon,
} from "hugeicons-react";
import Avatar from "@/components/ui/Avatar";

const ACTION_ICON = {
  created: Add01Icon,
  updated: PencilEdit02Icon,
  deleted: Delete02Icon,
  moved: ArrowMoveUpRightIcon,
  commented: BubbleChatIcon,
};

const ACTION_VERB = {
  created: "created",
  updated: "updated",
  deleted: "deleted",
  moved: "moved",
  commented: "commented on",
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
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function ActivityFeed({ activity }) {
  const navigate = useNavigate();

  if (activity.length === 0) {
    return <p className="text-sm text-(--color-text-muted)">No activity yet.</p>;
  }

  return (
    <div className="flex flex-col gap-0.5">
      {activity.map((item) => {
        const Icon = ACTION_ICON[item.action] ?? PencilEdit02Icon;
        const clickable = Boolean(item.link) && item.action !== "deleted";
        return (
          <button
            key={item._id}
            type="button"
            disabled={!clickable}
            onClick={() => clickable && navigate(item.link)}
            className={`flex items-start gap-2.5 rounded-md px-2 py-2 text-left text-sm ${
              clickable ? "hover:bg-black/[.02] dark:hover:bg-white/[.03]" : "cursor-default"
            }`}
          >
            {item.actor ? (
              <Avatar name={item.actor.name} size={24} />
            ) : (
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black/5 dark:bg-white/10">
                <Icon size={13} strokeWidth={1.8} />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <span>
                <span className="font-medium">{item.actor?.name ?? "Someone"}</span>{" "}
                <span className="text-(--color-text-muted)">
                  {ACTION_VERB[item.action] ?? item.action} {item.targetType}
                </span>{" "}
                <span className="font-medium">{item.targetLabel || "Untitled"}</span>
              </span>
              {item.detail && (
                <div className="truncate text-xs text-(--color-text-muted)">{item.detail}</div>
              )}
            </div>
            <span className="shrink-0 text-xs text-(--color-text-muted)">
              {formatTimestamp(item.createdAt)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
