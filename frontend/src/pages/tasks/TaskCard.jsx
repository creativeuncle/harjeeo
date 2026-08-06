import { useNavigate } from "react-router-dom";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DocumentValidationIcon } from "hugeicons-react";

export default function TaskCard({ task }) {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task._id, data: { status: task.status } });

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
      onClick={() => !isDragging && navigate(`/tasks/${task._id}`)}
      className="flex cursor-pointer items-center gap-2 rounded-md border border-(--color-border) bg-(--color-canvas) px-3 py-2.5 text-sm hover:bg-black/[.02] dark:hover:bg-white/[.03]"
    >
      <DocumentValidationIcon
        size={16}
        strokeWidth={1.8}
        className="shrink-0 text-(--color-text-muted)"
      />
      <span className="truncate">{task.title}</span>
    </div>
  );
}
