import Image from "next/image";
import Link from "next/link";
import { StructuredData } from "@/components/site/StructuredData";
import { AlbumTrackPlayer } from "@/components/site/albums/AlbumTrackPlayer";
import type {
  SanityAlbumDetail,
  SanityStreamingLinks,
} from "@/sanity/lib/types";
import { siteConfig } from "@/data/site";
import {
  ALBUM_BLUR_DATA_URL,
  ALBUM_FALLBACK_IMAGE,
  ALBUM_PLATFORM_LABELS,
  ALBUM_STATUS_META,
  extractBandcampEmbedSrc,
  formatAlbumDate,
  getAlbumImageAlt,
  getAlbumSummary,
  getPortableTextParagraphs,
} from "./album-utils";

interface AlbumDetailViewProps {
  album: SanityAlbumDetail;
}

export function AlbumDetailView({ album }: AlbumDetailViewProps) {
  const coverSrc = album.coverImage?.url ?? ALBUM_FALLBACK_IMAGE;
  const coverAlt = getAlbumImageAlt(album.title, album.coverImage?.alt);
  const badge = ALBUM_STATUS_META[album.status];
  const descriptionParagraphs = getPortableTextParagraphs(album.fullDescription);
  const fallbackDescription = getAlbumSummary(album);
  const genreList = album.genre ?? [];
  const tracklist = album.tracklist ?? [];
  const credits = album.credits ?? [];
  const galleryImages = album.galleryImages ?? [];
  const storeBuyUrl = `/store/${album.slug}`;
  const bandcampEmbedSrc = extractBandcampEmbedSrc(album.bandcampEmbedCode);

  const streamingEntries = album.streamingLinks
    ? (Object.entries(album.streamingLinks) as [keyof SanityStreamingLinks, string | undefined][]).filter(
        ([platform, url]) => Boolean(url) && platform !== "bandcamp",
      )
    : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicAlbum",
    name: album.title,
    byArtist: { "@type": "MusicGroup", name: siteConfig.artistName },
    image: album.coverImage?.url,
    datePublished: album.releaseDate,
    genre: genreList,
    track: tracklist.map((track, index) => ({
      "@type": "MusicRecording",
      position: track.trackNumber ?? index + 1,
      name: track.title,
      duration: track.duration,
    })),
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-14">
      <StructuredData data={jsonLd} />

      <Link
        href="/albums"
        className="mb-10 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.22em] text-zinc-500 transition-colors hover:text-amber-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
        aria-label="Back to all albums"
      >
        <svg
          aria-hidden="true"
          className="h-3 w-3"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        All projects
      </Link>

      <section className="grid gap-8 md:grid-cols-[360px_1fr] lg:grid-cols-[420px_1fr]" aria-labelledby="album-title">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/60">
          <Image
            src={coverSrc}
            alt={coverAlt}
            fill
            sizes="(max-width: 768px) 100vw, 420px"
            className="object-cover"
            placeholder="blur"
            blurDataURL={ALBUM_BLUR_DATA_URL}
            priority
          />
        </div>

        <div className="flex flex-col justify-center space-y-5">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Discography</p>

          <h1 id="album-title" className="text-4xl font-semibold leading-tight text-zinc-50 md:text-5xl">
            {album.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3">
            <time dateTime={album.releaseDate} className="text-sm text-zinc-400">
              {formatAlbumDate(album.releaseDate, "long")}
            </time>
            <span
              className={`rounded-full border px-3 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${badge.badge}`}
            >
              {badge.label}
            </span>
          </div>

          {genreList.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Album genres">
              {genreList.map((genre) => (
                <li key={genre} className="rounded-full border border-white/15 px-3 py-1 text-xs text-zinc-300">
                  {genre}
                </li>
              ))}
            </ul>
          )}

          {album.featuredArtists && album.featuredArtists.length > 0 && (
            <p className="text-sm text-zinc-400">
              <span className="mr-1 text-zinc-600">ft.</span>
              {album.featuredArtists.join(", ")}
            </p>
          )}

          {descriptionParagraphs.length > 0 ? (
            <div className="max-w-prose space-y-4 text-base leading-relaxed text-zinc-300">
              {descriptionParagraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <p className="max-w-prose text-base leading-relaxed text-zinc-300">{fallbackDescription}</p>
          )}

          {streamingEntries.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1" aria-label="Streaming links">
              {streamingEntries.map(([platform, url]) => (
                <a
                  key={String(platform)}
                  href={url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center rounded-full border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-200 transition-all duration-200 hover:border-amber-200/40 hover:text-amber-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
                  aria-label={`Open ${ALBUM_PLATFORM_LABELS[platform]} for ${album.title}`}
                >
                  {ALBUM_PLATFORM_LABELS[platform]}
                </a>
              ))}
            </div>
          )}

          <div className="pt-2">
            <Link
              href={storeBuyUrl}
              className="inline-flex items-center rounded-full bg-amber-300 px-5 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-black transition hover:bg-amber-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
              aria-label={`Buy ${album.title}`}
            >
              Buy
            </Link>
          </div>
        </div>
      </section>

      {tracklist.length > 0 && (
        <AlbumTrackPlayer tracks={tracklist} />
      )}

      {credits.length > 0 && (
        <section className="mt-8 rounded-2xl border border-white/10 bg-zinc-950/70 p-6 md:p-8" aria-labelledby="album-credits-heading">
          <h2 id="album-credits-heading" className="mb-5 text-xs uppercase tracking-[0.3em] text-zinc-500">Credits</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {credits.map((credit, index) => (
              <div key={`${credit.name}-${credit.role ?? index}`}>
                <p className="text-sm font-medium text-zinc-100">{credit.name}</p>
                {credit.role && <p className="mt-0.5 text-xs text-zinc-500">{credit.role}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {galleryImages.length > 0 && (
        <section className="mt-8" aria-labelledby="album-gallery-heading">
          <h2 id="album-gallery-heading" className="mb-5 text-xs uppercase tracking-[0.3em] text-zinc-500">Gallery</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {galleryImages.map((image, index) => (
              <div
                key={`${image.url ?? ALBUM_FALLBACK_IMAGE}-${index}`}
                className="group relative aspect-square overflow-hidden rounded-xl border border-white/10"
              >
                <Image
                  src={image.url ?? ALBUM_FALLBACK_IMAGE}
                  alt={image.alt ?? `${album.title} - gallery image ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                  placeholder="blur"
                  blurDataURL={ALBUM_BLUR_DATA_URL}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {bandcampEmbedSrc && (
        <section className="mt-8 rounded-2xl border border-white/10 bg-zinc-950/70 p-6 md:p-8" aria-labelledby="album-listen-heading">
          <h2 id="album-listen-heading" className="mb-5 text-xs uppercase tracking-[0.3em] text-zinc-500">Listen</h2>
          <div className="overflow-hidden rounded-xl">
            <iframe
              src={bandcampEmbedSrc}
              title={`${album.title} Bandcamp player`}
              loading="lazy"
              className="h-[120px] w-full border-0"
              sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"
            />
          </div>
        </section>
      )}
    </main>
  );
}
