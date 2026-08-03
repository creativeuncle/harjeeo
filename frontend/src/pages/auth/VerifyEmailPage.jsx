import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import AuthLayout from "./AuthLayout";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const setSession = useAuthStore((s) => s.setSession);
  const accessToken = useAuthStore((s) => s.accessToken);

  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("This verification link is missing its token.");
      return;
    }

    api
      .post("/auth/verify-email", { token })
      .then(({ data }) => {
        if (accessToken) {
          setSession(data.user, accessToken);
        }
        setStatus("success");
      })
      .catch((err) => {
        setStatus("error");
        setError(err.response?.data?.message ?? "Something went wrong");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <AuthLayout
      title={
        status === "success"
          ? "Email verified"
          : status === "error"
            ? "Verification failed"
            : "Verifying…"
      }
    >
      {status === "success" && (
        <p className="text-center text-sm text-(--color-text-muted)">
          Your email has been verified.{" "}
          <Link to="/" className="text-(--color-accent)">
            Go to workspace
          </Link>
        </p>
      )}
      {status === "error" && (
        <p className="text-center text-sm text-red-500">{error}</p>
      )}
      {status === "verifying" && (
        <p className="text-center text-sm text-(--color-text-muted)">
          Please wait…
        </p>
      )}
    </AuthLayout>
  );
}
