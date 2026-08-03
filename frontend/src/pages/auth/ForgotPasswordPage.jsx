import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import AuthLayout from "./AuthLayout";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <AuthLayout title="Check your email">
        <p className="text-center text-sm text-(--color-text-muted)">
          If an account with that email exists, we've sent a password reset
          link to <strong className="text-(--color-text)">{email}</strong>.
        </p>
        <p className="mt-4 text-center text-sm">
          <Link to="/login" className="text-(--color-accent)">
            Back to login
          </Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot password"
      subtitle="Enter your email and we'll send you a reset link"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md border border-(--color-border) bg-(--color-canvas) px-3 py-2 text-sm outline-none focus:border-(--color-accent)"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 rounded-md bg-(--color-accent) px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-(--color-text-muted)">
        <Link to="/login" className="text-(--color-accent)">
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
}
