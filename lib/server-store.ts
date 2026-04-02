import "server-only";
import { getProductBySlug } from "@/lib/catalog";
import { mapSanityAlbumToStoreItem, mapSanityProductToStoreItem, type SanityStoreAlbum } from "@/lib/store-mappers";
import type { StoreItem } from "@/types/content";
import { isSanityConfigured } from "@/sanity/env";
import { sanityFetch } from "@/sanity/lib/client";
import { albumBySlugQuery } from "@/sanity/lib/queries";
import { productBySlugQuery } from "@/sanity/lib/queries/products";
import type { SanityProductDetail } from "@/sanity/lib/types/products";

export async function getStoreItemBySlug(slug: string): Promise<StoreItem | null> {
  const localItem = getProductBySlug(slug);
  if (localItem) {
    return localItem;
  }

  if (!isSanityConfigured) {
    return null;
  }

  const sanityProduct = await sanityFetch<SanityProductDetail | null>({
    query: productBySlugQuery,
    params: { slug },
    tags: ["product"],
  });

  if (sanityProduct) {
    return mapSanityProductToStoreItem(sanityProduct);
  }

  const sanityAlbum = await sanityFetch<SanityStoreAlbum | null>({
    query: albumBySlugQuery,
    params: { slug },
    tags: ["album"],
  });

  return sanityAlbum ? mapSanityAlbumToStoreItem(sanityAlbum) : null;
}