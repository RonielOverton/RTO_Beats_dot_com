import Link from "next/link";

export function CtaSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-20">
      <div className="rounded-3xl border border-amber-200/20 bg-[linear-gradient(130deg,rgba(245,158,11,0.18),rgba(24,24,27,0.9)_55%,rgba(190,24,93,0.18))] p-9 md:p-12">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-100/80">Ready to work</p>
        <h2 className="mt-4 max-w-2xl text-3xl font-semibold text-zinc-50 md:text-4xl">
          License a beat, grab a plugin, or build your sonic identity with premium production assets.
        </h2>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/store" className="rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-black">
            Shop now
          </Link>
          <Link
            href="/albums"
            className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-100"
          >
            Hear projects
          </Link>
        </div>
      </div>
    </section>
  );
}
