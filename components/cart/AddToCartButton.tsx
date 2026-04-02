"use client";

import { useCart } from "@/components/cart/CartProvider";
import type { StoreItem } from "@/types/content";

interface AddToCartButtonProps {
  item: StoreItem;
  /** Renders a smaller pill button for use inside product cards */
  compact?: boolean;
}

export function AddToCartButton({ item, compact = false }: AddToCartButtonProps) {
  const { addToCart } = useCart();

  if (compact) {
    return (
      <button
        onClick={() => addToCart(item, 1)}
        className="rounded-full border border-amber-200/35 bg-amber-200/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-amber-100 transition hover:border-amber-100/60"
        title="Add to cart"
      >
        + Cart
      </button>
    );
  }

  return (
    <button
      onClick={() => addToCart(item, 1)}
      className="rounded-full border border-amber-200/35 bg-amber-200/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-amber-100 transition hover:border-amber-100/60"
    >
      Add to cart
    </button>
  );
}

