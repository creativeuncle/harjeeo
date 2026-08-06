import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardSquare01Icon, Target02Icon, Task01Icon, AlarmClockIcon, CheckmarkCircle02Icon } from "hugeicons-react";
import { getDashboard } from "@/lib/dashboard";
import { STATUS_COLUMNS } from "@/lib/tasks";
import { useWorkspaceStore } from "@/store/workspaceStore";

function StatTile({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-(--color-border) px-4 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-(--color-accent)/10 text-(--color-accent)">
        <Icon size={18} strokeWidth={1.8} />
      </span>
      <div className="min-w-0">
        <div className="text-xl font-semibold tabular-nums">{value}</div>
        <div className="text-xs text-(--color-text-muted)">{label}</div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const workspaceId = useWorkspaceStore((s) => s.currentId);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) return;
    setLoading(true);
    getDashboard(workspaceId)
      .then(setData)
      .finally(() => setLoading(false));
  }, [workspaceId]);

  if (loading || !data) {
    return <div className="px-10 py-8 text-sm text-(--color-text-muted)">Loading…</div>;
  }

  const { totalProjects, totalTasks, overdueCount, taskStatusCounts, projectProgress } = data;
  const completedTasks = taskStatusCounts.done ?? 0;
  const completionPercent = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const maxStatusCount = Math.max(...Object.values(taskStatusCounts), 1);

  return (
    <div className="mx-auto max-w-3xl px-10 py-8">
      <div className="mb-6 flex items-center gap-2">
        <DashboardSquare01Icon size={26} strokeWidth={1.8} />
        <h1 className="text-2xl font-semibold">Dashboard</h1>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Projects" value={totalProjects} icon={Target02Icon} />
        <StatTile label="Tasks" value={totalTasks} icon={Task01Icon} />
        <StatTile label="Overdue" value={overdueCount} icon={AlarmClockIcon} />
        <StatTile label="Completion" value={`${completionPercent}%`} icon={CheckmarkCircle02Icon} />
      </div>

      <div className="mb-8">
        <div className="mb-3 text-sm font-semibold">Tasks by status</div>
        <div className="flex flex-col gap-2">
          {STATUS_COLUMNS.map((col) => {
            const count = taskStatusCounts[col.key] ?? 0;
            const width = Math.round((count / maxStatusCount) * 100);
            return (
              <div key={col.key} className="flex items-center gap-3 text-sm">
                <span className="w-24 shrink-0 text-(--color-text-muted)">{col.label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                  <div
                    className={`h-full rounded-full ${col.dot}`}
                    style={{ width: `${width}%` }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right tabular-nums text-(--color-text-muted)">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-3 text-sm font-semibold">Project progress</div>
        <div className="flex flex-col gap-1">
          {projectProgress.map((p) => (
            <button
              key={p._id}
              type="button"
              onClick={() => navigate(`/projects/${p._id}`)}
              className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-black/[.02] dark:hover:bg-white/[.03]"
            >
              <span className="shrink-0 text-base">{p.icon}</span>
              <span className="w-40 shrink-0 truncate text-sm font-medium">{p.title}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-(--color-accent)"
                  style={{ width: `${p.percent}%` }}
                />
              </div>
              <span className="w-20 shrink-0 text-right text-xs tabular-nums text-(--color-text-muted)">
                {p.doneTasks}/{p.totalTasks} · {p.percent}%
              </span>
            </button>
          ))}
          {projectProgress.length === 0 && (
            <div className="py-6 text-center text-sm text-(--color-text-muted)">
              No projects yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
