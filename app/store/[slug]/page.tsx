import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { StructuredData } from "@/components/site/StructuredData";
import { siteConfig } from "@/data/site";
import { formatMoney, getAllProducts, getProductBySlug } from "@/lib/catalog";
import { mapSanityAlbumToStoreItem, type SanityStoreAlbum } from "@/lib/store-mappers";
import { buildProductJsonLd } from "@/lib/seo";
import { isSanityConfigured } from "@/sanity/env";
import { sanityFetch } from "@/sanity/lib/client";
import { allAlbumSlugsQuery, albumBySlugQuery } from "@/sanity/lib/queries";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const productSlugs = getAllProducts().map((item) => ({ slug: item.slug }));

  if (!isSanityConfigured) {
    return productSlugs;
  }

  const albumSlugs = await sanityFetch<{ slug: string }[]>({
    query: allAlbumSlugsQuery,
    tags: ["album"],
  });

  const merged = new Map(productSlugs.map((entry) => [entry.slug, entry]));
  for (const album of albumSlugs) {
    if (!merged.has(album.slug)) {
      merged.set(album.slug, { slug: album.slug });
    }
  }

  return [...merged.values()];
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  let item = getProductBySlug(slug);

  if (!item && isSanityConfigured) {
    const album = await sanityFetch<SanityStoreAlbum | null>({
      query: albumBySlugQuery,
      params: { slug },
      tags: ["album"],
    });

    if (album) {
      item = mapSanityAlbumToStoreItem(album);
    }
  }

  if (!item) {
    return {
      title: "Product not found | RTO Beats",
    };
  }

  return {
    title: `${item.title} | RTO Store`,
    description: item.shortDescription,
    alternates: {
      canonical: `/store/${item.slug}`,
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  let item = getProductBySlug(slug);

  if (!item && isSanityConfigured) {
    const album = await sanityFetch<SanityStoreAlbum | null>({
      query: albumBySlugQuery,
      params: { slug },
      tags: ["album"],
    });

    if (album) {
      item = mapSanityAlbumToStoreItem(album);
    }
  }

  if (!item) {
    notFound();
  }

  const hasExternalCheckout = Boolean(item.checkout.externalCheckoutUrl);
  const hasProviderCheckout = Boolean(
    item.checkout.stripePriceId || item.checkout.shopifyVariantId
  );
  const canAddToCart = !hasExternalCheckout && item.price > 0 && item.stockStatus !== "out-of-stock";

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-14">
      <StructuredData data={buildProductJsonLd(item, siteConfig.siteUrl)} />
      <section className="grid gap-8 md:grid-cols-[360px_1fr]">
        <div className="relative w-full overflow-hidden rounded-2xl border border-white/10">
          <Image src={item.image} alt={item.title} width={720} height={720} className="w-full object-cover" />
        </div>
        <div className="space-y-5">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{item.kind.replace("-", " ")}</p>
          <h1 className="text-4xl font-semibold text-zinc-50 md:text-5xl">{item.title}</h1>
          <p className="text-zinc-300">{item.description}</p>
          <p className="text-2xl font-semibold text-amber-200">{formatMoney(item.price, item.currency)}</p>

          <div className="flex flex-wrap gap-3">
            {canAddToCart && <AddToCartButton item={item} />}

            {hasProviderCheckout && (
              <Link
                href="/api/checkout"
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-100"
              >
                Checkout integration
              </Link>
            )}
          </div>

          {hasExternalCheckout && (
            <p className="text-sm text-zinc-400">Available on Bandcamp from the store card quick buy action.</p>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            {item.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-white/20 px-3 py-1 text-xs text-zinc-200">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
