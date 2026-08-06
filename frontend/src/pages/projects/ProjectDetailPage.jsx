import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Delete02Icon,
  Flag01Icon,
  Calendar03Icon,
  UserIcon,
  Task01Icon,
  LockIcon,
} from "hugeicons-react";
import { getProject, updateProject, deleteProject } from "@/lib/projects";
import { listTasks, updateTask } from "@/lib/tasks";
import { listStageOptions, createStageOption } from "@/lib/projectStageOptions";
import { listMembers } from "@/lib/workspaces";
import { useWorkspaceStore } from "@/store/workspaceStore";
import RichTextEditor from "@/components/editor/RichTextEditor";
import IconPicker from "@/components/ui/IconPicker";
import DateRangePicker from "@/components/ui/DateRangePicker";
import SelectPicker from "@/components/ui/SelectPicker";
import CommentSection from "@/components/ui/CommentSection";
import SharePopover from "@/components/ui/SharePopover";
import ExportMenu from "@/components/ui/ExportMenu";
import VersionHistoryPopover from "@/components/ui/VersionHistoryPopover";
import ManageAccessPopover from "@/components/ui/ManageAccessPopover";
import LeadPicker from "./LeadPicker";
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
  const [mentionItems, setMentionItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved
  const saveTimeout = useRef(null);
  const pendingUpdates = useRef({});

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getProject(id),
      listTasks(workspaceId),
      listStageOptions(workspaceId),
      listMembers(workspaceId),
    ])
      .then(([p, tasks, stages, membersData]) => {
        setProject(p);
        setAllTasks(tasks);
        setStageOptions(stages);
        setMentionItems(
          membersData.members.map((m) => m.user).filter(Boolean).map((u) => ({ id: u._id, name: u.name }))
        );
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

  function handleLeadsChange(people) {
    setProject((prev) => ({ ...prev, leads: people }));
    persist({ leads: people.map((p) => p._id) });
  }

  async function handleDelete() {
    if (!window.confirm("Move this project to trash? You can restore it within 30 days.")) return;
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

  const canEdit = project.canEdit !== false;

  return (
    <div className="mx-auto max-w-3xl px-10 py-8">
      {!canEdit && (
        <div className="mb-4 flex items-center gap-2 rounded-md bg-black/5 px-3 py-2 text-xs text-(--color-text-muted) dark:bg-white/10">
          <LockIcon size={14} strokeWidth={1.8} />
          You have viewer access to this project — it's read-only.
        </div>
      )}

      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs text-(--color-text-muted)">
          {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : ""}
        </span>
        <div className="flex items-center gap-1 print:hidden">
          {project.canManageAccess && (
            <ManageAccessPopover
              projectId={id}
              workspaceId={workspaceId}
              memberRoles={project.memberRoles}
              onChange={setProject}
            />
          )}
          <VersionHistoryPopover
            targetType="project"
            targetId={id}
            onRestore={(target) => setProject((prev) => ({ ...prev, content: target.content }))}
          />
          <ExportMenu title={project.title} content={project.content} />
          <SharePopover
            isPublic={project.isPublic}
            onToggle={(next) => patchField("isPublic", next)}
            shareType="projects"
            id={id}
          />
          {canEdit && (
            <button
              type="button"
              onClick={handleDelete}
              title="Delete project"
              className="rounded-md p-1.5 text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
            >
              <Delete02Icon size={16} strokeWidth={1.8} />
            </button>
          )}
        </div>
      </div>

      <div className={!canEdit ? "pointer-events-none" : ""}>
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
          <LeadPicker value={project.leads ?? []} onChange={handleLeadsChange} />
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
      </div>

      <div className="mt-8 border-t border-(--color-border) pt-6">
        <RichTextEditor
          content={project.content ?? undefined}
          onChange={(json) => patchField("content", json)}
          placeholder="Write a description, notes, or plan for this project. Type '/' for commands…"
          mentionItems={mentionItems}
          collabDocName={`project:${id}`}
          editable={canEdit}
        />
      </div>

      <div className="mt-8 border-t border-(--color-border) pt-6 print:hidden">
        <CommentSection targetType="project" targetId={id} />
      </div>
    </div>
  );
}
