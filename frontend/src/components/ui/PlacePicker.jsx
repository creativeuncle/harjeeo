import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Location01Icon, Navigation03Icon, Cancel01Icon } from "hugeicons-react";
import { detectPlace, searchPlaces } from "@/lib/geolocation";

export default function PlacePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [position, setPosition] = useState(null);
  const triggerRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const places = await searchPlaces(query);
      setResults(places);
      setSearching(false);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  function handleOpen() {
    const rect = triggerRef.current.getBoundingClientRect();
    setPosition({ top: rect.bottom + 4, left: rect.left });
    setOpen(true);
  }

  function handleSelect(label) {
    onChange(label);
    setOpen(false);
    setQuery("");
  }

  async function handleCurrentLocation() {
    setLocating(true);
    try {
      const place = await detectPlace();
      handleSelect(place);
    } catch {
      // Permission denied or lookup failed — leave the field as-is.
    } finally {
      setLocating(false);
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className="flex max-w-full items-center rounded-md px-2 py-1 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
      >
        <span className={value ? "truncate" : "text-(--color-text-muted)"}>
          {value || "Empty"}
        </span>
      </button>

      {open &&
        position &&
        createPortal(
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div
              style={{ top: position.top, left: position.left }}
              className="fixed z-50 w-72 rounded-lg border border-(--color-border) bg-(--color-canvas) p-2 shadow-lg"
            >
              <div className="mb-2 flex items-center gap-1.5 rounded-md border border-(--color-border) px-2 py-1">
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for a location…"
                  className="flex-1 bg-transparent text-sm outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="text-(--color-text-muted) hover:text-(--color-text)"
                  >
                    <Cancel01Icon size={13} strokeWidth={1.8} />
                  </button>
                )}
              </div>

              <div className="flex max-h-56 flex-col gap-0.5 overflow-y-auto">
                {!query && (
                  <button
                    type="button"
                    onClick={handleCurrentLocation}
                    disabled={locating}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-black/5 disabled:opacity-60 dark:hover:bg-white/10"
                  >
                    <Navigation03Icon size={15} strokeWidth={1.8} className="shrink-0" />
                    {locating ? "Locating…" : "Current Location"}
                  </button>
                )}

                {query && searching && (
                  <div className="px-2 py-1.5 text-sm text-(--color-text-muted)">Searching…</div>
                )}
                {query && !searching && results.length === 0 && (
                  <div className="px-2 py-1.5 text-sm text-(--color-text-muted)">No matches</div>
                )}
                {results.map((place) => (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => handleSelect(place.label)}
                    className="flex items-start gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <Location01Icon
                      size={14}
                      strokeWidth={1.8}
                      className="mt-0.5 shrink-0 text-(--color-text-muted)"
                    />
                    <span className="min-w-0 flex-1 truncate">{place.label}</span>
                  </button>
                ))}
              </div>

              {value && (
                <div className="mt-1 border-t border-(--color-border) pt-1">
                  <button
                    type="button"
                    onClick={() => handleSelect("")}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <Cancel01Icon size={13} strokeWidth={1.8} />
                    Clear
                  </button>
                </div>
              )}
            </div>
          </>,
          document.body
        )}
    </>
  );
}
