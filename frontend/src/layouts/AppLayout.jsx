import { Outlet } from "react-router-dom";
import Sidebar from "@/components/sidebar/Sidebar";

export default function AppLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-(--color-canvas) text-(--color-text)">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
