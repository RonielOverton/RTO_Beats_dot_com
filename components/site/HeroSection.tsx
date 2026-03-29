import Link from "next/link";
import { siteConfig } from "@/data/site";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(245,158,11,0.22),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(190,24,93,0.2),transparent_46%),linear-gradient(180deg,#0a0a0b_0%,#0f1014_100%)]" />
      <div className="relative mx-auto flex min-h-[72vh] w-full max-w-6xl flex-col justify-center gap-8 px-6 py-20">
        <p className="text-xs uppercase tracking-[0.36em] text-amber-200/80">{siteConfig.location}</p>
        <h1 className="max-w-4xl text-5xl font-semibold leading-[0.95] text-zinc-50 md:text-7xl">
          {siteConfig.heroHeadline}
        </h1>
        <p className="max-w-2xl text-base text-zinc-300 md:text-lg">{siteConfig.heroSubheadline}</p>
        <div className="flex flex-wrap gap-4">
          <Link
            href={siteConfig.ctaPrimary.href}
            className="rounded-full bg-amber-300 px-7 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-black transition hover:bg-amber-200"
          >
            {siteConfig.ctaPrimary.label}
          </Link>
          <Link
            href={siteConfig.ctaSecondary.href}
            className="rounded-full border border-white/20 px-7 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-zinc-200 transition hover:border-amber-100/70"
          >
            {siteConfig.ctaSecondary.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
