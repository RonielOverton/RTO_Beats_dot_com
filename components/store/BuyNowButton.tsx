"use client";

import { useState } from "react";
import type { StoreItem } from "@/types/content";

interface BuyNowButtonProps {
  item: StoreItem;
  className?: string;
}

/**
 * Initiates a Stripe Checkout session for a single product and redirects
 * the user to the Stripe-hosted payment page.
 */
export function BuyNowButton({ item, className }: BuyNowButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBuyNow() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "buy-now",
          product: {
            slug: item.slug,
          },
        }),
      });

      const data = (await res.json()) as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Checkout failed — please try again.");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <button
        onClick={handleBuyNow}
        disabled={loading}
        className={`rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-black transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60 ${className ?? ""}`}
      >
        {loading ? "Redirecting…" : "Buy Now"}
      </button>
      {error && (
        <p className="text-xs text-red-300">{error}</p>
      )}
    </div>
  );
}
