import Image from "next/image";
import Link from "next/link";
import type { AlbumStatus } from "@/sanity/lib/types";
import {
  ALBUM_BLUR_DATA_URL,
  ALBUM_FALLBACK_IMAGE,
  ALBUM_STATUS_META,
  formatAlbumDate,
  getAlbumImageAlt,
} from "./album-utils";

export type { AlbumStatus };

export interface AlbumCardProps {
  title: string;
  slug: string;
  coverImage?: { url?: string; alt?: string } | null;
  releaseDate: string;
  status: AlbumStatus;
  shortDescription?: string;
}

export function AlbumCard({
  title,
  slug,
  coverImage,
  releaseDate,
  status,
  shortDescription,
}: AlbumCardProps) {
  const { badge, label } = ALBUM_STATUS_META[status];
  const src = coverImage?.url ?? ALBUM_FALLBACK_IMAGE;
  const alt = getAlbumImageAlt(title, coverImage?.alt);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/80 transition duration-300 hover:-translate-y-1 hover:border-amber-200/25 hover:shadow-xl hover:shadow-amber-300/10">
      {/* Hover glow overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(245,158,11,0.14),transparent_40%),radial-gradient(circle_at_15%_95%,rgba(34,211,238,0.10),transparent_38%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      {/* Cover image */}
      <div className="relative aspect-square w-full overflow-hidden border-b border-white/10 sm:aspect-[4/3]">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
          placeholder="blur"
          blurDataURL={ALBUM_BLUR_DATA_URL}
        />
      </div>

      {/* Content */}
      <div className="relative flex flex-1 flex-col gap-3 p-5">
        {/* Date + status row */}
        <div className="flex items-center justify-between gap-2">
          <time
            dateTime={releaseDate}
            className="text-xs uppercase tracking-[0.22em] text-zinc-500"
          >
            {formatAlbumDate(releaseDate)}
          </time>
          <span
            className={`shrink-0 rounded-full border px-3 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${badge}`}
          >
            {label}
          </span>
        </div>

        {/* Title */}
        <h2 className="line-clamp-2 text-xl font-semibold leading-snug text-zinc-50 transition-colors duration-200 group-hover:text-amber-100">
          {title}
        </h2>

        {/* Description */}
        {shortDescription && (
          <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-zinc-400">
            {shortDescription}
          </p>
        )}

        {/* CTA */}
        <div className="pt-1">
          <Link
            href={`/albums/${slug}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-200 transition-all duration-200 hover:border-amber-200/40 hover:text-amber-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
            aria-label={`View album ${title}`}
          >
            View project
            <svg
              aria-hidden="true"
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
