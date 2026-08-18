import { useState } from "react";
import {
  MessageUser02Icon,
  Cancel01Icon,
  ArrowDown01Icon,
  Add01Icon,
  ArrowUp01Icon,
  Search01Icon,
  Note01Icon,
  Mail01Icon,
} from "hugeicons-react";

const SUGGESTIONS = [
  { icon: Search01Icon, label: "Search for anything" },
  { icon: Note01Icon, label: "Summarize this page" },
  { icon: Mail01Icon, label: "Draft a message" },
];

export default function AiChatPanel() {
  const [open, setOpen] = useState(false);
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
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="AI chat"
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-(--color-border) bg-(--color-canvas) text-(--color-text) shadow-lg hover:bg-black/5 dark:hover:bg-white/10 print:hidden"
      >
        <MessageUser02Icon size={22} strokeWidth={1.8} />
        <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-(--color-canvas) bg-red-500" />
      </button>

      {open && (
        <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-(--color-border) bg-(--color-canvas) shadow-2xl print:hidden">
          <div className="flex items-center justify-between border-b border-(--color-border) px-4 py-3">
            <span className="flex items-center gap-1 text-sm font-medium">
              New AI chat
              <ArrowDown01Icon size={14} strokeWidth={1.8} className="text-(--color-text-muted)" />
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
            >
              <Cancel01Icon size={16} strokeWidth={1.8} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-(--color-accent)/10 text-(--color-accent)">
                  <MessageUser02Icon size={22} strokeWidth={1.8} />
                </div>
                <h2 className="text-lg font-semibold">How can I help you today?</h2>
                <div className="mt-5 flex w-full flex-col gap-1">
                  {SUGGESTIONS.map(({ icon: Icon, label }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setValue(label)}
                      className="flex items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      <Icon size={16} strokeWidth={1.8} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
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

          <div className="border-t border-(--color-border) p-3">
            <div className="rounded-xl border border-(--color-border) bg-(--color-canvas) p-2">
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
                className="max-h-32 w-full resize-none bg-transparent px-1 py-1 text-sm outline-none placeholder:text-(--color-text-muted)"
              />
              <div className="mt-1 flex items-center justify-between">
                <button
                  type="button"
                  title="Attach"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <Add01Icon size={16} strokeWidth={1.8} />
                </button>
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
          </div>
        </div>
      )}
    </>
  );
}
