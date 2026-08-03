import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

export default function ProtectedRoute() {
  const status = useAuthStore((s) => s.status);

  if (status === "idle" || status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center text-sm text-(--color-text-muted)">
        Loading…
      </div>
    );
  }

  if (status !== "authenticated") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
