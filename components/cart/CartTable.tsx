"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { formatMoney } from "@/lib/catalog";

export function CartTable() {
  const { lines, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  async function handleCheckout() {
    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "cart",
          lines: lines.map((line) => ({
            slug: line.slug,
            quantity: line.quantity,
          })),
        }),
      });

      const data = (await res.json()) as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Checkout failed — please try again.");
      }

      window.location.href = data.url;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Something went wrong.");
      setCheckoutLoading(false);
    }
  }

  if (!lines.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-8 text-zinc-300">
        <p>Your cart is empty.</p>
        <Link href="/store" className="mt-4 inline-block text-amber-200 underline">
          Browse the store
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-2xl border border-white/10 bg-zinc-950/70 p-5 md:p-8">
      <div className="space-y-4">
        {lines.map((line) => (
          <div key={line.itemId} className="grid gap-4 border-b border-white/10 pb-4 md:grid-cols-[1fr_auto_auto_auto] md:items-center">
            <div>
              <p className="text-lg font-semibold text-zinc-100">{line.title}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{line.kind.replace("-", " ")}</p>
            </div>
            <p className="text-zinc-300">{formatMoney(line.unitPrice)}</p>
            <input
              min={1}
              type="number"
              value={line.quantity}
              onChange={(e) => updateQuantity(line.itemId, Number(e.target.value))}
              className="w-20 rounded-md border border-white/20 bg-transparent px-2 py-1 text-zinc-100"
            />
            <button className="text-sm text-red-300 hover:text-red-200 transition" onClick={() => removeFromCart(line.itemId)}>
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-xl font-semibold text-amber-200">Subtotal: {formatMoney(subtotal)}</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            className="rounded-full border border-white/20 px-5 py-2 text-sm text-zinc-200 hover:border-white/40 transition"
            onClick={clearCart}
          >
            Clear cart
          </button>
          <button
            onClick={handleCheckout}
            disabled={checkoutLoading}
            className="rounded-full bg-amber-300 px-6 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-black transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {checkoutLoading ? "Redirecting…" : "Checkout"}
          </button>
        </div>
      </div>

      {checkoutError && (
        <p className="text-xs text-red-300">{checkoutError}</p>
      )}
    </div>
  );
}

