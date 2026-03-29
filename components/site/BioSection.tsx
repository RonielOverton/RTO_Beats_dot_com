import { siteConfig } from "@/data/site";

export function BioSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="grid gap-8 rounded-3xl border border-white/10 bg-white/[0.02] p-8 md:grid-cols-[1fr_2fr]">
        <p className="text-xs uppercase tracking-[0.32em] text-zinc-500">Artist bio</p>
        <p className="text-lg leading-relaxed text-zinc-200">{siteConfig.bio}</p>
      </div>
    </section>
  );
}
