import Link from "next/link";
import { getFeaturedAlbums, getFeaturedProducts } from "@/lib/catalog";
import { AlbumCard } from "@/components/site/AlbumCard";
import { ProductCard } from "@/components/site/ProductCard";

export function FeaturedWorkSection() {
  const featuredAlbums = getFeaturedAlbums(2);
  const featuredProducts = getFeaturedProducts(2);

  return (
    <section className="mx-auto w-full max-w-6xl space-y-14 px-6 py-16">
      <div>
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-3xl font-semibold text-zinc-50 md:text-4xl">Featured projects</h2>
          <Link href="/albums" className="text-sm uppercase tracking-[0.18em] text-amber-100/80">
            All albums
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {featuredAlbums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-3xl font-semibold text-zinc-50 md:text-4xl">Featured store drops</h2>
          <Link href="/store" className="text-sm uppercase tracking-[0.18em] text-amber-100/80">
            Visit store
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {featuredProducts.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
