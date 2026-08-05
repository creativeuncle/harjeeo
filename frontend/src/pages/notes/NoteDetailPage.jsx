import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Delete02Icon, Calendar03Icon, Location01Icon, Gps01Icon } from "hugeicons-react";
import { getNote, updateNote, deleteNote } from "@/lib/notes";
import { detectPlace } from "@/lib/geolocation";
import RichTextEditor from "@/components/editor/RichTextEditor";
import IconPicker from "@/components/ui/IconPicker";
import DatePicker from "@/components/ui/DatePicker";

function toDateInputValue(d) {
  if (!d) return null;
  return new Date(d).toISOString().slice(0, 10);
}

export default function NoteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState("idle");
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState("");
  const saveTimeout = useRef(null);
  const pendingUpdates = useRef({});

  useEffect(() => {
    setLoading(true);
    getNote(id)
      .then(setNote)
      .finally(() => setLoading(false));
  }, [id]);

  const persist = useCallback(
    (updates) => {
      pendingUpdates.current = { ...pendingUpdates.current, ...updates };
      setSaveState("saving");
      clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(async () => {
        const toSave = pendingUpdates.current;
        pendingUpdates.current = {};
        await updateNote(id, toSave);
        setSaveState("saved");
      }, 500);
    },
    [id]
  );

  function patchField(field, value) {
    setNote((prev) => ({ ...prev, [field]: value }));
    persist({ [field]: value });
  }

  async function handleDetectPlace() {
    setLocating(true);
    setLocateError("");
    try {
      const place = await detectPlace();
      patchField("place", place);
    } catch (err) {
      setLocateError(err.message || "Couldn't detect your location");
    } finally {
      setLocating(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this note? This can't be undone.")) return;
    await deleteNote(id);
    navigate("/notes", { replace: true });
  }

  if (loading) {
    return <div className="px-10 py-8 text-sm text-(--color-text-muted)">Loading…</div>;
  }

  if (!note) {
    return <div className="px-10 py-8 text-sm text-(--color-text-muted)">Note not found.</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-10 py-8">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs text-(--color-text-muted)">
          {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : ""}
        </span>
        <button
          type="button"
          onClick={handleDelete}
          title="Delete note"
          className="rounded-md p-1.5 text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
        >
          <Delete02Icon size={16} strokeWidth={1.8} />
        </button>
      </div>

      <div className="mb-4">
        <IconPicker
          trigger={
            <span className="flex h-16 w-16 items-center justify-center rounded-lg text-5xl hover:bg-black/5 dark:hover:bg-white/10">
              {note.icon || "📄"}
            </span>
          }
          onSelect={(emoji) => patchField("icon", emoji)}
          onRemove={() => patchField("icon", "")}
        />
      </div>

      <input
        value={note.title}
        onChange={(e) => patchField("title", e.target.value)}
        placeholder="Untitled"
        className="w-full border-none bg-transparent text-3xl font-bold outline-none placeholder:text-(--color-text-muted)"
      />

      <div className="mt-4 flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-3">
          <span className="flex w-28 shrink-0 items-center gap-1.5 text-(--color-text-muted)">
            <Calendar03Icon size={18} strokeWidth={1.8} />
            Date
          </span>
          <DatePicker
            value={toDateInputValue(note.date)}
            onChange={(date) => patchField("date", date)}
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="flex w-28 shrink-0 items-center gap-1.5 text-(--color-text-muted)">
            <Location01Icon size={18} strokeWidth={1.8} />
            Place
          </span>
          <input
            value={note.place}
            onChange={(e) => patchField("place", e.target.value)}
            placeholder="Empty"
            className="rounded-md border border-transparent bg-transparent px-2 py-1 text-sm outline-none hover:border-(--color-border) focus:border-(--color-border) placeholder:text-(--color-text-muted)"
          />
          <button
            type="button"
            onClick={handleDetectPlace}
            disabled={locating}
            title="Use current location"
            className="rounded-md p-1.5 text-(--color-text-muted) hover:bg-black/5 disabled:opacity-60 dark:hover:bg-white/10"
          >
            <Gps01Icon size={16} strokeWidth={1.8} className={locating ? "animate-pulse" : ""} />
          </button>
          {locateError && <span className="text-xs text-red-500">{locateError}</span>}
        </div>
      </div>

      <div className="mt-8 border-t border-(--color-border) pt-6">
        <RichTextEditor
          content={note.content ?? undefined}
          onChange={(json) => patchField("content", json)}
          placeholder="Write a note. Type '/' for commands…"
        />
      </div>
    </div>
  );
}
