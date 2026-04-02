import type { SanityPortableTextBlock } from "@/sanity/lib/types";
import type { SanityProductDetail } from "@/sanity/lib/types/products";
import type { ProductKind, StoreItem } from "@/types/content";

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

const SANITY_KIND_MAP: Record<string, ProductKind> = {
  album: "album",
  merch: "merch",
  beat: "beat",
  plugin: "plugin",
  digital: "digital-download",
};

/**
 * Maps a Sanity `product` document (fetched via productBySlugQuery or allProductsQuery)
 * into the frontend StoreItem shape.
 */
export function mapSanityProductToStoreItem(product: SanityProductDetail): StoreItem {
  const summary = product.shortDescription?.trim() || "";
  const description = firstParagraph(product.fullDescription) || summary;

  return {
    id: `sanity-product-${product._id}`,
    slug: product.slug,
    kind: SANITY_KIND_MAP[product.kind ?? "digital"] ?? "digital-download",
    title: product.title,
    shortDescription: summary,
    description,
    image: product.image?.url || "/images/album-placeholder.svg",
    price: product.price?.amount ?? 0,
    currency: "USD",
    featured: product.featured ?? false,
    tags: product.tags ?? [],
    stockStatus: product.stockStatus ?? "in-stock",
    checkout: {
      stripePriceId: product.checkout?.stripePriceId,
      externalCheckoutUrl: product.checkout?.externalCheckoutUrl ?? undefined,
    },
    relatedAlbumSlug: product.relatedAlbumSlug,
    downloadable: product.downloadable ?? false,
  };
}