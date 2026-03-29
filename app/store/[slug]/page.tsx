import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { StructuredData } from "@/components/site/StructuredData";
import { siteConfig } from "@/data/site";
import { formatMoney, getAllProducts, getProductBySlug } from "@/lib/catalog";
import { buildProductJsonLd } from "@/lib/seo";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllProducts().map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getProductBySlug(slug);

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
  const item = getProductBySlug(slug);

  if (!item) {
    notFound();
  }

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
            <AddToCartButton item={item} />
            {(item.checkout.stripePriceId || item.checkout.shopifyVariantId || item.checkout.externalCheckoutUrl) && (
              <Link
                href="/api/checkout"
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-100"
              >
                Checkout integration
              </Link>
            )}
          </div>

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
