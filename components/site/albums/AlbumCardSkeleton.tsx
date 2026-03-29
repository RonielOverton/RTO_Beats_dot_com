export function AlbumCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/70">
      <div className="aspect-square w-full animate-pulse bg-zinc-900 sm:aspect-[4/3]" />
      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="h-3 w-28 animate-pulse rounded-full bg-zinc-800" />
          <div className="h-6 w-20 animate-pulse rounded-full bg-zinc-800" />
        </div>
        <div className="space-y-2">
          <div className="h-6 w-3/4 animate-pulse rounded bg-zinc-800" />
          <div className="h-6 w-1/2 animate-pulse rounded bg-zinc-900" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-zinc-900" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-zinc-900" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-900" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded-full bg-zinc-800" />
      </div>
    </div>
  );
}