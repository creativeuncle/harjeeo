import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ViewIcon } from "hugeicons-react";
import { getPublicProject, getPublicTask, getPublicNote } from "@/lib/public";
import RichTextEditor from "@/components/editor/RichTextEditor";

const LOADERS = {
  projects: getPublicProject,
  tasks: getPublicTask,
  notes: getPublicNote,
};

const STATUS_LABELS = {
  not_started: "Not started",
  up_next: "Up next",
  in_progress: "In progress",
  done: "Done",
};

function humanize(key) {
  if (!key) return key;
  return key
    .split(/[_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function SharedContentPage() {
  const { type, id } = useParams();
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loader = LOADERS[type];
    if (!loader) {
      setError("Unknown page type");
      setLoading(false);
      return;
    }
    setLoading(true);
    loader(id)
      .then(setDoc)
      .catch(() => setError("This page isn't shared publicly, or no longer exists."))
      .finally(() => setLoading(false));
  }, [type, id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-(--color-text-muted)">
        Loading…
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <p className="text-sm text-(--color-text-muted)">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--color-canvas) text-(--color-text)">
      <div className="flex items-center justify-center gap-1.5 border-b border-(--color-border) bg-black/[.02] py-2 text-xs text-(--color-text-muted) dark:bg-white/[.03]">
        <ViewIcon size={13} strokeWidth={1.8} />
        Shared read-only view
      </div>

      <div className="mx-auto max-w-3xl px-10 py-10">
        {doc.icon && <div className="mb-3 text-5xl">{doc.icon}</div>}
        <h1 className="text-3xl font-bold">{doc.title || "Untitled"}</h1>

        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-(--color-text-muted)">
          {type === "projects" && doc.stage && <span>Stage: {humanize(doc.stage)}</span>}
          {type === "tasks" && doc.status && <span>Status: {STATUS_LABELS[doc.status] ?? doc.status}</span>}
          {type === "tasks" && doc.dueDate && (
            <span>Due {new Date(doc.dueDate).toLocaleDateString()}</span>
          )}
          {type === "projects" && doc.endDate && (
            <span>Due {new Date(doc.endDate).toLocaleDateString()}</span>
          )}
          {type === "notes" && doc.date && (
            <span>{new Date(doc.date).toLocaleDateString()}</span>
          )}
          {type === "notes" && doc.place && <span>{doc.place}</span>}
        </div>

        <div className="mt-8 border-t border-(--color-border) pt-6">
          <RichTextEditor content={doc.content ?? undefined} editable={false} />
        </div>
      </div>
    </div>
  );
}
