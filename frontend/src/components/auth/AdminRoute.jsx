import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

export default function AdminRoute() {
  const user = useAuthStore((s) => s.user);

  if (!user?.isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
