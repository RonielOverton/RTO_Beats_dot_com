"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { SanityTrack } from "@/sanity/lib/types";

interface AlbumTrackPlayerProps {
  tracks: SanityTrack[];
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// â”€â”€ Waveform handle exposed to parent â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface WaveformHandle {
  play: () => void;
  pause: () => void;
}

// â”€â”€ Inner waveform component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface TrackWaveformProps {
  url: string;
  volume: number;
  autoPlay?: boolean;
  onReady: (duration: number) => void;
  onTimeUpdate: (time: number) => void;
  onPlayChange: (playing: boolean) => void;
  onFinish: () => void;
}

const TrackWaveform = forwardRef<WaveformHandle, TrackWaveformProps>(
  function TrackWaveform(
    { url, volume, autoPlay, onReady, onTimeUpdate, onPlayChange, onFinish },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const wsRef = useRef<import("wavesurfer.js").default | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Stable callback refs so WaveSurfer event handlers always call the latest
    // callbacks without recreating the instance on every re-render.
    const onReadyRef = useRef(onReady);
    const onTimeUpdateRef = useRef(onTimeUpdate);
    const onPlayChangeRef = useRef(onPlayChange);
    const onFinishRef = useRef(onFinish);
    useEffect(() => { onReadyRef.current = onReady; }, [onReady]);
    useEffect(() => { onTimeUpdateRef.current = onTimeUpdate; }, [onTimeUpdate]);
    useEffect(() => { onPlayChangeRef.current = onPlayChange; }, [onPlayChange]);
    useEffect(() => { onFinishRef.current = onFinish; }, [onFinish]);

    // Expose play / pause imperatively so the parent can call them directly
    // inside the user-gesture handler (no async boundary = AudioContext never blocked).
    useImperativeHandle(ref, () => ({
      play: () => { void wsRef.current?.play().catch(() => {}); },
      pause: () => { wsRef.current?.pause(); },
    }));

    // Create one WaveSurfer instance per url. New track = new instance.
    useEffect(() => {
      if (!containerRef.current) return;
      let destroyed = false;

      void (async () => {
        const WaveSurfer = (await import("wavesurfer.js")).default;
        if (destroyed || !containerRef.current) return;

        const ws = WaveSurfer.create({
          container: containerRef.current,
          url,
          waveColor: "rgba(251,191,36,0.45)",
          progressColor: "rgba(251,191,36,1)",
          cursorColor: "rgba(6,182,212,0.9)",
          cursorWidth: 2,
          barWidth: 2,
          barGap: 1,
          barRadius: 4,
          height: 56,
          normalize: true,
          interact: true,
        });

        ws.on("ready", (dur) => {
          setIsLoading(false);
          onReadyRef.current(dur);
          if (autoPlay) void ws.play().catch(() => {});
        });
        ws.on("timeupdate", (t) => onTimeUpdateRef.current(t));
        ws.on("play", () => onPlayChangeRef.current(true));
        ws.on("pause", () => onPlayChangeRef.current(false));
        ws.on("finish", () => {
          onPlayChangeRef.current(false);
          onFinishRef.current();
        });

        wsRef.current = ws;
      })();

      return () => {
        destroyed = true;
        wsRef.current?.destroy();
        wsRef.current = null;
      };
      // url is the only real dep â€” a new url means a new track, new instance.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url]);

    // Sync volume without recreating the instance.
    useEffect(() => {
      wsRef.current?.setVolume(volume);
    }, [volume]);

    return (
      <div className="relative min-h-[56px] w-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="h-4 w-4 animate-spin rounded-full border border-amber-300/40 border-t-amber-300"
              aria-hidden="true"
            />
          </div>
        )}
        <div
          ref={containerRef}
          className={
            isLoading ? "opacity-0" : "opacity-100 transition-opacity duration-300"
          }
        />
      </div>
    );
  },
);

