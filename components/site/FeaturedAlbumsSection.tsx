import Link from "next/link";
import { SanityAlbumCard } from "@/components/site/albums/SanityAlbumCard";
import { sanityFetch } from "@/sanity/lib/client";
import { featuredAlbumsQuery } from "@/sanity/lib/queries";
import type { SanityAlbumListItem } from "@/sanity/lib/types";
import { isSanityConfigured } from "@/sanity/env";

// Clamp between 3 and 6 featured slots
const FEATURED_LIMIT = 6;

export async function FeaturedAlbumsSection() {
  const albums: SanityAlbumListItem[] = isSanityConfigured
    ? await sanityFetch<SanityAlbumListItem[]>({
        query: featuredAlbumsQuery,
        params: { limit: FEATURED_LIMIT },
        tags: ["album"],
      })
    : [];

  // Hide section entirely when there's nothing to show
  if (albums.length === 0) return null;

  return (
    <section className="relative overflow-hidden py-20">
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(245,158,11,0.07),transparent)] "
      />

      <div className="relative mx-auto w-full max-w-6xl px-6">
        {/* Section header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Discography</p>
            <h2 className="text-3xl font-semibold text-zinc-50 md:text-4xl">
              Featured projects
            </h2>
          </div>

          <Link
            href="/albums"
            className="group inline-flex items-center gap-1.5 text-sm uppercase tracking-[0.18em] text-amber-100/70 transition-colors hover:text-amber-100"
          >
            View all albums
            <svg
              aria-hidden="true"
              className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {/* Album grid — responsive: 1 → 2 → 3 columns */}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {albums.map((album) => (
            <SanityAlbumCard key={album._id} album={album} />
          ))}
        </div>
      </div>
    </section>
  );
}
