export default function AlbumDetailLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-14">
      <div className="mb-10 h-4 w-24 animate-pulse rounded bg-zinc-800" />

      <section className="grid gap-8 md:grid-cols-[360px_1fr] lg:grid-cols-[420px_1fr]">
        <div className="aspect-square w-full animate-pulse rounded-2xl border border-white/10 bg-zinc-900" />
        <div className="space-y-5">
          <div className="h-3 w-24 animate-pulse rounded-full bg-zinc-800" />
          <div className="h-14 w-3/4 animate-pulse rounded bg-zinc-800" />
          <div className="h-5 w-52 animate-pulse rounded bg-zinc-900" />
          <div className="flex gap-2">
            <div className="h-7 w-20 animate-pulse rounded-full bg-zinc-900" />
            <div className="h-7 w-24 animate-pulse rounded-full bg-zinc-900" />
          </div>
          <div className="space-y-3">
            <div className="h-4 w-full animate-pulse rounded bg-zinc-900" />
            <div className="h-4 w-11/12 animate-pulse rounded bg-zinc-900" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-zinc-900" />
          </div>
        </div>
      </section>

      <section className="mt-12 rounded-2xl border border-white/10 bg-zinc-950/70 p-6 md:p-8">
        <div className="mb-5 h-3 w-20 animate-pulse rounded-full bg-zinc-800" />
        <div className="space-y-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="h-14 animate-pulse rounded-xl bg-zinc-900" />
          ))}
        </div>
      </section>
    </main>
  );
}