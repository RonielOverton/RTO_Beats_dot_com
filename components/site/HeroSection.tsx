import Link from "next/link";
import { siteConfig } from "@/data/site";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(245,158,11,0.28),transparent_34%),radial-gradient(circle_at_82%_22%,rgba(6,182,212,0.2),transparent_32%),linear-gradient(180deg,rgba(6,6,8,0.72)_0%,rgba(8,9,12,0.82)_46%,rgba(4,4,6,0.96)_100%)]" />
      <div
        className="absolute inset-0 bg-no-repeat opacity-70"
        style={{
          backgroundImage: "url('/images/home/96664863-IMG_2452.JPG')",
          backgroundSize: "cover",
          backgroundPosition: "center -250px",
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,3,4,0.92)_0%,rgba(3,3,4,0.7)_38%,rgba(3,3,4,0.28)_62%,rgba(3,3,4,0.86)_100%)]" />
      <div className="absolute inset-y-0 right-0 hidden w-[42%] bg-[radial-gradient(circle_at_30%_24%,rgba(239,68,68,0.3),transparent_34%),radial-gradient(circle_at_64%_32%,rgba(14,165,233,0.26),transparent_30%)] lg:block" />
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
