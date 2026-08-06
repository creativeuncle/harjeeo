import { useEffect, useRef, useState } from "react";
import { PlayIcon, PauseIcon } from "hugeicons-react";

const BAR_COUNT = 28;

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function VoiceMessagePlayer({ url }) {
  const [peaks, setPeaks] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function extractPeaks() {
      try {
        const res = await fetch(url);
        const buffer = await res.arrayBuffer();
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        const decoded = await ctx.decodeAudioData(buffer);
        const raw = decoded.getChannelData(0);
        const blockSize = Math.floor(raw.length / BAR_COUNT) || 1;
        const values = [];
        for (let i = 0; i < BAR_COUNT; i++) {
          const start = i * blockSize;
          let max = 0;
          for (let j = 0; j < blockSize; j++) {
            const v = Math.abs(raw[start + j] ?? 0);
            if (v > max) max = v;
          }
          values.push(max);
        }
        const peak = Math.max(...values, 0.01);
        ctx.close();
        if (!cancelled) setPeaks(values.map((v) => Math.max(v / peak, 0.08)));
      } catch {
        if (!cancelled) setPeaks(Array.from({ length: BAR_COUNT }, () => 0.35));
      }
    }
    extractPeaks();
    return () => {
      cancelled = true;
    };
  }, [url]);

  function handleTimeUpdate() {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    setProgress(audio.currentTime / audio.duration);
  }

  function handleLoadedMetadata() {
    setDuration(audioRef.current?.duration ?? 0);
  }

  function handleEnded() {
    setPlaying(false);
    setProgress(0);
  }

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
    }
  }

  function handleSeek(e) {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const fraction = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    audio.currentTime = fraction * audio.duration;
    setProgress(fraction);
  }

  return (
    <div className="mt-1 flex w-64 items-center gap-2.5 rounded-full bg-black/80 px-3 py-2 text-white dark:bg-white/15">
      <audio
        ref={audioRef}
        src={url}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        className="hidden"
      />

      <button
        type="button"
        onClick={togglePlay}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 hover:bg-white/30"
      >
        {playing ? (
          <PauseIcon size={13} strokeWidth={2} className="fill-current" />
        ) : (
          <PlayIcon size={13} strokeWidth={2} className="ml-0.5 fill-current" />
        )}
      </button>

      <div
        onClick={handleSeek}
        className="flex h-7 flex-1 cursor-pointer items-center gap-[2px]"
      >
        {(peaks ?? Array.from({ length: BAR_COUNT }, () => 0.3)).map((v, i) => {
          const played = i / BAR_COUNT < progress;
          return (
            <span
              key={i}
              style={{ height: `${Math.round(v * 100)}%` }}
              className={`w-[3px] shrink-0 rounded-full transition-colors ${
                played ? "bg-white" : "bg-white/40"
              }`}
            />
          );
        })}
      </div>

      <span className="shrink-0 text-[10px] tabular-nums text-white/80">
        {formatTime(playing || progress > 0 ? (progress * duration) : duration)}
      </span>
    </div>
  );
}
