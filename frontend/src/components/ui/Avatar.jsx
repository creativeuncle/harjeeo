import { MANUAL_STATUS_META } from "@/lib/presence";

const COLORS = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-pink-500",
  "bg-orange-500",
];

function colorFor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export default function Avatar({ name, size = 20, online, manualStatus }) {
  const initial = name?.trim()?.[0]?.toUpperCase() ?? "?";
  const dotClass = manualStatus
    ? (MANUAL_STATUS_META[manualStatus]?.dot ?? "bg-gray-400")
    : online
      ? "bg-emerald-500"
      : null;

  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <span
        style={{ width: size, height: size, fontSize: size * 0.5 }}
        className={`flex shrink-0 items-center justify-center rounded-full font-medium text-white ${colorFor(name ?? "?")}`}
      >
        {initial}
      </span>
      {dotClass && (
        <span
          style={{ width: Math.max(6, size * 0.32), height: Math.max(6, size * 0.32) }}
          className={`absolute right-0 bottom-0 rounded-full ring-2 ring-(--color-canvas) ${dotClass}`}
        />
      )}
    </span>
  );
}
