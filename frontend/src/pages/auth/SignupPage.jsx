import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import AuthLayout from "./AuthLayout";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

export default function SignupPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
      setSession(data.user, data.accessToken);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Get started with Harjeeo">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Full name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="rounded-md border border-(--color-border) bg-(--color-canvas) px-3 py-2 text-sm outline-none focus:border-(--color-accent)"
        />
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
          placeholder="Password (min 8 characters)"
          required
          minLength={8}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="rounded-md border border-(--color-border) bg-(--color-canvas) px-3 py-2 text-sm outline-none focus:border-(--color-accent)"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 rounded-md bg-(--color-accent) px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Sign up"}
        </button>
      </form>

      <GoogleAuthButton />

      <p className="mt-4 text-center text-sm text-(--color-text-muted)">
        Already have an account?{" "}
        <Link to="/login" className="text-(--color-accent)">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
