import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Note01Icon, Add01Icon } from "hugeicons-react";
import { listNotes, createNote } from "@/lib/notes";
import { useWorkspaceStore } from "@/store/workspaceStore";

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

  return (
    <div className="px-10 py-8">
      <div className="mb-6 flex items-center gap-2">
        <Note01Icon size={26} strokeWidth={1.8} />
        <h1 className="text-2xl font-semibold">Notes</h1>
      </div>

      {!loading && notes.length > 0 && (
        <div className="flex flex-col">
          {notes.map((note) => (
            <button
              key={note._id}
              type="button"
              onClick={() => navigate(`/notes/${note._id}`)}
              className="flex items-center gap-2 border-b border-(--color-border) py-2.5 text-left text-sm hover:bg-black/[.02] dark:hover:bg-white/[.03]"
            >
              <span>{note.icon}</span>
              <span className="font-medium">{note.title || "Untitled"}</span>
            </button>
          ))}
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
