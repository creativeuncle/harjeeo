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
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !buttonRef.current) return;
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
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          width: 320,
          text: "continue_with",
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [navigate, setSession]);

  if (!CLIENT_ID) return null;

  return (
    <div className="mt-4 flex flex-col items-center gap-4">
      <div className="flex w-full items-center gap-2 text-xs text-(--color-text-muted)">
        <div className="h-px flex-1 bg-(--color-border)" />
        or
        <div className="h-px flex-1 bg-(--color-border)" />
      </div>
      <div ref={buttonRef} className="flex justify-center" />
    </div>
  );
}
