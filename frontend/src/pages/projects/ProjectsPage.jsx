import { useEffect, useMemo, useState } from "react";
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
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { listProjects, createProject, updateProject } from "@/lib/projects";
import { listTasks } from "@/lib/tasks";
import { listStageOptions, createStageOption } from "@/lib/projectStageOptions";
import { OPTION_COLOR_CLASSES, OPTION_DOT_CLASSES } from "@/lib/propertyTypes";
import DateRangePicker from "@/components/ui/DateRangePicker";
import SelectPicker from "@/components/ui/SelectPicker";
import ViewSwitcher from "@/components/ui/ViewSwitcher";
import CalendarView from "@/components/ui/CalendarView";
import FilterSortBar from "@/components/ui/FilterSortBar";
import LeadPicker from "./LeadPicker";
import ProjectColumn from "./ProjectColumn";
import { useWorkspaceStore } from "@/store/workspaceStore";

const VIEW_STORAGE_KEY = "harjeeo_projects_view";

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

const SORT_OPTIONS = [
  { key: "name", label: "Name" },
  { key: "stage", label: "Stage" },
  { key: "date", label: "Timeline" },
];

export default function ProjectsPage() {
  const navigate = useNavigate();
  const workspaceId = useWorkspaceStore((s) => s.currentId);
  const [projects, setProjects] = useState([]);
  const [tasksByProject, setTasksByProject] = useState({});
  const [stageOptions, setStageOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [view, setView] = useState(() => localStorage.getItem(VIEW_STORAGE_KEY) ?? "table");
  const [filterValues, setFilterValues] = useState({ stage: new Set(), lead: new Set() });
  const [sortValue, setSortValue] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

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

  function handleViewChange(next) {
    setView(next);
    localStorage.setItem(VIEW_STORAGE_KEY, next);
  }

  function handleToggleFilter(groupKey, optionKey) {
    setFilterValues((prev) => {
      const next = new Set(prev[groupKey]);
      if (next.has(optionKey)) next.delete(optionKey);
      else next.add(optionKey);
      return { ...prev, [groupKey]: next };
    });
  }

  function handleClearFilters() {
    setFilterValues({ stage: new Set(), lead: new Set() });
  }

  const leadFilterOptions = useMemo(() => {
    const seen = new Map();
    for (const project of projects) {
      for (const lead of project.leads ?? []) {
        if (!seen.has(lead._id)) seen.set(lead._id, lead.name);
      }
    }
    return [...seen.entries()].map(([key, label]) => ({ key, label }));
  }, [projects]);

  const visibleProjects = useMemo(() => {
    let list = projects;
    if (filterValues.stage?.size) {
      list = list.filter((p) => filterValues.stage.has(p.stage));
    }
    if (filterValues.lead?.size) {
      list = list.filter((p) => p.leads?.some((l) => filterValues.lead.has(l._id)));
    }
    if (sortValue) {
      list = [...list].sort((a, b) => {
        let cmp = 0;
        if (sortValue.key === "name") cmp = (a.title || "").localeCompare(b.title || "");
        else if (sortValue.key === "stage") cmp = (a.stage || "").localeCompare(b.stage || "");
        else if (sortValue.key === "date")
          cmp = new Date(a.endDate || 0) - new Date(b.endDate || 0);
        return sortValue.dir === "asc" ? cmp : -cmp;
      });
    }
    return list;
  }, [projects, filterValues, sortValue]);

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

  function handleLeadsChange(projectId, people) {
    setProjects((prev) => prev.map((p) => (p._id === projectId ? { ...p, leads: people } : p)));
    updateProject(projectId, { leads: people.map((p) => p._id) }).catch(() => {});
  }

  function findStageOf(id) {
    return visibleProjects.find((p) => p._id === id)?.stage;
  }

  function handleBoardDragEnd(event) {
    const { active, over } = event;
    if (!over) return;
    const sourceStage = active.data.current?.stage ?? findStageOf(active.id);
    let destStage;
    if (String(over.id).startsWith("stage:")) {
      destStage = String(over.id).slice(6);
    } else {
      destStage = findStageOf(over.id);
    }
    if (!destStage || destStage === sourceStage) return;
    patchProject(active.id, { stage: destStage });
  }

  const projectsByStage = useMemo(() => {
    const grouped = Object.fromEntries(stageOptions.map((s) => [s.key, []]));
    for (const project of visibleProjects) {
      (grouped[project.stage] ??= []).push(project);
    }
    return grouped;
  }, [visibleProjects, stageOptions]);

  const calendarItems = useMemo(
    () =>
      visibleProjects.map((project) => {
        const stageOption = stageOptions.find((s) => s.key === project.stage);
        return {
          id: project._id,
          date: project.endDate,
          title: project.title,
          icon: project.icon,
          colorClass: stageOption ? OPTION_COLOR_CLASSES[stageOption.color] : undefined,
        };
      }),
    [visibleProjects, stageOptions]
  );

  return (
    <div className="px-10 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target02Icon size={26} strokeWidth={1.8} />
          <h1 className="text-2xl font-semibold">Projects</h1>
        </div>
        <ViewSwitcher value={view} onChange={handleViewChange} />
      </div>

      <FilterSortBar
        filterGroups={[
          {
            key: "stage",
            label: "Stage",
            options: stageOptions.map((s) => ({ key: s.key, label: s.label })),
          },
          { key: "lead", label: "Lead", options: leadFilterOptions },
        ]}
        filterValues={filterValues}
        onToggleFilter={handleToggleFilter}
        onClearFilters={handleClearFilters}
        sortOptions={view === "table" ? SORT_OPTIONS : []}
        sortValue={sortValue}
        onSortChange={setSortValue}
      />

      {!loading && view === "table" && visibleProjects.length > 0 && (
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
              {visibleProjects.map((project) => {
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
                      <LeadPicker
                        value={project.leads ?? []}
                        onChange={(people) => handleLeadsChange(project._id, people)}
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

      {!loading && view === "board" && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragEnd={handleBoardDragEnd}
        >
          <div className="grid grid-cols-4 gap-4">
            {stageOptions.map((stage) => (
              <ProjectColumn
                key={stage.key}
                stage={{ ...stage, dotClass: OPTION_DOT_CLASSES[stage.color] }}
                projects={projectsByStage[stage.key] ?? []}
              />
            ))}
          </div>
        </DndContext>
      )}

      {!loading && view === "calendar" && (
        <CalendarView
          items={calendarItems}
          onItemClick={(item) => navigate(`/projects/${item.id}`)}
          emptyLabel="No timeline"
        />
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
