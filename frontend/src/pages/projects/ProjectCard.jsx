import { useNavigate } from "react-router-dom";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import AvatarStack from "@/components/ui/AvatarStack";

export default function ProjectCard({ project }) {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project._id,
    data: { stage: project.stage },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => !isDragging && navigate(`/projects/${project._id}`)}
      className="flex cursor-pointer flex-col gap-2 rounded-md border border-(--color-border) bg-(--color-canvas) px-3 py-2.5 text-sm hover:bg-black/[.02] dark:hover:bg-white/[.03]"
    >
      <span className="flex items-center gap-1.5 truncate">
        <span>{project.icon}</span>
        {project.title}
      </span>
      {project.leads?.length > 0 && <AvatarStack people={project.leads} size={20} />}
    </div>
  );
}
