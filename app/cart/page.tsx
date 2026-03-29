import type { Metadata } from "next";
import { CartTable } from "@/components/cart/CartTable";

export const metadata: Metadata = {
  title: "Cart | RTO Beats",
  description: "Review your cart and prepare checkout.",
};

export default function CartPage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-14">
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Shopping cart</p>
        <h1 className="text-4xl font-semibold text-zinc-50 md:text-5xl">Cart structure</h1>
      </div>
      <CartTable />
    </main>
  );
}
