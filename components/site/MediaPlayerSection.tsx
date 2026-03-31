"use client";

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { useMediaPlayer } from "@/components/media/MediaPlayerProvider";
import type { SanityPlayableMediaItem, SanityPlayableStreamingLinks } from "@/sanity/lib";

interface MediaPlayerSectionProps {
  items: SanityPlayableMediaItem[];
}

function isVideo(mimeType?: string): boolean {
  return typeof mimeType === "string" && mimeType.startsWith("video/");
}

function asReadableDate(value?: string): string {
  if (!value) return "No date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No date";
  return date.toLocaleDateString();
}

/** Safely extracts the src URL from a Bandcamp embed code string */
function extractBandcampSrc(embedCode: string): string | null {
  const match = embedCode.match(/src="(https:\/\/bandcamp\.com\/EmbeddedPlayer[^"]*)"/);
  return match ? match[1] : null;
}

const STREAMING_LABELS: Record<keyof SanityPlayableStreamingLinks, string> = {
  spotify: "Spotify",
  appleMusic: "Apple Music",
  youtube: "YouTube",
  soundcloud: "SoundCloud",
  bandcamp: "Bandcamp",
};

function StreamingLinks({ links }: { links: SanityPlayableStreamingLinks }) {
  const entries = Object.entries(links).filter(([, url]) => !!url) as [
    keyof SanityPlayableStreamingLinks,
    string,
  ][];
  if (entries.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {entries.map(([platform, url]) => (
        <a
          key={platform}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-white/15 px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-zinc-200 transition hover:border-amber-200/40 hover:text-amber-100"
        >
          {STREAMING_LABELS[platform]}
        </a>
      ))}
    </div>
  );
}

