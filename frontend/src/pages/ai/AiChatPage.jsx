import { useState } from "react";
import {
  MessageUser02Icon,
  Add01Icon,
  Setting07Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  PresentationBarChart01Icon,
  GridIcon,
  Search01Icon,
  ChartLineData01Icon,
} from "hugeicons-react";

const QUICK_ACTIONS = [
  { icon: PresentationBarChart01Icon, label: "Create slides" },
  { icon: GridIcon, label: "Spreadsheets" },
  { icon: Search01Icon, label: "Research" },
  { icon: ChartLineData01Icon, label: "Visualize" },
];

export default function AiChatPage() {
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState([]);

  function handleSend() {
    const text = value.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", text },
      { role: "assistant", text: "AI chat is coming soon — this is just the interface for now." },
    ]);
    setValue("");
  }

  return (
    <div className="flex h-full flex-col items-center overflow-y-auto px-6 py-16">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-(--color-accent)/10 text-(--color-accent)">
        <MessageUser02Icon size={22} strokeWidth={1.8} />
      </div>
      <h1 className="mt-4 text-2xl font-semibold">How can I help you today?</h1>

      <div className="mt-6 w-full max-w-2xl">
        <div className="rounded-2xl border border-(--color-border) bg-(--color-canvas) p-3 shadow-sm">
          <textarea
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Do anything with AI…"
            className="max-h-40 w-full resize-none bg-transparent px-1 py-1 text-sm outline-none placeholder:text-(--color-text-muted)"
          />
          <div className="mt-1 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                type="button"
                title="Attach"
                className="flex h-7 w-7 items-center justify-center rounded-md text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
              >
                <Add01Icon size={16} strokeWidth={1.8} />
              </button>
              <button
                type="button"
                title="Options"
                className="flex h-7 w-7 items-center justify-center rounded-md text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
              >
                <Setting07Icon size={16} strokeWidth={1.8} />
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
              >
                Auto
                <ArrowDown01Icon size={12} strokeWidth={1.8} />
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={!value.trim()}
                title="Send"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-black/10 text-(--color-text) disabled:opacity-50 dark:bg-white/15"
              >
                <ArrowUp01Icon size={14} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        {messages.length === 0 ? (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
            {QUICK_ACTIONS.map(({ icon: Icon, label }) => (
              <button
                key={label}
                type="button"
                onClick={() => setValue(label)}
                className="flex items-center gap-1.5 text-sm text-(--color-text-muted) hover:text-(--color-text)"
              >
                <Icon size={16} strokeWidth={1.8} />
                {label}
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${
                  m.role === "user"
                    ? "self-end bg-(--color-accent) text-white"
                    : "self-start bg-black/5 text-(--color-text) dark:bg-white/10"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
