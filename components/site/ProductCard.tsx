import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "@/lib/catalog";
import type { StoreItem } from "@/types/content";

interface ProductCardProps {
  item: StoreItem;
}

export function ProductCard({ item }: ProductCardProps) {
  const hasExternalCheckout = Boolean(item.checkout.externalCheckoutUrl);

  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/60 transition hover:border-amber-200/30">
      <div className="relative h-52 w-full">
        <Image src={item.image} alt={item.title} fill className="object-cover" />
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-zinc-500">
          <span>{item.kind.replace("-", " ")}</span>
          <span>{item.stockStatus}</span>
        </div>
        <h3 className="text-xl font-semibold text-zinc-50">{item.title}</h3>
        <p className="text-sm text-zinc-300">{item.shortDescription}</p>
        <div className="flex items-center justify-between">
          <p className="text-lg font-medium text-amber-200">{formatMoney(item.price, item.currency)}</p>
          <div className="flex items-center gap-2">
            <Link
              href={`/store/${item.slug}`}
              className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-200"
            >
              Details
            </Link>
            {hasExternalCheckout && (
              <a
                href={item.checkout.externalCheckoutUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-full bg-amber-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-amber-200"
              >
                Buy now
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
