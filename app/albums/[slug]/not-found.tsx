import Link from "next/link";

export default function AlbumNotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-4xl items-center px-6 py-14">
      <section className="w-full rounded-3xl border border-white/10 bg-zinc-950/75 p-8 md:p-12">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Album not found</p>
        <h1 className="mt-4 text-4xl font-semibold text-zinc-50 md:text-5xl">
          This project does not exist.
        </h1>
        <p className="mt-4 max-w-2xl text-zinc-300">
          The album link may be outdated, the slug may be incorrect, or the project has not been published yet.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/albums"
            className="rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-black transition hover:bg-amber-200"
          >
            Browse albums
          </Link>
          <Link
            href="/"
            className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-100 transition hover:border-amber-200/40 hover:text-amber-100"
          >
            Back home
          </Link>
        </div>
      </section>
    </main>
  );
}