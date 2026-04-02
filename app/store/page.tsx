import type { Metadata } from "next";
import { CategoryFilter } from "@/components/site/CategoryFilter";
import { ProductCard } from "@/components/site/ProductCard";
import { getProductsByKind } from "@/lib/catalog";
import { mapSanityAlbumToStoreItem, mapSanityProductToStoreItem, type SanityStoreAlbum } from "@/lib/store-mappers";
import { isSanityConfigured } from "@/sanity/env";
import { sanityFetch } from "@/sanity/lib/client";
import { allAlbumsQuery } from "@/sanity/lib/queries";
import { allProductsQuery } from "@/sanity/lib/queries/products";
import type { SanityProductListItem } from "@/sanity/lib/types/products";
import type { ProductKind } from "@/types/content";

export const metadata: Metadata = {
  title: "Store | RTO Beats",
  description: "Shop albums, beats, plugins, merch, and digital downloads from RTO Beats.",
};

interface StorePageProps {
  searchParams: Promise<{ category?: string }>;
}

const allowedKinds: Array<ProductKind | "all"> = [
  "all",
  "album",
  "beat",
  "plugin",
  "merch",
  "digital-download",
];

export default async function StorePage({ searchParams }: StorePageProps) {
  const { category } = await searchParams;
  const selected = allowedKinds.includes(category as ProductKind | "all")
    ? (category as ProductKind | "all")
    : "all";

  const localItems = getProductsByKind("all");

  const [sanityProducts, sanityAlbums] = await Promise.all([
    isSanityConfigured
      ? sanityFetch<SanityProductListItem[]>({ query: allProductsQuery, tags: ["product"] })
      : Promise.resolve([]),
    isSanityConfigured
      ? sanityFetch<SanityStoreAlbum[]>({ query: allAlbumsQuery, tags: ["album"] })
      : Promise.resolve([]),
  ]);

  // Priority: local > Sanity products > Sanity albums (dedup by slug)
  const mergedBySlug = new Map(localItems.map((item) => [item.slug, item]));

  for (const p of sanityProducts.map(mapSanityProductToStoreItem)) {
    if (!mergedBySlug.has(p.slug)) mergedBySlug.set(p.slug, p);
  }
  for (const a of sanityAlbums.map(mapSanityAlbumToStoreItem)) {
    if (!mergedBySlug.has(a.slug)) mergedBySlug.set(a.slug, a);
  }

  const allItems = [...mergedBySlug.values()].sort((a, b) =>
    a.featured === b.featured ? 0 : a.featured ? -1 : 1
  );
  const items = selected === "all" ? allItems : allItems.filter((item) => item.kind === selected);

  const kindLabel: Record<string, string> = {
    all: "All products",
    album: "Albums",
    beat: "Beats",
    plugin: "Plugins",
    merch: "Merch",
    "digital-download": "Digital downloads",
  };

  return (
    <main className="mx-auto w-full max-w-6xl space-y-10 px-6 py-14">
      {/* Page header */}
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Online store</p>
        <h1 className="text-4xl font-semibold text-zinc-50 md:text-5xl">
          Shop RTO Beats
        </h1>
        <p className="max-w-xl text-zinc-400">
          Albums, beats, plugins, merch, and digital downloads — everything ships from one place.
        </p>
      </div>

      {/* Category filter */}
      <CategoryFilter selected={selected} />

      {/* Result count */}
      <p className="text-xs uppercase tracking-[0.25em] text-zinc-600">
        {kindLabel[selected] ?? "Products"} &mdash; {items.length} item{items.length !== 1 ? "s" : ""}
      </p>

      {/* Product grid */}
      {items.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 py-20 text-center">
          <p className="text-zinc-400">No {kindLabel[selected]?.toLowerCase() ?? "items"} available right now.</p>
          <a href="/store" className="mt-4 inline-block text-xs uppercase tracking-[0.25em] text-amber-200 hover:text-amber-100 transition">
            View all products
          </a>
        </div>
      )}
    </main>
  );
}
