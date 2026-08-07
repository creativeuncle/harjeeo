const DAY_WIDTH = 32;
const ROW_HEIGHT = 40;
const LABEL_WIDTH = 220;

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function diffDays(a, b) {
  return Math.round((startOfDay(a) - startOfDay(b)) / 86400000);
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// tasks: [{ id, title, startDate, dueDate, status, dotClass, onClick, dependsOnIds }]
export default function GanttView({ tasks, emptyLabel = "No tasks with dates yet" }) {
  const dated = tasks.filter((t) => t.startDate || t.dueDate);

  if (dated.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-(--color-text-muted)">{emptyLabel}</div>
    );
  }

  const today = startOfDay(new Date());
  let rangeStart = today;
  let rangeEnd = today;
  for (const t of dated) {
    const s = startOfDay(t.startDate ?? t.dueDate);
    const e = startOfDay(t.dueDate ?? t.startDate);
    if (s < rangeStart) rangeStart = s;
    if (e > rangeEnd) rangeEnd = e;
  }
  rangeStart = addDays(rangeStart, -2);
  rangeEnd = addDays(rangeEnd, 2);
  const totalDays = diffDays(rangeEnd, rangeStart) + 1;

  const rowIndexById = new Map(dated.map((t, i) => [t.id, i]));

  const bars = dated.map((t) => {
    const start = startOfDay(t.startDate ?? t.dueDate);
    const end = startOfDay(t.dueDate ?? t.startDate);
    const offset = diffDays(start, rangeStart);
    const length = Math.max(1, diffDays(end, start) + 1);
    return { ...t, offset, length };
  });

  const connectors = [];
  bars.forEach((t, rowIndex) => {
    for (const depId of t.dependsOnIds ?? []) {
      const depRow = rowIndexById.get(depId);
      if (depRow === undefined) continue;
      const dep = bars[depRow];
      const x1 = (dep.offset + dep.length) * DAY_WIDTH;
      const y1 = depRow * ROW_HEIGHT + ROW_HEIGHT / 2;
      const x2 = t.offset * DAY_WIDTH;
      const y2 = rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2;
      const midX = x1 + Math.max(8, (x2 - x1) / 2);
      connectors.push(`M${x1},${y1} L${midX},${y1} L${midX},${y2} L${x2},${y2}`);
    }
  });

  const dayMarks = Array.from({ length: totalDays }, (_, i) => addDays(rangeStart, i));
  const todayOffset = diffDays(today, rangeStart);

  return (
    <div className="overflow-x-auto rounded-lg border border-(--color-border)">
      <div style={{ width: LABEL_WIDTH + totalDays * DAY_WIDTH }}>
        <div className="flex border-b border-(--color-border) bg-black/[.02] text-xs dark:bg-white/[.03]">
          <div
            style={{ width: LABEL_WIDTH }}
            className="shrink-0 border-r border-(--color-border) px-3 py-2 font-medium"
          >
            Task
          </div>
          <div className="relative flex">
            {dayMarks.map((d, i) => (
              <div
                key={i}
                style={{ width: DAY_WIDTH }}
                className={`shrink-0 border-r border-(--color-border)/50 py-2 text-center text-(--color-text-muted) ${
                  d.getDay() === 0 || d.getDay() === 6 ? "bg-black/[.02] dark:bg-white/[.03]" : ""
                }`}
              >
                {d.getDate()}
                {d.getDate() === 1 && (
                  <div className="text-[9px] leading-none">
                    {d.toLocaleDateString(undefined, { month: "short" })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {bars.map((t, rowIndex) => (
          <div
            key={t.id}
            className="flex border-b border-(--color-border) last:border-b-0"
            style={{ height: ROW_HEIGHT }}
          >
            <div
              style={{ width: LABEL_WIDTH }}
              className="flex shrink-0 items-center truncate border-r border-(--color-border) px-3 text-sm"
            >
              <button
                type="button"
                onClick={t.onClick}
                className="truncate text-left hover:underline"
                title={t.title}
              >
                {t.title}
              </button>
            </div>
            <div className="relative" style={{ width: totalDays * DAY_WIDTH }}>
              {rowIndex === 0 && (
                <svg
                  className="pointer-events-none absolute left-0 top-0 z-10"
                  width={totalDays * DAY_WIDTH}
                  height={bars.length * ROW_HEIGHT}
                >
                  {connectors.map((d, i) => (
                    <path key={i} d={d} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-(--color-text-muted)/40" />
                  ))}
                </svg>
              )}
              <div
                className="absolute left-0 top-0 w-px bg-(--color-accent)/50"
                style={{ left: todayOffset * DAY_WIDTH + DAY_WIDTH / 2, height: ROW_HEIGHT }}
              />
              <button
                type="button"
                onClick={t.onClick}
                style={{
                  left: t.offset * DAY_WIDTH + 2,
                  width: t.length * DAY_WIDTH - 4,
                  top: 7,
                  height: ROW_HEIGHT - 14,
                }}
                className={`absolute rounded-md text-left text-xs font-medium text-white hover:opacity-90 ${t.dotClass ?? "bg-gray-400"}`}
              >
                <span className="block truncate px-2 leading-[26px]">{t.title}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
