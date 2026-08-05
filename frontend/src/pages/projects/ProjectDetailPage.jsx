import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Delete02Icon, Flag01Icon, Calendar03Icon, UserIcon, Task01Icon } from "hugeicons-react";
import { getProject, updateProject, deleteProject } from "@/lib/projects";
import { listTasks, updateTask } from "@/lib/tasks";
import { listStageOptions, createStageOption } from "@/lib/projectStageOptions";
import { useWorkspaceStore } from "@/store/workspaceStore";
import RichTextEditor from "@/components/editor/RichTextEditor";
import IconPicker from "@/components/ui/IconPicker";
import DateRangePicker from "@/components/ui/DateRangePicker";
import SelectPicker from "@/components/ui/SelectPicker";
import CommentSection from "@/components/ui/CommentSection";
import PersonPicker from "./PersonPicker";
import TasksPicker from "./TasksPicker";

function toDateInputValue(d) {
  if (!d) return null;
  return new Date(d).toISOString().slice(0, 10);
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const workspaceId = useWorkspaceStore((s) => s.currentId);

  const [project, setProject] = useState(null);
  const [allTasks, setAllTasks] = useState([]);
  const [stageOptions, setStageOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved
  const saveTimeout = useRef(null);
  const pendingUpdates = useRef({});

  useEffect(() => {
    setLoading(true);
    Promise.all([getProject(id), listTasks(workspaceId), listStageOptions(workspaceId)])
      .then(([p, tasks, stages]) => {
        setProject(p);
        setAllTasks(tasks);
        setStageOptions(stages);
      })
      .finally(() => setLoading(false));
  }, [id, workspaceId]);

  async function handleCreateStageOption(label) {
    const option = await createStageOption(workspaceId, { label });
    setStageOptions((prev) => [...prev, option]);
    return option;
  }

  async function handleToggleTask(task) {
    const linking = task.projectId !== id;
    const updated = await updateTask(task._id, { projectId: linking ? id : null });
    setAllTasks((prev) => prev.map((t) => (t._id === task._id ? updated : t)));
  }

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

  function patchFields(updates) {
    setProject((prev) => ({ ...prev, ...updates }));
    persist(updates);
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
            <Flag01Icon size={18} strokeWidth={1.8} />
            Stage
          </span>
          <SelectPicker
            options={stageOptions}
            value={project.stage}
            onSelect={(key) => patchField("stage", key)}
            onCreate={handleCreateStageOption}
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="flex w-28 shrink-0 items-center gap-1.5 text-(--color-text-muted)">
            <Calendar03Icon size={18} strokeWidth={1.8} />
            Timeline
          </span>
          <DateRangePicker
            startDate={toDateInputValue(project.startDate)}
            endDate={toDateInputValue(project.endDate)}
            onChange={patchFields}
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="flex w-28 shrink-0 items-center gap-1.5 text-(--color-text-muted)">
            <UserIcon size={18} strokeWidth={1.8} />
            Lead
          </span>
          <PersonPicker
            value={project.lead || null}
            onChange={(name) => patchField("lead", name ?? "")}
          />
        </div>

        <div className="flex items-start gap-3">
          <span className="flex w-28 shrink-0 items-center gap-1.5 pt-1 text-(--color-text-muted)">
            <Task01Icon size={18} strokeWidth={1.8} />
            Tasks
          </span>
          <TasksPicker
            allTasks={allTasks}
            selectedTasks={allTasks.filter((t) => t.projectId === id)}
            onToggle={handleToggleTask}
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

      <div className="mt-8 border-t border-(--color-border) pt-6">
        <CommentSection targetType="project" targetId={id} />
      </div>
    </div>
  );
}
