import type { Metadata } from "next";
import { AlbumsEmptyState, AlbumsSetupState } from "@/components/site/albums/AlbumStates";
import { SanityAlbumCard } from "@/components/site/albums/SanityAlbumCard";
import { allAlbumsQuery } from "@/sanity/lib/queries";
import { sanityFetch } from "@/sanity/lib/client";
import type { SanityAlbumListItem } from "@/sanity/lib/types";
import { isSanityConfigured } from "@/sanity/env";

export const metadata: Metadata = {
  title: "Albums | RTO Beats",
  description: "Explore albums from RTO Beats, fetched live from Sanity.",
  alternates: {
    canonical: "/albums",
  },
  openGraph: {
    title: "Albums | RTO Beats",
    description: "Explore albums from RTO Beats, fetched live from Sanity.",
    url: "/albums",
    type: "website",
  },
};

export default async function AlbumsPage() {
  const albums = isSanityConfigured
    ? await sanityFetch<SanityAlbumListItem[]>({
        query: allAlbumsQuery,
        tags: ["album"],
      })
    : [];

  const sortedAlbums = [...albums].sort((a, b) => (a.releaseDate < b.releaseDate ? 1 : -1));

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-14">
      <div className="mb-10 space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Discography</p>
        <h1 className="text-4xl font-semibold text-zinc-50 md:text-5xl">Albums and Projects</h1>
        <p className="max-w-2xl text-zinc-300">
          Every card is loaded from Sanity and sorted by release date, so updates in your CMS instantly drive this page.
        </p>
      </div>

      {!isSanityConfigured ? (
        <AlbumsSetupState />
      ) : sortedAlbums.length === 0 ? (
        <AlbumsEmptyState />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-label="Albums list">
          {sortedAlbums.map((album) => (
            <SanityAlbumCard key={album._id} album={album} />
          ))}
        </div>
      )}
    </main>
  );
}
