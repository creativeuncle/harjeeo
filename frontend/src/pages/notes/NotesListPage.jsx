import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Note01Icon,
  Add01Icon,
  TypeCursorIcon,
  Calendar03Icon,
  Location01Icon,
} from "hugeicons-react";
import { listNotes, createNote, updateNote } from "@/lib/notes";
import DatePicker from "@/components/ui/DatePicker";
import { useWorkspaceStore } from "@/store/workspaceStore";

function toDateInputValue(d) {
  if (!d) return null;
  return new Date(d).toISOString().slice(0, 10);
}

const COLUMNS = [
  { key: "name", label: "Name", icon: TypeCursorIcon },
  { key: "date", label: "Date", icon: Calendar03Icon },
  { key: "place", label: "Place", icon: Location01Icon },
];

export default function NotesListPage() {
  const navigate = useNavigate();
  const workspaceId = useWorkspaceStore((s) => s.currentId);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!workspaceId) {
      setNotes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    listNotes(workspaceId)
      .then(setNotes)
      .finally(() => setLoading(false));
  }, [workspaceId]);

  async function handleNewNote() {
    if (creating || !workspaceId) return;
    setCreating(true);
    try {
      const note = await createNote(workspaceId);
      navigate(`/notes/${note._id}`);
    } finally {
      setCreating(false);
    }
  }

  function patchNote(id, updates) {
    setNotes((prev) => prev.map((n) => (n._id === id ? { ...n, ...updates } : n)));
    updateNote(id, updates).catch(() => {});
  }

  return (
    <div className="px-10 py-8">
      <div className="mb-6 flex items-center gap-2">
        <Note01Icon size={26} strokeWidth={1.8} />
        <h1 className="text-2xl font-semibold">Notes</h1>
      </div>

      {!loading && notes.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
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
              {notes.map((note) => (
                <tr
                  key={note._id}
                  className="border-b border-(--color-border) hover:bg-black/[.02] dark:hover:bg-white/[.03]"
                >
                  <td
                    onClick={() => navigate(`/notes/${note._id}`)}
                    className="cursor-pointer whitespace-nowrap py-2.5 pr-4"
                  >
                    <span className="mr-1.5">{note.icon}</span>
                    <span className="font-medium">{note.title || "Untitled"}</span>
                  </td>

                  <td
                    className="whitespace-nowrap py-2.5 pr-4 text-(--color-text-muted)"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DatePicker
                      value={toDateInputValue(note.date)}
                      onChange={(date) => patchNote(note._id, { date })}
                    />
                  </td>

                  <td className="py-2.5 pr-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      value={note.place ?? ""}
                      placeholder="Empty"
                      onChange={(e) => patchNote(note._id, { place: e.target.value })}
                      className="w-40 rounded border border-transparent bg-transparent px-1 py-0.5 outline-none hover:border-(--color-border) focus:border-(--color-border) placeholder:text-(--color-text-muted)"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        type="button"
        onClick={handleNewNote}
        disabled={creating}
        className="mt-3 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-(--color-text-muted) hover:bg-black/[.02] disabled:opacity-60 dark:hover:bg-white/[.03]"
      >
        <Add01Icon size={16} strokeWidth={1.8} />
        {creating ? "Creating…" : "New note"}
      </button>
    </div>
  );
}
