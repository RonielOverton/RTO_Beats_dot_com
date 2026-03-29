import { AlbumCardSkeleton } from "@/components/site/albums/AlbumCardSkeleton";

export default function AlbumsLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-14">
      <div className="mb-10 space-y-4">
        <div className="h-3 w-28 animate-pulse rounded-full bg-zinc-800" />
        <div className="h-12 w-80 max-w-full animate-pulse rounded bg-zinc-800" />
        <div className="h-5 w-full max-w-2xl animate-pulse rounded bg-zinc-900" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <AlbumCardSkeleton key={index} />
        ))}
      </div>
    </main>
  );
}