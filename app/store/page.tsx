import type { Metadata } from "next";
import { CategoryFilter } from "@/components/site/CategoryFilter";
import { ProductCard } from "@/components/site/ProductCard";
import { getProductsByKind } from "@/lib/catalog";
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

  const items = getProductsByKind(selected);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-14">
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Online store</p>
        <h1 className="text-4xl font-semibold text-zinc-50 md:text-5xl">Albums, Beats, Plugins and Merch</h1>
        <p className="max-w-2xl text-zinc-300">
          Products are rendered from typed data entries. Add a new item once and it appears in listings and detail pages.
        </p>
      </div>

      <CategoryFilter selected={selected} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <ProductCard key={item.id} item={item} />
        ))}
      </div>
    </main>
  );
}
