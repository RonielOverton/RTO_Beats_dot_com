import { ProductCardSkeleton } from "@/components/site/ProductCardSkeleton";

export default function StoreLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-14">
      {/* Page header skeleton */}
      <div className="mb-10 space-y-4">
        <div className="h-3 w-24 animate-pulse rounded-full bg-zinc-800" />
        <div className="h-12 w-96 max-w-full animate-pulse rounded bg-zinc-800" />
        <div className="h-5 w-full max-w-xl animate-pulse rounded bg-zinc-900" />
      </div>

      {/* Filter bar skeleton */}
      <div className="mb-8 flex flex-wrap gap-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-zinc-800" />
        ))}
      </div>

      {/* Product grid skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </main>
  );
}
