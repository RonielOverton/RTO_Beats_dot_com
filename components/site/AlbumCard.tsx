import Image from "next/image";
import Link from "next/link";
import type { Album } from "@/types/content";

interface AlbumCardProps {
  album: Album;
}

export function AlbumCard({ album }: AlbumCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/60 transition hover:border-amber-200/30">
      <div className="relative h-52 w-full">
        <Image src={album.coverImage} alt={album.title} fill className="object-cover" />
      </div>
      <div className="space-y-4 p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{album.year}</p>
        <h3 className="text-2xl font-semibold text-zinc-50">{album.title}</h3>
        <p className="text-sm text-zinc-300">{album.shortDescription}</p>
        <Link
          href={`/albums/${album.slug}`}
          className="inline-flex rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-200"
        >
          View project
        </Link>
      </div>
    </article>
  );
}
