import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import ProjectCard from "./ProjectCard";

export default function ProjectColumn({ stage, projects }) {
  const { setNodeRef } = useDroppable({ id: `stage:${stage.key}` });

  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-sm font-medium">
        <span className={`h-2 w-2 rounded-full ${stage.dotClass}`} />
        {stage.label}
        <span className="text-(--color-text-muted)">{projects.length}</span>
      </div>

      <SortableContext
        items={projects.map((p) => p._id)}
        strategy={verticalListSortingStrategy}
      >
        <div ref={setNodeRef} className="flex min-h-[8px] flex-col gap-2">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
