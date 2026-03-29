import { albums } from "@/data/albums";
import { products } from "@/data/products";
import type { Album, ProductKind, StoreItem } from "@/types/content";

export const productKinds: ProductKind[] = ["album", "beat", "plugin", "merch", "digital-download"];

export function getAllAlbums(): Album[] {
  return [...albums].sort((a, b) => (a.releaseDate < b.releaseDate ? 1 : -1));
}

export function getFeaturedAlbums(limit = 3): Album[] {
  return getAllAlbums().filter((album) => album.featured).slice(0, limit);
}

export function getAlbumBySlug(slug: string): Album | undefined {
  return albums.find((album) => album.slug === slug);
}

export function getAllProducts(): StoreItem[] {
  return [...products].sort((a, b) => (a.featured === b.featured ? 0 : a.featured ? -1 : 1));
}

export function getFeaturedProducts(limit = 4): StoreItem[] {
  return getAllProducts().filter((product) => product.featured).slice(0, limit);
}

export function getProductBySlug(slug: string): StoreItem | undefined {
  return products.find((product) => product.slug === slug);
}

export function getProductsByKind(kind: ProductKind | "all"): StoreItem[] {
  const all = getAllProducts();
  if (kind === "all") {
    return all;
  }
  return all.filter((item) => item.kind === kind);
}

export function formatMoney(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}