export function MediaPlayerSection({ items }: MediaPlayerSectionProps) {
  const safeItems = Array.isArray(items) ? items : [];
  const {
    currentItem,
    queue,
    isPlaying,
    currentTime,
    duration,
    setQueue,
    selectItem,
    togglePlay,
    seekTo,
  } = useMediaPlayer();

  useEffect(() => {
    setQueue(safeItems, safeItems[0]?._id);
  }, [safeItems, setQueue]);

  const activeItem = useMemo(() => {
    if (!currentItem) return safeItems[0];
    return safeItems.find((item) => item._id === currentItem._id) ?? safeItems[0];
  }, [currentItem, safeItems]);

  const progressPercent = useMemo(() => {
    if (!duration) return 0;
    return Math.min((currentTime / duration) * 100, 100);
  }, [currentTime, duration]);

  const queueItems = queue.length > 0 ? queue : safeItems;
  const itemRefs = useRef<Record<string, HTMLLIElement | null>>({});

  useEffect(() => {
    if (!activeItem?._id) return;
    itemRefs.current[activeItem._id]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [activeItem?._id]);

  const isAlbum = activeItem?.itemType === "album";
  const bandcampSrc = activeItem?.bandcampEmbedCode
    ? extractBandcampSrc(activeItem.bandcampEmbedCode)
    : null;

  if (!activeItem) {
    return (
      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-8 text-center text-zinc-300">
          No published playable media found yet. Upload audio/video files to product documents or publish albums in Sanity.
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-12 lg:grid-cols-[1.2fr_1fr]">
      <article className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/70">
        <div className="relative aspect-video border-b border-white/10 bg-zinc-950">
          {activeItem.coverImage?.url ? (
            <Image
              src={activeItem.coverImage.url}
              alt={activeItem.coverImage.alt ?? activeItem.title}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover opacity-70"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-200/90">
              {isAlbum ? "Album" : "Now Playing"}
            </p>
            <h2 className="mt-2 text-3xl font-semibold uppercase tracking-wide text-white">{activeItem.title}</h2>
            <p className="mt-1 text-sm text-zinc-300">
              {isAlbum ? "Album" : activeItem.productType} · {asReadableDate(activeItem.releaseDate)}
              {activeItem.downloadVersion ? ` · ${activeItem.downloadVersion}` : ""}
            </p>
          </div>
        </div>

        <div className="p-5">
          {isAlbum ? (
            /* ── Album view: Bandcamp embed or streaming links ── */
            <div className="space-y-4">
              {bandcampSrc ? (
                <div className="overflow-hidden rounded-xl border border-white/10">
                  <iframe
                    src={bandcampSrc}
                    className="w-full"
                    style={{ border: 0, height: 350 }}
                    title={`${activeItem.title} – Bandcamp player`}
                    sandbox="allow-scripts allow-same-origin allow-popups"
                  />
                </div>
              ) : activeItem.bandcampUrl ? (
                <a
                  href={activeItem.bandcampUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center rounded-xl border border-amber-200/30 bg-amber-200/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-amber-100 transition hover:border-amber-100/50"
                >
                  Listen on Bandcamp
                </a>
              ) : null}

              {activeItem.streamingLinks && Object.values(activeItem.streamingLinks).some(Boolean) ? (
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.2em] text-zinc-500">Stream on</p>
                  <StreamingLinks links={activeItem.streamingLinks} />
                </div>
              ) : null}

              {activeItem.shortDescription ? (
                <p className="text-sm leading-7 text-zinc-300">{activeItem.shortDescription}</p>
              ) : null}
            </div>
          ) : (
            /* ── Product view: HTML5 audio/video player ── */
            <div className="rounded-xl border border-white/10 bg-zinc-950/80 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                  {isVideo(activeItem.mediaFile?.mimeType) ? "Video asset" : "Audio asset"}
                </p>
                <button
                  type="button"
                  onClick={togglePlay}
                  className="rounded-md border border-amber-200/35 bg-amber-200/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-amber-100 transition hover:border-amber-100/60"
                >
                  {isPlaying ? "Pause" : "Play"}
                </button>
              </div>

              <div className="mb-3 flex h-10 items-end gap-1 rounded-md border border-white/5 bg-zinc-900/60 px-3 py-2">
                {Array.from({ length: 22 }).map((_, index) => (
                  <span
                    key={index}
                    className={`media-wavebar ${isPlaying ? "media-wavebar-active" : ""}`}
                    style={{ animationDelay: `${index * 55}ms` }}
                  />
                ))}
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
                    backgroundImage: `linear-gradient(90deg, rgba(251,191,36,0.95) ${progressPercent}%, rgba(39,39,42,0.95) ${progressPercent}%)`,
                  }}
                />
                <span>{formatTime(duration)}</span>
              </div>

              {activeItem.shortDescription ? (
                <p className="mt-4 text-sm leading-7 text-zinc-300">{activeItem.shortDescription}</p>
              ) : null}
            </div>
          )}
        </div>
      </article>

      <aside className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4">
        <h3 className="mb-3 text-sm uppercase tracking-[0.2em] text-zinc-400">Media Library</h3>
        <ul className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
          {queueItems.map((item) => {
            const active = item._id === activeItem._id;
            const isItemAlbum = item.itemType === "album";
            return (
              <li
                key={item._id}
                ref={(node) => {
                  itemRefs.current[item._id] = node;
                }}
              >
                <button
                  type="button"
                  onClick={() => selectItem(item._id)}
                  className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                    active
                      ? "border-amber-200/40 bg-amber-200/10 text-amber-100"
                      : "border-white/10 bg-zinc-950/40 text-zinc-200 hover:border-white/20 hover:bg-zinc-900"
                  }`}
                >
                  <p className="line-clamp-1 text-sm font-semibold uppercase tracking-wide">{item.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-400">
                    {isItemAlbum
                      ? "Album"
                      : item.mediaFile?.mimeType?.startsWith("video/")
                        ? "Video"
                        : "Audio"}
                    {item.releaseDate ? ` · ${new Date(item.releaseDate).getFullYear()}` : ""}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>
    </section>
  );
}

function formatTime(value: number): string {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}
