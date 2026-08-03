import { useEffect } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function AuthProvider({ children }) {
  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clearSession);
  const setStatus = useAuthStore((s) => s.setStatus);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setStatus("loading");
      try {
        const { data } = await api.post("/auth/refresh");
        if (!cancelled) setSession(data.user, data.accessToken);
      } catch {
        if (!cancelled) clearSession();
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [setSession, clearSession, setStatus]);

  return children;
}
