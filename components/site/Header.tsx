"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/albums", label: "Albums" },
  { href: "/store", label: "Store" },
  { href: "/cart", label: "Cart" },
];

export function Header() {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-semibold uppercase tracking-[0.2em] text-amber-200">
          RTO BEATS
        </Link>
        <nav className="flex items-center gap-4 text-sm text-neutral-300 md:gap-7">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-amber-100">
              {item.label}
            </Link>
          ))}
          <span className="rounded-full border border-amber-200/30 px-3 py-1 text-xs text-amber-100">
            {totalItems} items
          </span>
        </nav>
      </div>
    </header>
  );
}
