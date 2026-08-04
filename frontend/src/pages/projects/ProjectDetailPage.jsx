import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Calendar03Icon, Delete02Icon, Flag01Icon, UserIcon } from "hugeicons-react";
import { getProject, updateProject, deleteProject, STAGE_OPTIONS } from "@/lib/projects";
import RichTextEditor from "@/components/editor/RichTextEditor";
import IconPicker from "@/components/ui/IconPicker";

function toDateInputValue(d) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved
  const saveTimeout = useRef(null);
  const pendingUpdates = useRef({});

  useEffect(() => {
    setLoading(true);
    getProject(id)
      .then(setProject)
      .finally(() => setLoading(false));
  }, [id]);

  const persist = useCallback(
    (updates) => {
      pendingUpdates.current = { ...pendingUpdates.current, ...updates };
      setSaveState("saving");
      clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(async () => {
        const toSave = pendingUpdates.current;
        pendingUpdates.current = {};
        await updateProject(id, toSave);
        setSaveState("saved");
      }, 500);
    },
    [id]
  );

  function patchField(field, value) {
    setProject((prev) => ({ ...prev, [field]: value }));
    persist({ [field]: value });
  }

  async function handleDelete() {
    if (!window.confirm("Delete this project? This can't be undone.")) return;
    await deleteProject(id);
    navigate("/projects", { replace: true });
  }

  if (loading) {
    return (
      <div className="px-10 py-8 text-sm text-(--color-text-muted)">Loading…</div>
    );
  }

  if (!project) {
    return (
      <div className="px-10 py-8 text-sm text-(--color-text-muted)">
        Project not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-10 py-8">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs text-(--color-text-muted)">
          {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : ""}
        </span>
        <button
          type="button"
          onClick={handleDelete}
          title="Delete project"
          className="rounded-md p-1.5 text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
        >
          <Delete02Icon size={16} strokeWidth={1.8} />
        </button>
      </div>

      <div className="mb-4">
        <IconPicker
          trigger={
            <span className="flex h-16 w-16 items-center justify-center rounded-lg text-5xl hover:bg-black/5 dark:hover:bg-white/10">
              {project.icon || "🎯"}
            </span>
          }
          onSelect={(emoji) => patchField("icon", emoji)}
          onRemove={() => patchField("icon", "")}
        />
      </div>

      <input
        value={project.title}
        onChange={(e) => patchField("title", e.target.value)}
        placeholder="Untitled"
        className="w-full border-none bg-transparent text-3xl font-bold outline-none placeholder:text-(--color-text-muted)"
      />

      <div className="mt-4 flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-3">
          <span className="flex w-28 shrink-0 items-center gap-1.5 text-(--color-text-muted)">
            <Flag01Icon size={15} strokeWidth={1.8} />
            Stage
          </span>
          <select
            value={project.stage}
            onChange={(e) => patchField("stage", e.target.value)}
            className="rounded-md border border-(--color-border) bg-(--color-canvas) px-2 py-1 text-sm outline-none"
          >
            {STAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex w-28 shrink-0 items-center gap-1.5 text-(--color-text-muted)">
            <Calendar03Icon size={15} strokeWidth={1.8} />
            Timeline
          </span>
          <input
            type="date"
            value={toDateInputValue(project.startDate)}
            onChange={(e) => patchField("startDate", e.target.value || null)}
            className="rounded-md border border-(--color-border) bg-(--color-canvas) px-2 py-1 text-sm outline-none"
          />
          <span className="text-(--color-text-muted)">→</span>
          <input
            type="date"
            value={toDateInputValue(project.endDate)}
            onChange={(e) => patchField("endDate", e.target.value || null)}
            className="rounded-md border border-(--color-border) bg-(--color-canvas) px-2 py-1 text-sm outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="flex w-28 shrink-0 items-center gap-1.5 text-(--color-text-muted)">
            <UserIcon size={15} strokeWidth={1.8} />
            Lead
          </span>
          <input
            value={project.lead}
            onChange={(e) => patchField("lead", e.target.value)}
            placeholder="Empty"
            className="rounded-md border border-transparent bg-transparent px-2 py-1 text-sm outline-none hover:border-(--color-border) focus:border-(--color-border)"
          />
        </div>
      </div>

      <div className="mt-8 border-t border-(--color-border) pt-6">
        <RichTextEditor
          content={project.content ?? undefined}
          onChange={(json) => patchField("content", json)}
          placeholder="Write a description, notes, or plan for this project. Type '/' for commands…"
        />
      </div>
    </div>
  );
}
