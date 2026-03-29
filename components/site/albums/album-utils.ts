import type {
  AlbumStatus,
  SanityAlbumBase,
  SanityPortableTextBlock,
  SanityStreamingPlatform,
} from "@/sanity/lib/types";

export const ALBUM_FALLBACK_IMAGE = "/images/album-placeholder.svg";
export const ALBUM_BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTgxODFiIi8+PC9zdmc+";

export const ALBUM_STATUS_META: Record<AlbumStatus, { badge: string; label: string }> = {
  draft: {
    badge: "border-zinc-400/30 bg-zinc-400/10 text-zinc-300",
    label: "Draft",
  },
  upcoming: {
    badge: "border-cyan-300/50 bg-cyan-300/10 text-cyan-200",
    label: "Upcoming",
  },
  released: {
    badge: "border-amber-300/40 bg-amber-300/10 text-amber-200",
    label: "Released",
  },
};

export const ALBUM_PLATFORM_LABELS: Record<SanityStreamingPlatform, string> = {
  spotify: "Spotify",
  appleMusic: "Apple Music",
  youtube: "YouTube",
  soundcloud: "SoundCloud",
  bandcamp: "Bandcamp",
};

export function formatAlbumDate(dateString: string, month: "short" | "long" = "short"): string {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Release date TBA";
  }

  return new Intl.DateTimeFormat("en-US", {
    month,
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function getPortableTextParagraphs(blocks?: SanityPortableTextBlock[]): string[] {
  if (!blocks || blocks.length === 0) {
    return [];
  }

  return blocks
    .map((block) => block.children?.map((child) => child.text ?? "").join("").trim() ?? "")
    .filter(Boolean);
}

export function getAlbumSummary(album: Pick<SanityAlbumBase, "shortDescription"> & { fullDescription?: SanityPortableTextBlock[] }): string {
  const paragraphs = getPortableTextParagraphs(album.fullDescription);
  return album.shortDescription ?? paragraphs[0] ?? "Explore this project from RTO Beats.";
}

export function getAlbumImageAlt(title: string, explicitAlt?: string): string {
  return explicitAlt?.trim() || `${title} cover art`;
}