// â”€â”€ Main tracklist player â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function AlbumTrackPlayer({ tracks }: AlbumTrackPlayerProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.9);

  const waveRef = useRef<WaveformHandle | null>(null);

  // Stable refs so finish handler and selectTrack always read the latest state.
  const activeKeyRef = useRef(activeKey);
  useEffect(() => { activeKeyRef.current = activeKey; }, [activeKey]);
  const tracksRef = useRef(tracks);
  useEffect(() => { tracksRef.current = tracks; }, [tracks]);

  const selectTrack = (track: SanityTrack) => {
    if (!track.audioUrl) return;
    const key = track._key ?? track.title;

    if (activeKeyRef.current === key) {
      // Same track â€” toggle directly in the user gesture.
      if (isPlaying) waveRef.current?.pause();
      else waveRef.current?.play();
      return;
    }

    // New track â€” reset state; new TrackWaveform mounts with autoPlay.
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setActiveKey(key);
  };

  const handleFinish = () => {
    const playable = tracksRef.current.filter((t) => t.audioUrl);
    const idx = playable.findIndex(
      (t) => (t._key ?? t.title) === activeKeyRef.current,
    );
    const next = playable[idx + 1];
    if (next) {
      setCurrentTime(0);
      setDuration(0);
      setActiveKey(next._key ?? next.title);
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  return (
    <section
      className="mt-12 rounded-2xl border border-white/10 bg-zinc-950/70 p-6 md:p-8"
      aria-labelledby="album-tracklist-heading"
    >
      <h2
        id="album-tracklist-heading"
        className="mb-5 text-xs uppercase tracking-[0.3em] text-zinc-500"
      >
        Tracklist
      </h2>

      <ol className="divide-y divide-white/5">
        {tracks.map((track, index) => {
          const key = track._key ?? track.title;
          const isActive = activeKey === key;
          const hasAudio = Boolean(track.audioUrl);

          return (
            <li
              key={key}
              className={`group rounded-lg transition-colors ${hasAudio ? "cursor-pointer" : ""} ${
                isActive ? "bg-amber-200/5" : "hover:bg-white/5"
              }`}
            >
              {/* Track row */}
              <div
                role={hasAudio ? "button" : undefined}
                tabIndex={hasAudio ? 0 : undefined}
                aria-label={
                  hasAudio
                    ? `${isActive && isPlaying ? "Pause" : "Play"} ${track.title}`
                    : undefined
                }
                onClick={() => selectTrack(track)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    selectTrack(track);
                  }
                }}
                className="flex items-center justify-between gap-4 px-3 py-3.5"
              >
                <div className="flex min-w-0 items-center gap-4">
                  {/* Track number / play indicator */}
                  <span className="flex w-6 shrink-0 items-center justify-center">
                    {isActive && isPlaying ? (
                      <span className="flex items-end gap-[2px]" aria-hidden="true">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="media-wavebar media-wavebar-active w-[3px]"
                            style={{ animationDelay: `${i * 120}ms` }}
                          />
                        ))}
                      </span>
                    ) : hasAudio ? (
                      <span
                        className="text-zinc-600 transition group-hover:text-amber-300"
                        aria-hidden="true"
                      >
                        <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M3 2.5l10 5.5-10 5.5V2.5z" />
                        </svg>
                      </span>
                    ) : (
                      <span className="text-right text-xs tabular-nums text-zinc-600">
                        {track.trackNumber ?? index + 1}
                      </span>
                    )}
                  </span>

                  <div className="min-w-0">
                    <p
                      className={`truncate font-medium ${
                        isActive ? "text-amber-100" : "text-zinc-100"
                      }`}
                    >
                      {track.title}
                    </p>
                    {track.featuring && track.featuring.length > 0 && (
                      <p className="text-xs text-zinc-500">
                        ft. {track.featuring.join(", ")}
                      </p>
                    )}
                  </div>
                </div>

                <span className="shrink-0 text-xs tabular-nums text-zinc-500">
                  {isActive && duration > 0
                    ? formatTime(duration)
                    : (track.duration ?? "")}
                </span>
              </div>

              {/* Inline player â€” only rendered for the active track */}
              {isActive && track.audioUrl && (
                <div
                  className="space-y-3 px-3 pb-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Waveform */}
                  <TrackWaveform
                    ref={waveRef}
                    url={track.audioUrl}
                    volume={volume}
                    autoPlay
                    onReady={(dur) => setDuration(dur)}
                    onTimeUpdate={(t) => setCurrentTime(t)}
                    onPlayChange={(playing) => setIsPlaying(playing)}
                    onFinish={handleFinish}
                  />

                  {/* Play / Pause + timestamps */}
                  <div className="flex items-center justify-between gap-3 text-[11px] text-zinc-400">
                    <span className="tabular-nums">{formatTime(currentTime)}</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (isPlaying) waveRef.current?.pause();
                        else waveRef.current?.play();
                      }}
                      className="rounded-md border border-amber-200/35 bg-amber-200/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-100 transition hover:border-amber-100/60"
                    >
                      {isPlaying ? "Pause" : "Play"}
                    </button>
                    <span className="tabular-nums">{formatTime(duration)}</span>
                  </div>

                  {/* Volume */}
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="min-w-14 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                      Volume
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      aria-label="Volume"
                      className="media-progress h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-800"
                      style={{
                        backgroundImage: `linear-gradient(90deg, rgba(34,211,238,0.95) ${volume * 100}%, rgba(39,39,42,0.95) ${volume * 100}%)`,
                      }}
                    />
                    <span className="w-8 text-right tabular-nums text-zinc-400">
                      {Math.round(volume * 100)}
                    </span>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

