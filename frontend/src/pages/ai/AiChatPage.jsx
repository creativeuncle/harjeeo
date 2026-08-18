import { useEffect, useRef, useState } from "react";
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
  Attachment02Icon,
  AtIcon,
  PenTool02Icon,
  Tick02Icon,
  SparklesIcon,
} from "hugeicons-react";

const QUICK_ACTIONS = [
  { icon: PresentationBarChart01Icon, label: "Create slides" },
  { icon: GridIcon, label: "Spreadsheets" },
  { icon: Search01Icon, label: "Research" },
  { icon: ChartLineData01Icon, label: "Visualize" },
];

const ATTACH_ITEMS = [
  { icon: Attachment02Icon, label: "Add images, PDFs, or CSVs" },
  { icon: AtIcon, label: "Mention pages or people" },
  { icon: PenTool02Icon, label: "Skills" },
];

const MODEL_GROUPS = [
  {
    label: null,
    items: [{ id: "auto", label: "Auto", hint: "Balances speed, effort, and cost." }],
  },
  {
    label: "For your hardest tasks",
    items: [
      { id: "opus-5", label: "Opus 5" },
      { id: "gpt-5.6", label: "GPT-5.6 Sol" },
      { id: "kimi-k3", label: "Kimi K3" },
    ],
  },
  {
    label: "Claude",
    items: [{ id: "sonnet-5", label: "Sonnet 5" }],
  },
];

function AttachMenu({ onClose }) {
  return (
    <div className="absolute bottom-full left-0 z-30 mb-1 w-64 rounded-lg border border-(--color-border) bg-(--color-canvas) p-1 shadow-lg">
      {ATTACH_ITEMS.map(({ icon: Icon, label }) => (
        <button
          key={label}
          type="button"
          onClick={onClose}
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
        >
          <Icon size={16} strokeWidth={1.8} className="text-(--color-text-muted)" />
          {label}
        </button>
      ))}
    </div>
  );
}

function ModelMenu({ selected, onSelect }) {
  return (
    <div className="absolute bottom-full right-0 z-30 mb-1 max-h-72 w-60 overflow-y-auto rounded-lg border border-(--color-border) bg-(--color-canvas) p-1 shadow-lg">
      {MODEL_GROUPS.map((group, i) => (
        <div key={group.label ?? "root"} className={i > 0 ? "mt-1 border-t border-(--color-border) pt-1" : ""}>
          {group.label && (
            <div className="px-2.5 pb-1 pt-1.5 text-xs text-(--color-text-muted)">{group.label}</div>
          )}
          {group.items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
            >
              <SparklesIcon size={14} strokeWidth={1.8} className="shrink-0 text-(--color-accent)" />
              <span className="min-w-0 flex-1">
                <div className="truncate">{item.label}</div>
                {item.hint && <div className="truncate text-xs text-(--color-text-muted)">{item.hint}</div>}
              </span>
              {selected.id === item.id && (
                <Tick02Icon size={14} strokeWidth={2} className="shrink-0 text-(--color-accent)" />
              )}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

function Composer({ value, setValue, onSend }) {
  const [attachOpen, setAttachOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [model, setModel] = useState(MODEL_GROUPS[0].items[0]);

  return (
    <div className="rounded-2xl border border-(--color-border) bg-(--color-canvas) p-3 shadow-sm">
      <textarea
        rows={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
        placeholder="Do anything with AI…"
        className="max-h-40 w-full resize-none bg-transparent px-1 py-1 text-sm outline-none placeholder:text-(--color-text-muted)"
      />
      <div className="mt-1 flex items-center justify-between">
        <div className="relative flex items-center gap-1">
          <button
            type="button"
            title="Attach"
            onClick={() => setAttachOpen((v) => !v)}
            className={`flex h-7 w-7 items-center justify-center rounded-md text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10 ${
              attachOpen ? "bg-black/5 dark:bg-white/10" : ""
            }`}
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
          {attachOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setAttachOpen(false)} />
              <AttachMenu onClose={() => setAttachOpen(false)} />
            </>
          )}
        </div>
        <div className="relative flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setModelOpen((v) => !v)}
            className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10 ${
              modelOpen ? "bg-black/5 dark:bg-white/10" : ""
            }`}
          >
            {model.label}
            <ArrowDown01Icon size={12} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            onClick={onSend}
            disabled={!value.trim()}
            title="Send"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-black/10 text-(--color-text) disabled:opacity-50 dark:bg-white/15"
          >
            <ArrowUp01Icon size={14} strokeWidth={2} />
          </button>
          {modelOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setModelOpen(false)} />
              <ModelMenu
                selected={model}
                onSelect={(item) => {
                  setModel(item);
                  setModelOpen(false);
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AiChatPage() {
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

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

  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center overflow-y-auto px-6 py-16">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-(--color-accent)/10 text-(--color-accent)">
          <MessageUser02Icon size={22} strokeWidth={1.8} />
        </div>
        <h1 className="mt-4 text-2xl font-semibold">How can I help you today?</h1>

        <div className="mt-6 w-full max-w-2xl">
          <Composer value={value} setValue={setValue} onSend={handleSend} />
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
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto flex max-w-2xl flex-col gap-3">
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
      </div>
      <div className="border-t border-(--color-border) px-6 py-4">
        <div className="mx-auto max-w-2xl">
          <Composer value={value} setValue={setValue} onSend={handleSend} />
        </div>
      </div>
    </div>
  );
}
