import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { acceptInvite, listWorkspaces } from "@/lib/workspaces";
import { useWorkspaceStore } from "@/store/workspaceStore";

export default function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setWorkspaces, setCurrentId } = useWorkspaceStore();
  const token = searchParams.get("token") ?? "";

  const [status, setStatus] = useState("accepting"); // accepting | success | error
  const [error, setError] = useState("");
  const [workspace, setWorkspace] = useState(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("This invite link is missing its token.");
      return;
    }
    acceptInvite(token)
      .then(async (ws) => {
        setWorkspace(ws);
        setWorkspaces(await listWorkspaces());
        setCurrentId(ws._id);
        setStatus("success");
      })
      .catch((err) => {
        setStatus("error");
        setError(err.response?.data?.message ?? "Something went wrong");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-sm text-center">
        {status === "accepting" && (
          <p className="text-sm text-(--color-text-muted)">Joining workspace…</p>
        )}
        {status === "success" && (
          <>
            <div className="mb-2 text-4xl">{workspace.icon}</div>
            <h1 className="mb-2 text-lg font-semibold">
              You've joined {workspace.name}
            </h1>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-2 rounded-md bg-(--color-accent) px-4 py-2 text-sm font-medium text-white"
            >
              Go to workspace
            </button>
          </>
        )}
        {status === "error" && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}
