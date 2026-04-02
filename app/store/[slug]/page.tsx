import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { BuyNowButton } from "@/components/store/BuyNowButton";
import { StructuredData } from "@/components/site/StructuredData";
import { getPortableTextParagraphs } from "@/components/site/albums/album-utils";
import { siteConfig } from "@/data/site";
import { formatMoney, getAllProducts, getProductBySlug } from "@/lib/catalog";
import { mapSanityAlbumToStoreItem, mapSanityProductToStoreItem, type SanityStoreAlbum } from "@/lib/store-mappers";
import { buildProductJsonLd } from "@/lib/seo";
import { isSanityConfigured } from "@/sanity/env";
import { sanityFetch } from "@/sanity/lib/client";
import { allAlbumSlugsQuery, albumBySlugQuery } from "@/sanity/lib/queries";
import { allProductSlugsQuery, productBySlugQuery } from "@/sanity/lib/queries/products";
import type { SanityProductDetail } from "@/sanity/lib/types/products";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const productSlugs = getAllProducts().map((item) => ({ slug: item.slug }));

  if (!isSanityConfigured) return productSlugs;

  const [sanityProductSlugs, albumSlugs] = await Promise.all([
    sanityFetch<{ slug: string }[]>({ query: allProductSlugsQuery, tags: ["product"] }),
    sanityFetch<{ slug: string }[]>({ query: allAlbumSlugsQuery, tags: ["album"] }),
  ]);

  const merged = new Map(productSlugs.map((entry) => [entry.slug, entry]));
  for (const p of sanityProductSlugs) {
    if (!merged.has(p.slug)) merged.set(p.slug, { slug: p.slug });
  }
  for (const a of albumSlugs) {
    if (!merged.has(a.slug)) merged.set(a.slug, { slug: a.slug });
  }

  return [...merged.values()];
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  let item = getProductBySlug(slug);

  if (!item && isSanityConfigured) {
    const sanityProduct = await sanityFetch<SanityProductDetail | null>({
      query: productBySlugQuery,
      params: { slug },
      tags: ["product"],
    });
    if (sanityProduct) item = mapSanityProductToStoreItem(sanityProduct);
  }

  if (!item && isSanityConfigured) {
    const album = await sanityFetch<SanityStoreAlbum | null>({
      query: albumBySlugQuery,
      params: { slug },
      tags: ["album"],
    });
    if (album) item = mapSanityAlbumToStoreItem(album);
  }

  if (!item) return { title: "Product not found | RTO Beats" };

  return {
    title: `${item.title} | RTO Store`,
    description: item.shortDescription,
    alternates: { canonical: `/store/${item.slug}` },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  let item = getProductBySlug(slug);
  let rawProduct: SanityProductDetail | null = null;

  if (!item && isSanityConfigured) {
    const sanityProduct = await sanityFetch<SanityProductDetail | null>({
      query: productBySlugQuery,
      params: { slug },
      tags: ["product"],
    });
    if (sanityProduct) {
      rawProduct = sanityProduct;
      item = mapSanityProductToStoreItem(sanityProduct);
    }
  }

  if (!item && isSanityConfigured) {
    const album = await sanityFetch<SanityStoreAlbum | null>({
      query: albumBySlugQuery,
      params: { slug },
      tags: ["album"],
    });
    if (album) item = mapSanityAlbumToStoreItem(album);
  }

  if (!item) notFound();

  const hasExternalCheckout = Boolean(item.checkout.externalCheckoutUrl);
  const hasStripeCheckout = Boolean(item.checkout.stripePriceId) || item.price > 0;
  const canAddToCart = !hasExternalCheckout && item.price > 0 && item.stockStatus !== "out-of-stock";
  const canBuyNow = !hasExternalCheckout && hasStripeCheckout && item.stockStatus !== "out-of-stock";

  const descriptionParagraphs = getPortableTextParagraphs(rawProduct?.fullDescription);
  const galleryImages = rawProduct?.previewImages ?? [];
  const isBeat = rawProduct?.kind === "beat";
  const hasBeatMeta = isBeat && (rawProduct?.bpm || rawProduct?.key || rawProduct?.licenseType);
  const isDigital = rawProduct?.downloadable;

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-14">
      <StructuredData data={buildProductJsonLd(item, siteConfig.siteUrl)} />

      <Link href="/store" className="text-xs uppercase tracking-[0.25em] text-zinc-500 hover:text-zinc-300 transition">
        ← Back to store
      </Link>

      <section className="grid gap-10 md:grid-cols-[400px_1fr]">
        {/* Product image */}
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/10">
          <Image src={item.image} alt={item.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 400px" />
        </div>

        {/* Product info */}
        <div className="space-y-6">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{item.kind.replace("-", " ")}</p>
            <h1 className="text-4xl font-semibold text-zinc-50 md:text-5xl">{item.title}</h1>
          </div>

          <p className="text-3xl font-semibold text-amber-200">{formatMoney(item.price, item.currency)}</p>

          {/* Short description — always shown */}
          <p className="text-zinc-300 leading-relaxed">{item.description || item.shortDescription}</p>

          {/* Full description (Portable Text) */}
          {descriptionParagraphs.length > 0 && (
            <div className="space-y-3 border-t border-white/10 pt-4">
              {descriptionParagraphs.map((p, i) => (
                <p key={i} className="text-zinc-400 leading-relaxed text-sm">
                  {p}
                </p>
              ))}
            </div>
          )}

          {/* Beat metadata panel */}
          {hasBeatMeta && (
            <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Beat Details</p>
              <div className="grid grid-cols-3 gap-4">
                {rawProduct?.bpm && (
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-0.5">BPM</p>
                    <p className="text-lg font-semibold text-zinc-100">{rawProduct.bpm}</p>
                  </div>
                )}
                {rawProduct?.key && (
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-0.5">Key</p>
                    <p className="text-lg font-semibold text-zinc-100">{rawProduct.key}</p>
                  </div>
                )}
                {rawProduct?.licenseType && (
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-0.5">License</p>
                    <p className="text-lg font-semibold text-zinc-100">{rawProduct.licenseType}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Digital download info */}
          {isDigital && (
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-cyan-300/50 bg-cyan-300/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">
                Digital Delivery
              </span>
              {rawProduct?.downloadVersion && (
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                  v{rawProduct.downloadVersion}
                </span>
              )}
            </div>
          )}

          {/* Stock badge */}
          {item.stockStatus === "limited" && (
            <span className="inline-block rounded-full border border-cyan-300/50 bg-cyan-300/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">
              Limited stock
            </span>
          )}
          {item.stockStatus === "preorder" && (
            <span className="inline-block rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-amber-200">
              Pre-order
            </span>
          )}
          {item.stockStatus === "out-of-stock" && (
            <span className="inline-block rounded-full border border-zinc-500/40 bg-zinc-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-zinc-400">
              Out of stock
            </span>
          )}

          {/* Checkout actions */}
          <div className="flex flex-wrap items-start gap-3 pt-2">
            {canBuyNow && <BuyNowButton item={item} />}
            {canAddToCart && <AddToCartButton item={item} />}
            {hasExternalCheckout && (
              <a
                href={item.checkout.externalCheckoutUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-black transition hover:bg-amber-200"
              >
                Buy on Bandcamp
              </a>
            )}
          </div>

          {/* Related album cross-link */}
          {rawProduct?.relatedAlbumSlug && (
            <Link
              href={`/albums/${rawProduct.relatedAlbumSlug}`}
              className="inline-flex items-center gap-2 text-sm text-amber-200/80 hover:text-amber-200 transition"
            >
              View full album
              <span aria-hidden>→</span>
            </Link>
          )}

          {/* Tags */}
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
              {item.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-white/15 px-3 py-1 text-xs text-zinc-300">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Gallery images */}
      {galleryImages.length > 0 && (
        <section className="space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Gallery</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {galleryImages.map((img, i) => (
              <div
                key={i}
                className="relative aspect-square overflow-hidden rounded-xl border border-white/10"
              >
                {img.url && (
                  <Image
                    src={img.url}
                    alt={img.alt ?? `${item.title} preview ${i + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
