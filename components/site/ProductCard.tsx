import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { formatMoney } from "@/lib/catalog";
import type { StoreItem } from "@/types/content";

interface ProductCardProps {
  item: StoreItem;
}

export function ProductCard({ item }: ProductCardProps) {
  const hasExternalCheckout = Boolean(item.checkout.externalCheckoutUrl);
  const canAddToCart =
    !hasExternalCheckout && item.price > 0 && item.stockStatus !== "out-of-stock";

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/60 transition hover:-translate-y-0.5 hover:border-amber-200/25 hover:shadow-xl hover:shadow-amber-300/5">
      {/* Cover image */}
      <div className="relative h-52 w-full overflow-hidden">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Card body */}
      <div className="space-y-4 p-5">
        {/* Kind + stock */}
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.22em] text-zinc-500">
            {item.kind.replace("-", " ")}
          </span>
          {item.stockStatus === "limited" && (
            <span className="rounded-full border border-cyan-300/50 bg-cyan-300/10 px-2 py-0.5 text-xs text-cyan-200">
              Limited
            </span>
          )}
          {item.stockStatus === "preorder" && (
            <span className="rounded-full border border-amber-300/40 bg-amber-300/10 px-2 py-0.5 text-xs text-amber-200">
              Pre-order
            </span>
          )}
          {item.stockStatus === "out-of-stock" && (
            <span className="rounded-full border border-zinc-500/40 bg-zinc-500/10 px-2 py-0.5 text-xs text-zinc-400">
              Out of stock
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold leading-snug text-zinc-50">{item.title}</h3>
        <p className="line-clamp-2 text-sm text-zinc-400">{item.shortDescription}</p>

        {/* Price + actions */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <p className="text-lg font-semibold text-amber-200">{formatMoney(item.price, item.currency)}</p>

          <div className="flex items-center gap-2">
            <Link
              href={`/store/${item.slug}`}
              className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300 transition hover:border-white/40"
            >
              Details
            </Link>

            {hasExternalCheckout && (
              <a
                href={item.checkout.externalCheckoutUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-full bg-amber-300 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-amber-200"
              >
                Buy now
              </a>
            )}

            {canAddToCart && <AddToCartButton item={item} compact />}
          </div>
        </div>
      </div>
    </article>
  );
}

