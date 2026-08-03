import { useState } from "react";
import { Alert02Icon } from "hugeicons-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function HomePage() {
  const user = useAuthStore((s) => s.user);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleResend() {
    setSending(true);
    try {
      await api.post("/auth/resend-verification");
      setSent(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="px-10 py-8">
      <h1 className="text-2xl font-semibold">Welcome to Harjeeo</h1>
      <p className="mt-2 text-(--color-text-muted)">
        Your workspace for projects, tasks and docs.
      </p>

      {user && !user.isEmailVerified && (
        <div className="mt-4 flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300">
          <Alert02Icon size={16} strokeWidth={1.8} />
          <span>Please verify your email address.</span>
          {sent ? (
            <span className="font-medium">Verification email sent.</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={sending}
              className="font-medium underline disabled:opacity-60"
            >
              {sending ? "Sending…" : "Resend email"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
