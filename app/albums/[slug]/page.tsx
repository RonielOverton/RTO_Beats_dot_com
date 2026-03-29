import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { StructuredData } from "@/components/site/StructuredData";
import { siteConfig } from "@/data/site";
import { getAlbumBySlug, getAllAlbums } from "@/lib/catalog";
import { buildAlbumJsonLd } from "@/lib/seo";

interface AlbumDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllAlbums().map((album) => ({ slug: album.slug }));
}

export async function generateMetadata({ params }: AlbumDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const album = getAlbumBySlug(slug);

  if (!album) {
    return {
      title: "Project not found | RTO Beats",
    };
  }

  return {
    title: `${album.title} | RTO Beats`,
    description: album.shortDescription,
    alternates: {
      canonical: `/albums/${album.slug}`,
    },
  };
}

export default async function AlbumDetailPage({ params }: AlbumDetailPageProps) {
  const { slug } = await params;
  const album = getAlbumBySlug(slug);

  if (!album) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-6xl space-y-10 px-6 py-14">
      <StructuredData data={buildAlbumJsonLd(album, siteConfig.siteUrl)} />

      <section className="grid gap-8 md:grid-cols-[360px_1fr]">
        <div className="relative w-full overflow-hidden rounded-2xl border border-white/10">
          <Image src={album.coverImage} alt={album.title} width={720} height={720} className="w-full object-cover" />
        </div>
        <div className="space-y-5">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Album Detail</p>
          <h1 className="text-4xl font-semibold text-zinc-50 md:text-5xl">{album.title}</h1>
          <p className="text-zinc-300">{album.description}</p>
          <div className="flex flex-wrap gap-2">
            {album.genres.map((genre) => (
              <span key={genre} className="rounded-full border border-white/20 px-3 py-1 text-xs text-zinc-200">
                {genre}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 pt-2">
            {Object.entries(album.links).map(([platform, href]) => (
              <a
                key={platform}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.15em] text-zinc-100"
              >
                {platform}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-zinc-950/70 p-6">
        <h2 className="text-2xl font-semibold text-zinc-50">Tracklist</h2>
        <ol className="mt-4 space-y-3">
          {album.tracklist.map((track, index) => (
            <li key={track.title} className="flex items-center justify-between border-b border-white/10 pb-2 text-zinc-300">
              <span>
                {index + 1}. {track.title}
              </span>
              <span>{track.duration}</span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
