import { Calendar03Icon, RocketIcon } from "hugeicons-react";

export default function MeetingsPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-10 py-8 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-(--color-accent)/10 text-(--color-accent)">
        <Calendar03Icon size={30} strokeWidth={1.8} />
      </div>
      <h1 className="mb-2 flex items-center gap-2 text-2xl font-semibold">
        Meetings
        <RocketIcon size={20} strokeWidth={1.8} className="text-(--color-accent)" />
      </h1>
      <p className="max-w-sm text-sm text-(--color-text-muted)">
        Coming soon — schedule and manage meetings right from Harjeeo.
      </p>
    </div>
  );
}
