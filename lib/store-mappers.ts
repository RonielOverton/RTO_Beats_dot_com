import type { SanityPortableTextBlock } from "@/sanity/lib/types";
import type { StoreItem } from "@/types/content";

const STORE_ALBUM_FALLBACK_IMAGE = "/images/album-placeholder.svg";

export interface SanityStoreAlbum {
  _id: string;
  title: string;
  slug: string;
  status: "draft" | "upcoming" | "released";
  shortDescription?: string;
  fullDescription?: SanityPortableTextBlock[];
  coverImage?: { url?: string; alt?: string } | null;
  bandcampUrl?: string;
}

export function mapSanityAlbumToStoreItem(album: SanityStoreAlbum): StoreItem {
  const summary = album.shortDescription?.trim() || firstParagraph(album.fullDescription) || `${album.title} by RTO Beats.`;

  return {
    id: `sanity-album-${album._id}`,
    slug: album.slug,
    kind: "album",
    title: album.title,
    shortDescription: summary,
    description: summary,
    image: album.coverImage?.url || STORE_ALBUM_FALLBACK_IMAGE,
    price: 0,
    currency: "USD",
    featured: false,
    tags: ["album", album.status],
    stockStatus: album.status === "upcoming" ? "preorder" : "in-stock",
    checkout: {
      externalCheckoutUrl: album.bandcampUrl,
    },
    relatedAlbumSlug: album.slug,
    downloadable: true,
  };
}

function firstParagraph(blocks?: SanityPortableTextBlock[]): string {
  if (!blocks || blocks.length === 0) return "";

  return blocks
    .map((block) => block.children?.map((child) => child.text ?? "").join(" ").trim() ?? "")
    .find(Boolean) ?? "";
}