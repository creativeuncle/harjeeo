import { useNavigate } from "react-router-dom";
import { UserSwitchIcon } from "hugeicons-react";
import { useAuthStore } from "@/store/authStore";

export default function ImpersonationBanner() {
  const navigate = useNavigate();
  const impersonatorAdmin = useAuthStore((s) => s.impersonatorAdmin);
  const targetName = useAuthStore((s) => s.user?.name);
  const stopImpersonation = useAuthStore((s) => s.stopImpersonation);

  if (!impersonatorAdmin) return null;

  function handleExit() {
    stopImpersonation();
    navigate("/admin/users");
  }

  return (
    <div className="flex items-center justify-center gap-2 bg-amber-500 px-4 py-1.5 text-xs font-medium text-black print:hidden">
      <UserSwitchIcon size={14} strokeWidth={1.8} />
      Viewing as {targetName} — impersonation session
      <button
        type="button"
        onClick={handleExit}
        className="ml-2 rounded-full bg-black/10 px-2.5 py-0.5 hover:bg-black/20"
      >
        Exit to admin
      </button>
    </div>
  );
}
