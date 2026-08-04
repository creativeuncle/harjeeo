import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Delete02Icon, DocumentValidationIcon, Target02Icon } from "hugeicons-react";
import {
  getTask,
  updateTask,
  deleteTask,
  listTaskProperties,
  updateTaskProperty,
  createTaskProperty,
  deleteTaskProperty,
} from "@/lib/tasks";
import { listProjects } from "@/lib/projects";
import { PROPERTY_TYPE_META } from "@/lib/propertyTypes";
import RichTextEditor from "@/components/editor/RichTextEditor";
import AddPropertyMenu from "./AddPropertyMenu";
import PropertyValue from "./PropertyValue";
import PropertyMenu from "./PropertyMenu";

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [properties, setProperties] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState("idle");
  const saveTimeout = useRef(null);
  const pendingUpdates = useRef({});
  const pendingProps = useRef({});

  useEffect(() => {
    setLoading(true);
    Promise.all([getTask(id), listTaskProperties(), listProjects()])
      .then(([t, props, projs]) => {
        setTask(t);
        setProperties(props);
        setProjects(projs);
      })
      .finally(() => setLoading(false));
  }, [id]);

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

  async function handleAddProperty({ name, type }) {
    const property = await createTaskProperty({ name, type });
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
    const duplicate = await createTaskProperty({
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
        <button
          type="button"
          onClick={handleDelete}
          title="Delete task"
          className="rounded-md p-1.5 text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
        >
          <Delete02Icon size={16} strokeWidth={1.8} />
        </button>
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
        />
      </div>
    </div>
  );
}
