"use client";

import { useCart } from "@/components/cart/CartProvider";
import type { StoreItem } from "@/types/content";

interface AddToCartButtonProps {
  item: StoreItem;
}

export function AddToCartButton({ item }: AddToCartButtonProps) {
  const { addToCart } = useCart();

  return (
    <button
      onClick={() => addToCart(item, 1)}
      className="rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-black transition hover:bg-amber-200"
    >
      Add to cart
    </button>
  );
}
