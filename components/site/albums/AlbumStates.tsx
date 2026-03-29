import Link from "next/link";

export function AlbumsSetupState() {
  return (
    <section className="rounded-3xl border border-cyan-300/30 bg-cyan-300/10 p-8 text-cyan-100">
      <p className="text-xs uppercase tracking-[0.28em] text-cyan-100/70">Sanity setup required</p>
      <h2 className="mt-3 text-2xl font-semibold">Albums are ready to load from your CMS.</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-cyan-50/90">
        Add NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, and NEXT_PUBLIC_SANITY_API_VERSION to your environment to enable live album content.
      </p>
    </section>
  );
}

export function AlbumsEmptyState() {
  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-950/70 p-8">
      <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">No albums yet</p>
      <h2 className="mt-3 text-2xl font-semibold text-zinc-50">Your discography is still empty.</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-300">
        Publish your first album in Sanity Studio and it will appear here automatically with its own detail page.
      </p>
      <div className="mt-6">
        <Link
          href="/"
          className="inline-flex rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-100 transition hover:border-amber-200/40 hover:text-amber-100"
        >
          Back home
        </Link>
      </div>
    </section>
  );
}

export function AlbumSetupState() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-14">
      <section className="rounded-3xl border border-cyan-300/30 bg-cyan-300/10 p-8 text-cyan-100">
        <p className="text-xs uppercase tracking-[0.28em] text-cyan-100/70">Sanity setup required</p>
        <h1 className="mt-3 text-3xl font-semibold text-cyan-50 md:text-4xl">Album details are not available yet.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-cyan-50/90">
          Configure your Sanity environment variables to load album detail pages in development and production.
        </p>
      </section>
    </main>
  );
}
