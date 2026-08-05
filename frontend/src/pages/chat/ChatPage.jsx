import { AiChat02Icon, Add01Icon } from "hugeicons-react";

export default function ChatPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-10 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/5 dark:bg-white/10">
        <AiChat02Icon size={26} strokeWidth={1.8} />
      </div>
      <h1 className="mt-4 text-xl font-semibold">Chat</h1>
      <p className="mt-1 max-w-sm text-sm text-(--color-text-muted)">
        Ask questions, get summaries, and work across your workspace. Chat is
        coming soon.
      </p>

      <button
        type="button"
        disabled
        className="mt-6 flex items-center gap-2 rounded-md border border-(--color-border) px-3 py-1.5 text-sm text-(--color-text-muted) opacity-60"
      >
        <Add01Icon size={16} strokeWidth={1.8} />
        New chat
      </button>
    </div>
  );
}
