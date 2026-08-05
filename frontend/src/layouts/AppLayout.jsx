import { Outlet } from "react-router-dom";
import Sidebar from "@/components/sidebar/Sidebar";
import NotificationBell from "@/components/notifications/NotificationBell";

export default function AppLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-(--color-canvas) text-(--color-text)">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-end border-b border-(--color-border) px-4 py-2">
          <NotificationBell />
        </div>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
