import { useState } from "react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "hugeicons-react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const startOffset = first.getDay();
  const gridStart = new Date(year, month, 1 - startOffset);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
}

function sameDay(a, b) {
  return a.toDateString() === b.toDateString();
}

// items: [{ id, date: ISOString|null, title, icon, colorClass, onClick }]
export default function CalendarView({ items, onItemClick, emptyLabel = "No date" }) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const days = buildMonthGrid(viewYear, viewMonth);

  function changeMonth(delta) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    setViewMonth(m);
    setViewYear(y);
  }

  const itemsByDay = {};
  const undated = [];
  for (const item of items) {
    if (!item.date) {
      undated.push(item);
      continue;
    }
    const key = new Date(item.date).toDateString();
    (itemsByDay[key] ??= []).push(item);
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium">
          {new Date(viewYear, viewMonth).toLocaleDateString(undefined, {
            month: "long",
            year: "numeric",
          })}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setViewYear(now.getFullYear());
              setViewMonth(now.getMonth());
            }}
            className="mr-1 text-xs text-(--color-text-muted) hover:text-(--color-text)"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            className="rounded p-1 hover:bg-black/5 dark:hover:bg-white/10"
          >
            <ArrowLeft01Icon size={14} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            className="rounded p-1 hover:bg-black/5 dark:hover:bg-white/10"
          >
            <ArrowRight01Icon size={14} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-(--color-border) bg-(--color-border) text-xs">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="bg-(--color-canvas) px-2 py-1.5 text-center font-medium text-(--color-text-muted)"
          >
            {w}
          </div>
        ))}
        {days.map((day) => {
          const outOfMonth = day.getMonth() !== viewMonth;
          const isToday = sameDay(day, now);
          const dayItems = itemsByDay[day.toDateString()] ?? [];
          return (
            <div key={day.toISOString()} className="min-h-[92px] bg-(--color-canvas) p-1.5">
              <div
                className={`mb-1 flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                  isToday
                    ? "bg-(--color-accent) text-white"
                    : outOfMonth
                      ? "text-(--color-text-muted) opacity-40"
                      : ""
                }`}
              >
                {day.getDate()}
              </div>
              <div className="flex flex-col gap-0.5">
                {dayItems.slice(0, 3).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onItemClick(item)}
                    className={`truncate rounded px-1.5 py-0.5 text-left text-xs font-medium hover:opacity-80 ${
                      item.colorClass ?? "bg-black/5 dark:bg-white/10"
                    }`}
                  >
                    {item.icon ? `${item.icon} ` : ""}
                    {item.title}
                  </button>
                ))}
                {dayItems.length > 3 && (
                  <span className="px-1.5 text-xs text-(--color-text-muted)">
                    +{dayItems.length - 3} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {undated.length > 0 && (
        <div className="mt-4">
          <div className="mb-1.5 text-xs font-medium text-(--color-text-muted)">
            {emptyLabel} ({undated.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {undated.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onItemClick(item)}
                className={`truncate rounded px-2 py-1 text-left text-xs font-medium hover:opacity-80 ${
                  item.colorClass ?? "bg-black/5 dark:bg-white/10"
                }`}
              >
                {item.icon ? `${item.icon} ` : ""}
                {item.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
