import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft01Icon, ArrowRight01Icon, Calendar03Icon } from "hugeicons-react";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function toISODate(d) {
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 10);
}

function parseISODate(s) {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(s) {
  return parseISODate(s).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

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

export default function DatePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const triggerRef = useRef(null);
  const initial = parseISODate(value) ?? new Date();
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const selected = parseISODate(value);
  const days = buildMonthGrid(viewYear, viewMonth);

  function handleOpen() {
    const rect = triggerRef.current.getBoundingClientRect();
    setPosition({ top: rect.bottom + 4, left: rect.left });
    setOpen(true);
  }

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

  function handleDayClick(day) {
    onChange(toISODate(day));
    setOpen(false);
  }

  function isSameDay(a, b) {
    return a && b && a.toDateString() === b.toDateString();
  }

  return (
    <div className="inline-block">
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm hover:bg-black/5 dark:hover:bg-white/10"
      >
        <Calendar03Icon size={18} strokeWidth={1.8} className="text-(--color-text-muted)" />
        <span className={selected ? "" : "text-(--color-text-muted)"}>
          {selected ? formatDate(value) : "Empty"}
        </span>
      </button>

      {open &&
        position &&
        createPortal(
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div
              style={{ top: position.top, left: position.left }}
              className="fixed z-50 w-72 rounded-lg border border-(--color-border) bg-(--color-canvas) p-3 shadow-lg"
            >
              <div className="mb-2 flex items-center justify-between">
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
                      const now = new Date();
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

              <div className="grid grid-cols-7 gap-y-1 text-center text-xs text-(--color-text-muted)">
                {WEEKDAYS.map((w) => (
                  <div key={w}>{w}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-y-1 text-center text-sm">
                {days.map((day) => {
                  const outOfMonth = day.getMonth() !== viewMonth;
                  const isSelected = isSameDay(day, selected);
                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={() => handleDayClick(day)}
                      className={[
                        "mx-auto flex h-8 w-8 items-center justify-center rounded-full",
                        outOfMonth ? "text-(--color-text-muted) opacity-40" : "",
                        isSelected ? "bg-(--color-accent) text-white" : "",
                        !isSelected ? "hover:bg-black/5 dark:hover:bg-white/10" : "",
                      ].join(" ")}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
                className="mt-2 w-full rounded-md border-t border-(--color-border) pt-2 text-left text-sm text-(--color-text-muted) hover:text-(--color-text)"
              >
                Clear
              </button>
            </div>
          </>,
          document.body
        )}
    </div>
  );
}
