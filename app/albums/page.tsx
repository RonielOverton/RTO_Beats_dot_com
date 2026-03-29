import type { Metadata } from "next";
import { AlbumCard } from "@/components/site/AlbumCard";
import { getAllAlbums } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Albums | RTO Beats",
  description: "Explore RTO Beats projects, releases, and full album experiences.",
};

export default function AlbumsPage() {
  const albums = getAllAlbums();

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-14">
      <div className="mb-10 space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Discography</p>
        <h1 className="text-4xl font-semibold text-zinc-50 md:text-5xl">Albums and Projects</h1>
        <p className="max-w-2xl text-zinc-300">
          Every release is generated from structured data so your discography scales without page rewrites.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {albums.map((album) => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </div>
    </main>
  );
}
