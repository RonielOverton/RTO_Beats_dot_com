import { AlbumCard } from "./AlbumCard";
import type { SanityAlbumListItem } from "@/sanity/lib/types";

interface SanityAlbumCardProps {
  album: SanityAlbumListItem;
}

export function SanityAlbumCard({ album }: SanityAlbumCardProps) {
  return (
    <AlbumCard
      title={album.title}
      slug={album.slug}
      coverImage={album.coverImage ?? null}
      releaseDate={album.releaseDate}
      status={album.status}
      shortDescription={album.shortDescription}
    />
  );
}
