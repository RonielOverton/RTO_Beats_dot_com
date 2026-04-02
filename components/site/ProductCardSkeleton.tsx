export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/60">
      {/* Image placeholder */}
      <div className="h-52 w-full animate-pulse bg-zinc-900" />

      {/* Body */}
      <div className="space-y-4 p-5">
        {/* Kind + stock row */}
        <div className="flex items-center justify-between">
          <div className="h-3 w-20 animate-pulse rounded-full bg-zinc-800" />
          <div className="h-5 w-16 animate-pulse rounded-full bg-zinc-800" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="h-5 w-3/4 animate-pulse rounded bg-zinc-800" />
          <div className="h-5 w-1/2 animate-pulse rounded bg-zinc-900" />
        </div>

        {/* Description lines */}
        <div className="space-y-1.5">
          <div className="h-3.5 w-full animate-pulse rounded bg-zinc-900" />
          <div className="h-3.5 w-5/6 animate-pulse rounded bg-zinc-900" />
        </div>

        {/* Price + buttons row */}
        <div className="flex items-center justify-between pt-1">
          <div className="h-6 w-16 animate-pulse rounded bg-zinc-800" />
          <div className="flex gap-2">
            <div className="h-8 w-20 animate-pulse rounded-full bg-zinc-800" />
            <div className="h-8 w-20 animate-pulse rounded-full bg-zinc-800" />
          </div>
        </div>
      </div>
    </div>
  );
}
