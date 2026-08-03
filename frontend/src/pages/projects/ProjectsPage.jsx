import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Target02Icon, Add01Icon } from "hugeicons-react";
import { listProjects, createProject, STAGE_LABELS } from "@/lib/projects";

const STAGE_STYLES = {
  planning: "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300",
  in_progress: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  done: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
};

function formatTimeline(project) {
  if (!project.startDate && !project.endDate) return "";
  const fmt = (d) =>
    new Date(d).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  if (project.startDate && project.endDate) {
    return `${fmt(project.startDate)} → ${fmt(project.endDate)}`;
  }
  return fmt(project.startDate ?? project.endDate);
}

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    listProjects()
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

  async function handleNewProject() {
    if (creating) return;
    setCreating(true);
    try {
      const project = await createProject();
      navigate(`/projects/${project._id}`);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="px-10 py-8">
      <div className="mb-6 flex items-center gap-2">
        <Target02Icon size={26} strokeWidth={1.8} />
        <h1 className="text-2xl font-semibold">Projects</h1>
      </div>

      {!loading && projects.length > 0 && (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-(--color-border) text-left text-(--color-text-muted)">
              <th className="py-2 pr-4 font-medium">Name</th>
              <th className="py-2 pr-4 font-medium">Stage</th>
              <th className="py-2 pr-4 font-medium">Timeline</th>
              <th className="py-2 pr-4 font-medium">Lead</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr
                key={project._id}
                onClick={() => navigate(`/projects/${project._id}`)}
                className="cursor-pointer border-b border-(--color-border) hover:bg-black/[.02] dark:hover:bg-white/[.03]"
              >
                <td className="py-2.5 pr-4">
                  <span className="mr-1.5">{project.icon}</span>
                  {project.title}
                </td>
                <td className="py-2.5 pr-4">
                  {project.stage !== "not_started" && (
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${STAGE_STYLES[project.stage] ?? ""}`}
                    >
                      {STAGE_LABELS[project.stage]}
                    </span>
                  )}
                </td>
                <td className="py-2.5 pr-4 text-(--color-text-muted)">
                  {formatTimeline(project)}
                </td>
                <td className="py-2.5 pr-4 text-(--color-text-muted)">
                  {project.lead}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
