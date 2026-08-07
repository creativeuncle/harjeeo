import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import AuthLayout from "./AuthLayout";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

export default function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      setSession(data.user, data.accessToken);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to your workspace">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="rounded-md border border-(--color-border) bg-(--color-canvas) px-3 py-2 text-sm outline-none focus:border-(--color-accent)"
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="rounded-md border border-(--color-border) bg-(--color-canvas) px-3 py-2 text-sm outline-none focus:border-(--color-accent)"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-(--color-accent)">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-1 rounded-md bg-(--color-accent) px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>

      <GoogleAuthButton />

      <p className="mt-4 text-center text-sm text-(--color-text-muted)">
        Don't have an account?{" "}
        <Link to="/signup" className="text-(--color-accent)">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}
