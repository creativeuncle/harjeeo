import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

let scriptPromise = null;
function loadGoogleScript() {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export default function GoogleAuthButton() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const overlayRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !overlayRef.current) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: async ({ credential }) => {
            try {
              const { data } = await api.post("/auth/google", { credential });
              setSession(data.user, data.accessToken);
              navigate("/", { replace: true });
            } catch {
              // user can retry from the button
            }
          },
        });
        const width = wrapperRef.current?.offsetWidth ?? 320;
        window.google.accounts.id.renderButton(overlayRef.current, {
          theme: "outline",
          size: "large",
          width: Math.min(Math.max(width, 200), 400),
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [navigate, setSession]);

  if (!CLIENT_ID) return null;

  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="flex w-full items-center gap-2 text-xs text-(--color-text-muted)">
        <div className="h-px flex-1 bg-(--color-border)" />
        or
        <div className="h-px flex-1 bg-(--color-border)" />
      </div>
      <div ref={wrapperRef} className="relative flex items-center justify-center gap-2 overflow-hidden rounded-md border border-(--color-border) bg-(--color-canvas) px-3 py-2 text-sm font-medium text-(--color-text)">
        <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
          <path
            fill="#FFC107"
            d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
          />
          <path
            fill="#FF3D00"
            d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
          />
          <path
            fill="#4CAF50"
            d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
          />
          <path
            fill="#1976D2"
            d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
          />
        </svg>
        Continue with Google
        <div ref={overlayRef} className="absolute inset-0 opacity-0 [&_iframe]:!h-full [&_iframe]:!w-full" />
      </div>
    </div>
  );
}
