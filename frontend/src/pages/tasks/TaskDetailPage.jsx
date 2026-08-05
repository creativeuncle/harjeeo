import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Delete02Icon,
  DocumentValidationIcon,
  Target02Icon,
  Calendar03Icon,
  LinkSquare01Icon,
  Alert02Icon,
} from "hugeicons-react";
import {
  getTask,
  updateTask,
  deleteTask,
  listTasks,
  listTaskProperties,
  updateTaskProperty,
  createTaskProperty,
  deleteTaskProperty,
} from "@/lib/tasks";
import { listProjects } from "@/lib/projects";
import { listMembers } from "@/lib/workspaces";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { PROPERTY_TYPE_META } from "@/lib/propertyTypes";
import RichTextEditor from "@/components/editor/RichTextEditor";
import CommentSection from "@/components/ui/CommentSection";
import SharePopover from "@/components/ui/SharePopover";
import ExportMenu from "@/components/ui/ExportMenu";
import DatePicker from "@/components/ui/DatePicker";
import TasksPicker from "@/pages/projects/TasksPicker";
import AddPropertyMenu from "./AddPropertyMenu";
import PropertyValue from "./PropertyValue";
import PropertyMenu from "./PropertyMenu";

function toDateInputValue(d) {
  if (!d) return null;
  return new Date(d).toISOString().slice(0, 10);
}

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const workspaceId = useWorkspaceStore((s) => s.currentId);

  const [task, setTask] = useState(null);
  const [properties, setProperties] = useState([]);
  const [projects, setProjects] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [mentionItems, setMentionItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState("idle");
  const saveTimeout = useRef(null);
  const pendingUpdates = useRef({});
  const pendingProps = useRef({});

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getTask(id),
      listTaskProperties(workspaceId),
      listProjects(workspaceId),
      listTasks(workspaceId),
      listMembers(workspaceId),
    ])
      .then(([t, props, projs, tasks, membersData]) => {
        setTask(t);
        setProperties(props);
        setProjects(projs);
        setAllTasks(tasks);
        setMentionItems(
          membersData.members.map((m) => m.user).filter(Boolean).map((u) => ({ id: u._id, name: u.name }))
        );
      })
      .finally(() => setLoading(false));
  }, [id, workspaceId]);

  const persist = useCallback(
    (updates, propUpdates) => {
      if (updates) pendingUpdates.current = { ...pendingUpdates.current, ...updates };
      if (propUpdates)
        pendingProps.current = { ...pendingProps.current, ...propUpdates };

      setSaveState("saving");
      clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(async () => {
        const body = { ...pendingUpdates.current };
        if (Object.keys(pendingProps.current).length) {
          body.properties = pendingProps.current;
        }
        pendingUpdates.current = {};
        pendingProps.current = {};
        await updateTask(id, body);
        setSaveState("saved");
      }, 500);
    },
    [id]
  );

  function patchField(field, value) {
    setTask((prev) => ({ ...prev, [field]: value }));
    persist({ [field]: value });
  }

  function patchProperty(key, value) {
    setTask((prev) => ({
      ...prev,
      properties: { ...prev.properties, [key]: value },
    }));
    persist(null, { [key]: value });
  }

  function handleToggleDependency(depTask) {
    const currentIds = (task.dependsOn ?? []).map((d) => d._id);
    const isSelected = currentIds.includes(depTask._id);
    const newIds = isSelected
      ? currentIds.filter((depId) => depId !== depTask._id)
      : [...currentIds, depTask._id];
    const newFull = allTasks.filter((t) => newIds.includes(t._id));
    setTask((prev) => ({ ...prev, dependsOn: newFull }));
    persist({ dependsOn: newIds });
  }

  async function handleAddProperty({ name, type }) {
    const property = await createTaskProperty(workspaceId, { name, type });
    setProperties((prev) => [...prev, property]);
  }

  async function handleAddOption(property, option) {
    const updated = await updateTaskProperty(property._id, {
      options: [...(property.options ?? []), option],
    });
    setProperties((prev) => prev.map((p) => (p._id === property._id ? updated : p)));
  }

  async function handleRenameProperty(property, name) {
    const updated = await updateTaskProperty(property._id, { name });
    setProperties((prev) => prev.map((p) => (p._id === property._id ? updated : p)));
  }

  async function handleEditPropertyOptions(property, options) {
    const updated = await updateTaskProperty(property._id, { options });
    setProperties((prev) => prev.map((p) => (p._id === property._id ? updated : p)));
  }

  async function handleDuplicateProperty(property) {
    const duplicate = await createTaskProperty(workspaceId, {
      name: `${property.name} copy`,
      type: property.type,
      options: property.options,
    });
    setProperties((prev) => [...prev, duplicate]);
  }

  async function handleDeleteProperty(property) {
    await deleteTaskProperty(property._id);
    setProperties((prev) => prev.filter((p) => p._id !== property._id));
  }

  async function handleDelete() {
    if (!window.confirm("Delete this task? This can't be undone.")) return;
    await deleteTask(id);
    navigate("/tasks", { replace: true });
  }

  if (loading) {
    return <div className="px-10 py-8 text-sm text-(--color-text-muted)">Loading…</div>;
  }

  if (!task) {
    return (
      <div className="px-10 py-8 text-sm text-(--color-text-muted)">Task not found.</div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-10 py-8">
      <div className="mb-4 flex items-center gap-1.5 text-sm text-(--color-text-muted)">
        <Link to="/tasks" className="hover:text-(--color-text)">
          Tasks
        </Link>
        <span>/</span>
        <span className="truncate">{task.title}</span>
      </div>

      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs text-(--color-text-muted)">
          {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : ""}
        </span>
        <div className="flex items-center gap-1 print:hidden">
          <ExportMenu title={task.title} content={task.content} />
          <SharePopover
            isPublic={task.isPublic}
            onToggle={(next) => patchField("isPublic", next)}
            shareType="tasks"
            id={id}
          />
          <button
            type="button"
            onClick={handleDelete}
            title="Delete task"
            className="rounded-md p-1.5 text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
          >
            <Delete02Icon size={16} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2 text-3xl font-bold">
        <DocumentValidationIcon size={28} strokeWidth={1.8} className="text-(--color-text-muted)" />
        <input
          value={task.title}
          onChange={(e) => patchField("title", e.target.value)}
          placeholder="New task"
          className="w-full border-none bg-transparent outline-none placeholder:text-(--color-text-muted)"
        />
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-3">
          <span className="flex w-32 shrink-0 items-center gap-1.5 text-(--color-text-muted)">
            <Target02Icon size={15} strokeWidth={1.8} />
            Project
          </span>
          <select
            value={task.projectId ?? ""}
            onChange={(e) => patchField("projectId", e.target.value || null)}
            className="rounded-md border border-(--color-border) bg-(--color-canvas) px-2 py-1 text-sm outline-none"
          >
            <option value="">Empty</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.icon} {p.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex w-32 shrink-0 items-center gap-1.5 text-(--color-text-muted)">
            <Calendar03Icon size={15} strokeWidth={1.8} />
            Due date
          </span>
          <DatePicker
            value={toDateInputValue(task.dueDate)}
            onChange={(date) => patchField("dueDate", date)}
          />
        </div>

        <div className="flex items-start gap-3">
          <span className="flex w-32 shrink-0 items-center gap-1.5 pt-1 text-(--color-text-muted)">
            <LinkSquare01Icon size={15} strokeWidth={1.8} />
            Depends on
          </span>
          <div className="min-w-0 flex-1">
            <TasksPicker
              allTasks={allTasks.filter((t) => t._id !== id)}
              selectedTasks={task.dependsOn ?? []}
              onToggle={handleToggleDependency}
            />
            {(task.dependsOn ?? []).some((d) => d.status !== "done") && (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                <Alert02Icon size={13} strokeWidth={1.8} />
                Can't be marked Done until every dependency is Done
              </div>
            )}
          </div>
        </div>

        {properties.map((property) => {
          const Icon = PROPERTY_TYPE_META[property.type]?.icon;
          return (
            <div key={property._id} className="flex items-start gap-3">
              <PropertyMenu
                property={property}
                icon={Icon}
                onRename={(name) => handleRenameProperty(property, name)}
                onEditOptions={(options) => handleEditPropertyOptions(property, options)}
                onDuplicate={() => handleDuplicateProperty(property)}
                onDelete={() => handleDeleteProperty(property)}
              />
              <div className="min-w-0 flex-1 pt-0.5">
                <PropertyValue
                  property={property}
                  task={task}
                  onChange={(value) => patchProperty(property.key, value)}
                  onAddOption={handleAddOption}
                />
              </div>
            </div>
          );
        })}

        <div className="pl-1">
          <AddPropertyMenu onCreate={handleAddProperty} />
        </div>
      </div>

      <div className="mt-8 border-t border-(--color-border) pt-6">
        <RichTextEditor
          content={task.content ?? undefined}
          onChange={(json) => patchField("content", json)}
          placeholder="Add a description. Type '/' for commands…"
          mentionItems={mentionItems}
          collabDocName={`task:${id}`}
        />
      </div>

      <div className="mt-8 border-t border-(--color-border) pt-6 print:hidden">
        <CommentSection targetType="task" targetId={id} />
      </div>
    </div>
  );
}
