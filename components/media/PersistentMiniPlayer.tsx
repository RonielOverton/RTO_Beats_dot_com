"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useMediaPlayer } from "@/components/media/MediaPlayerProvider";

function formatTime(value: number): string {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function PersistentMiniPlayer() {
  const {
    currentItem,
    isPlaying,
    isExpanded,
    currentTime,
    duration,
    volume,
    togglePlay,
    seekTo,
    setVolume,
    playNext,
    playPrevious,
    toggleExpanded,
  } = useMediaPlayer();

  const progressPercent = useMemo(() => {
    if (!duration) return 0;
    return Math.min((currentTime / duration) * 100, 100);
  }, [currentTime, duration]);

  if (!currentItem) return null;

  const isAlbum = currentItem.itemType === "album";

  return (
    <div className="fixed bottom-4 left-1/2 z-[60] w-[min(980px,calc(100%-1.5rem))] -translate-x-1/2 rounded-2xl border border-white/10 bg-zinc-950/95 p-3 shadow-2xl shadow-black/50 backdrop-blur-xl">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          {isAlbum ? "Album" : "Global Player"}
        </p>
        <button
          type="button"
          onClick={toggleExpanded}
          className="rounded-md border border-white/15 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-300 transition hover:border-white/35"
        >
          {isExpanded ? "Dock" : "Expand"}
        </button>
      </div>

      {!isExpanded ? (
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-xs font-semibold uppercase tracking-wide text-amber-100">{currentItem.title}</p>
          {isAlbum ? (
            currentItem.bandcampUrl ? (
              <a
                href={currentItem.bandcampUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-md border border-amber-200/35 bg-amber-200/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-100"
              >
                Bandcamp
              </a>
            ) : null
          ) : (
            <button
              type="button"
              onClick={togglePlay}
              className="shrink-0 rounded-md border border-amber-200/35 bg-amber-200/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-100"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
          )}
        </div>
      ) : (
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex min-w-0 items-center gap-3 md:w-[34%]">
          <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-white/10 bg-zinc-900">
            {currentItem.coverImage?.url ? (
              <Image
                src={currentItem.coverImage.url}
                alt={currentItem.coverImage.alt ?? currentItem.title}
                fill
                sizes="48px"
                className="object-cover"
              />
            ) : null}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold uppercase tracking-wide text-amber-100">{currentItem.title}</p>
            <p className="truncate text-xs uppercase tracking-[0.18em] text-zinc-400">
              {isAlbum ? "Album" : (currentItem.productType ?? "Audio")}
            </p>
          </div>
        </div>

        {isAlbum ? (
          /* Album: show streaming / Bandcamp links instead of audio controls */
          <div className="flex flex-wrap gap-2 md:w-[66%]">
            {currentItem.bandcampUrl ? (
              <a
                href={currentItem.bandcampUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-amber-200/35 bg-amber-200/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-100 transition hover:border-amber-100/50"
              >
                Bandcamp
              </a>
            ) : null}
            {currentItem.streamingLinks?.spotify ? (
              <a href={currentItem.streamingLinks.spotify} target="_blank" rel="noopener noreferrer"
                className="rounded-md border border-white/15 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-300 transition hover:border-white/35">
                Spotify
              </a>
            ) : null}
            {currentItem.streamingLinks?.appleMusic ? (
              <a href={currentItem.streamingLinks.appleMusic} target="_blank" rel="noopener noreferrer"
                className="rounded-md border border-white/15 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-300 transition hover:border-white/35">
                Apple Music
              </a>
            ) : null}
            {currentItem.streamingLinks?.youtube ? (
              <a href={currentItem.streamingLinks.youtube} target="_blank" rel="noopener noreferrer"
                className="rounded-md border border-white/15 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-300 transition hover:border-white/35">
                YouTube
              </a>
            ) : null}
            {!currentItem.bandcampUrl && !Object.values(currentItem.streamingLinks ?? {}).some(Boolean) ? (
              <p className="text-xs text-zinc-500">No streaming links added yet.</p>
            ) : null}
          </div>
        ) : (
          /* Audio/Video product: full playback controls */
          <>
            <div className="md:w-[44%]">
              <div className="mb-2 flex items-center justify-center gap-2">
                <button type="button" onClick={playPrevious} className="rounded-md border border-white/15 px-2 py-1 text-xs text-zinc-200 hover:border-white/30">
                  Prev
                </button>
                <button type="button" onClick={togglePlay} className="rounded-md border border-amber-200/35 bg-amber-200/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-100 hover:border-amber-100/50">
                  {isPlaying ? "Pause" : "Play"}
                </button>
                <button type="button" onClick={playNext} className="rounded-md border border-white/15 px-2 py-1 text-xs text-zinc-200 hover:border-white/30">
                  Next
                </button>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                <span>{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={0.1}
                  value={Math.min(currentTime, duration || 0)}
                  onChange={(event) => seekTo(Number(event.target.value))}
                  className="media-progress h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-800"
                  style={{
                    backgroundImage: `linear-gradient(90deg, rgba(251,191,36,0.9) ${progressPercent}%, rgba(39,39,42,0.95) ${progressPercent}%)`,
                  }}
                />
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="md:w-[22%]">
              <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-zinc-500">Volume</p>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(event) => setVolume(Number(event.target.value))}
                className="media-progress h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-800"
                style={{
                  backgroundImage: `linear-gradient(90deg, rgba(34,211,238,0.95) ${volume * 100}%, rgba(39,39,42,0.95) ${volume * 100}%)`,
                }}
              />
            </div>
          </>
        )}
      </div>
      )}
    </div>
  );
}
