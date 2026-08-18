import { useNavigate } from "react-router-dom";
import { MessageUser02Icon } from "hugeicons-react";

export default function AiChatButton() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate("/ai-chat")}
      title="AI chat"
      className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-(--color-border) bg-(--color-canvas) text-(--color-text) shadow-lg hover:bg-black/5 dark:hover:bg-white/10 print:hidden"
    >
      <MessageUser02Icon size={22} strokeWidth={1.8} />
      <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-(--color-canvas) bg-red-500" />
    </button>
  );
}
