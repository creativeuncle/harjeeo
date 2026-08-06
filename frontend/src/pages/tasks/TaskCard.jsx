import { useNavigate } from "react-router-dom";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DocumentValidationIcon } from "hugeicons-react";
import { OPTION_COLOR_CLASSES } from "@/lib/propertyTypes";

function formatBadge(property, value) {
  if (value === null || value === undefined || value === "") return null;

  if (property.type === "select" || property.type === "status") {
    const option = property.options?.find((o) => o.id === value);
    if (!option) return null;
    return { label: option.label, className: OPTION_COLOR_CLASSES[option.color] ?? OPTION_COLOR_CLASSES.gray };
  }

  if (property.type === "multiSelect") {
    if (!Array.isArray(value) || value.length === 0) return null;
    const option = property.options?.find((o) => o.id === value[0]);
    if (!option) return null;
    const extra = value.length > 1 ? ` +${value.length - 1}` : "";
    return { label: `${option.label}${extra}`, className: OPTION_COLOR_CLASSES[option.color] ?? OPTION_COLOR_CLASSES.gray };
  }

  if (property.type === "checkbox") {
    if (!value) return null;
    return { label: property.name, className: OPTION_COLOR_CLASSES.gray };
  }

  if (property.type === "date") {
    return {
      label: new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      className: OPTION_COLOR_CLASSES.gray,
    };
  }

  if (property.type === "createdTime" || property.type === "createdBy" || property.type === "person") {
    return null;
  }

  return { label: String(value), className: OPTION_COLOR_CLASSES.gray };
}

export default function TaskCard({ task, properties = [] }) {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task._id, data: { status: task.status } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const badges = properties
    .map((property) => formatBadge(property, task.properties?.[property.key]))
    .filter(Boolean);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => !isDragging && navigate(`/tasks/${task._id}`)}
      className="flex cursor-pointer items-start gap-2 rounded-md border border-(--color-border) bg-(--color-canvas) px-3 py-2.5 text-sm hover:bg-black/[.02] dark:hover:bg-white/[.03]"
    >
      <DocumentValidationIcon
        size={16}
        strokeWidth={1.8}
        className="mt-0.5 shrink-0 text-(--color-text-muted)"
      />
      <div className="min-w-0 flex-1">
        <span className="block truncate">{task.title}</span>
        {badges.length > 0 && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            {badges.map((badge, i) => (
              <span
                key={i}
                className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${badge.className}`}
              >
                {badge.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
