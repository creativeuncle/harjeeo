import { Target02Icon, Add01Icon, DocumentValidationIcon } from "hugeicons-react";

const PROJECTS = [
  { name: "Your first project", stage: null, timeline: null, task: "Update homepage copy" },
  {
    name: "Website Redesign",
    stage: "In Progress",
    timeline: "May 8, 2026 → May 22, 2026",
    task: "Write FAQ for launch",
  },
  {
    name: "Mobile App Launch",
    stage: "Planning",
    timeline: "October 1, 2026 → December …",
    task: "Define MVP feature scope",
  },
];

const STAGE_STYLES = {
  "In Progress": "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  Planning: "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300",
};

export default function ProjectsPage() {
  return (
    <div className="px-10 py-8">
      <div className="mb-6 flex items-center gap-2">
        <Target02Icon size={26} strokeWidth={1.8} />
        <h1 className="text-2xl font-semibold">Projects</h1>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-(--color-border) text-left text-(--color-text-muted)">
            <th className="py-2 pr-4 font-medium">Name</th>
            <th className="py-2 pr-4 font-medium">Stage</th>
            <th className="py-2 pr-4 font-medium">Timeline</th>
            <th className="py-2 pr-4 font-medium">Tasks</th>
          </tr>
        </thead>
        <tbody>
          {PROJECTS.map((p) => (
            <tr key={p.name} className="border-b border-(--color-border)">
              <td className="py-2.5 pr-4">{p.name}</td>
              <td className="py-2.5 pr-4">
                {p.stage && (
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${STAGE_STYLES[p.stage] ?? ""}`}
                  >
                    {p.stage}
                  </span>
                )}
              </td>
              <td className="py-2.5 pr-4 text-(--color-text-muted)">
                {p.timeline}
              </td>
              <td className="py-2.5 pr-4">
                <span className="inline-flex items-center gap-1.5 font-medium underline decoration-(--color-border) underline-offset-2">
                  <DocumentValidationIcon size={14} strokeWidth={1.8} />
                  {p.task}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        type="button"
        className="mt-3 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-(--color-text-muted) hover:bg-black/[.02] dark:hover:bg-white/[.03]"
      >
        <Add01Icon size={16} strokeWidth={1.8} />
        New project
      </button>
    </div>
  );
}
