import { useRef, useState } from "react";
import { Camera01Icon, CheckmarkCircle02Icon, Alert02Icon } from "hugeicons-react";
import { useAuthStore } from "@/store/authStore";
import { updateProfile } from "@/lib/users";
import { uploadImage, isCloudinaryConfigured } from "@/lib/cloudinary";
import Avatar from "@/components/ui/Avatar";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "pa", label: "ਪੰਜਾਬੀ (Punjabi)" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
];

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const fileInputRef = useRef(null);

  const [name, setName] = useState(user?.name ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [saveState, setSaveState] = useState("idle");

  async function persist(updates) {
    setSaveState("saving");
    try {
      const updated = await updateProfile(updates);
      updateUser(updated);
      setSaveState("saved");
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to save changes");
      setSaveState("idle");
    }
  }

  function handleNameBlur() {
    if (name.trim() && name !== user.name) {
      persist({ name: name.trim() });
    }
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError("");
    setUploading(true);
    try {
      const url = await uploadImage(file);
      await persist({ avatarUrl: url });
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl px-10 py-8">
      <h1 className="mb-6 text-2xl font-semibold">My profile</h1>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="group relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full disabled:opacity-60"
          title="Change photo"
        >
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <Avatar name={user.name} size={80} />
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Camera01Icon size={22} strokeWidth={1.8} className="text-white" />
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="hidden"
        />
        <div>
          <div className="text-sm font-medium">{uploading ? "Uploading…" : "Profile photo"}</div>
          {!isCloudinaryConfigured() && (
            <p className="mt-0.5 text-xs text-(--color-text-muted)">
              Image upload isn't configured yet.
            </p>
          )}
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <div className="mt-8 flex flex-col gap-4 text-sm">
        <div>
          <label className="mb-1 block text-(--color-text-muted)">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleNameBlur}
            className="w-full rounded-md border border-(--color-border) bg-(--color-canvas) px-3 py-2 outline-none focus:border-(--color-accent)"
          />
        </div>

        <div>
          <label className="mb-1 block text-(--color-text-muted)">Email</label>
          <div className="flex items-center gap-2 rounded-md border border-(--color-border) bg-(--color-canvas) px-3 py-2">
            <span className="flex-1">{user.email}</span>
            {user.isEmailVerified ? (
              <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                <CheckmarkCircle02Icon size={14} strokeWidth={1.8} />
                Verified
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                <Alert02Icon size={14} strokeWidth={1.8} />
                Unverified
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-(--color-text-muted)">Language</label>
          <select
            value={user.language}
            onChange={(e) => persist({ language: e.target.value })}
            className="w-full rounded-md border border-(--color-border) bg-(--color-canvas) px-3 py-2 outline-none focus:border-(--color-accent)"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-(--color-text-muted)">
          {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : ""}
        </div>
      </div>
    </div>
  );
}
