import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Target02Icon,
  Add01Icon,
  TypeCursorIcon,
  Flag01Icon,
  Calendar03Icon,
  UserIcon,
  Task01Icon,
  DocumentValidationIcon,
} from "hugeicons-react";
import { listProjects, createProject, updateProject } from "@/lib/projects";
import { listTasks } from "@/lib/tasks";
import { listStageOptions, createStageOption } from "@/lib/projectStageOptions";
import DateRangePicker from "@/components/ui/DateRangePicker";
import SelectPicker from "@/components/ui/SelectPicker";
import { useWorkspaceStore } from "@/store/workspaceStore";

function toDateInputValue(d) {
  if (!d) return null;
  return new Date(d).toISOString().slice(0, 10);
}

const COLUMNS = [
  { key: "name", label: "Name", icon: TypeCursorIcon },
  { key: "stage", label: "Stage", icon: Flag01Icon },
  { key: "timeline", label: "Timeline", icon: Calendar03Icon },
  { key: "lead", label: "Lead", icon: UserIcon },
  { key: "tasks", label: "Tasks", icon: Task01Icon },
];

export default function ProjectsPage() {
  const navigate = useNavigate();
  const workspaceId = useWorkspaceStore((s) => s.currentId);
  const [projects, setProjects] = useState([]);
  const [tasksByProject, setTasksByProject] = useState({});
  const [stageOptions, setStageOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!workspaceId) {
      setProjects([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      listProjects(workspaceId),
      listTasks(workspaceId),
      listStageOptions(workspaceId),
    ])
      .then(([projs, tasks, stages]) => {
        setProjects(projs);
        const grouped = {};
        for (const task of tasks) {
          if (!task.projectId) continue;
          (grouped[task.projectId] ??= []).push(task);
        }
        setTasksByProject(grouped);
        setStageOptions(stages);
      })
      .finally(() => setLoading(false));
  }, [workspaceId]);

  async function handleCreateStageOption(label) {
    const option = await createStageOption(workspaceId, { label });
    setStageOptions((prev) => [...prev, option]);
    return option;
  }

  async function handleNewProject() {
    if (creating || !workspaceId) return;
    setCreating(true);
    try {
      const project = await createProject(workspaceId);
      navigate(`/projects/${project._id}`);
    } finally {
      setCreating(false);
    }
  }

  function patchProject(id, updates) {
    setProjects((prev) => prev.map((p) => (p._id === id ? { ...p, ...updates } : p)));
    updateProject(id, updates).catch(() => {});
  }

  return (
    <div className="px-10 py-8">
      <div className="mb-6 flex items-center gap-2">
        <Target02Icon size={26} strokeWidth={1.8} />
        <h1 className="text-2xl font-semibold">Projects</h1>
      </div>

      {!loading && projects.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-(--color-border) text-left text-(--color-text-muted)">
                {COLUMNS.map((col) => (
                  <th key={col.key} className="whitespace-nowrap py-2 pr-4 font-medium">
                    <span className="flex items-center gap-1.5">
                      <col.icon size={14} strokeWidth={1.8} />
                      {col.label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => {
                const linkedTasks = tasksByProject[project._id] ?? [];
                return (
                  <tr
                    key={project._id}
                    className="border-b border-(--color-border) hover:bg-black/[.02] dark:hover:bg-white/[.03]"
                  >
                    <td
                      onClick={() => navigate(`/projects/${project._id}`)}
                      className="cursor-pointer whitespace-nowrap py-2.5 pr-4"
                    >
                      <span className="mr-1.5">{project.icon}</span>
                      {project.title}
                    </td>

                    <td className="py-2.5 pr-4" onClick={(e) => e.stopPropagation()}>
                      <SelectPicker
                        options={stageOptions}
                        value={project.stage}
                        onSelect={(key) => patchProject(project._id, { stage: key })}
                        onCreate={handleCreateStageOption}
                      />
                    </td>

                    <td
                      className="whitespace-nowrap py-2.5 pr-4 text-(--color-text-muted)"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DateRangePicker
                        startDate={toDateInputValue(project.startDate)}
                        endDate={toDateInputValue(project.endDate)}
                        onChange={(updates) => patchProject(project._id, updates)}
                      />
                    </td>

                    <td className="py-2.5 pr-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        value={project.lead}
                        placeholder="Empty"
                        onChange={(e) => patchProject(project._id, { lead: e.target.value })}
                        className="w-28 rounded border border-transparent bg-transparent px-1 py-0.5 text-(--color-text-muted) outline-none hover:border-(--color-border) focus:border-(--color-border)"
                      />
                    </td>

                    <td className="whitespace-nowrap py-2.5 pr-4">
                      {linkedTasks.length === 0 ? (
                        <span className="text-(--color-text-muted)">—</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/tasks/${linkedTasks[0]._id}`);
                            }}
                            className="inline-flex items-center gap-1 font-medium underline decoration-(--color-border) underline-offset-2"
                          >
                            <DocumentValidationIcon size={14} strokeWidth={1.8} />
                            {linkedTasks[0].title}
                          </button>
                          {linkedTasks.length > 1 && (
                            <span className="text-(--color-text-muted)">
                              +{linkedTasks.length - 1}
                            </span>
                          )}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <button
        type="button"
        onClick={handleNewProject}
        disabled={creating}
        className="mt-3 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-(--color-text-muted) hover:bg-black/[.02] disabled:opacity-60 dark:hover:bg-white/[.03]"
      >
        <Add01Icon size={16} strokeWidth={1.8} />
        {creating ? "Creating…" : "New project"}
      </button>
    </div>
  );
}
