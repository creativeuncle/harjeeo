import Avatar from "./Avatar";

export default function AvatarStack({ people, size = 24, max = 4 }) {
  const shown = people.slice(0, max);
  const overflow = people.length - shown.length;

  return (
    <span className="inline-flex items-center">
      {shown.map((person, i) => (
        <span
          key={person._id}
          style={{ marginLeft: i === 0 ? 0 : -size * 0.35, zIndex: shown.length - i }}
          className="rounded-full ring-2 ring-(--color-canvas)"
        >
          {person.avatarUrl ? (
            <img
              src={person.avatarUrl}
              alt={person.name}
              style={{ width: size, height: size }}
              className="rounded-full object-cover"
            />
          ) : (
            <Avatar name={person.name} size={size} />
          )}
        </span>
      ))}
      {overflow > 0 && (
        <span
          style={{ marginLeft: -size * 0.35, width: size, height: size, fontSize: size * 0.4 }}
          className="flex shrink-0 items-center justify-center rounded-full bg-black/10 font-medium ring-2 ring-(--color-canvas) dark:bg-white/15"
        >
          +{overflow}
        </span>
      )}
    </span>
  );
}
