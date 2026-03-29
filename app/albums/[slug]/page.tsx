import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AlbumDetailView } from "@/components/site/albums/AlbumDetailView";
import { AlbumSetupState } from "@/components/site/albums/AlbumStates";
import { sanityFetch } from "@/sanity/lib/client";
import { allAlbumSlugsQuery, albumBySlugQuery } from "@/sanity/lib/queries";
import type { SanityAlbumDetail } from "@/sanity/lib/types";
import { isSanityConfigured } from "@/sanity/env";
import { getAlbumSummary } from "@/components/site/albums/album-utils";

interface AlbumDetailPageProps {
  params: Promise<{ slug: string }>;
}

// ─── Static params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  if (!isSanityConfigured) return [];
  const slugs = await sanityFetch<{ slug: string }[]>({
    query: allAlbumSlugsQuery,
    tags: ["album"],
  });
  return slugs.map(({ slug }) => ({ slug }));
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: AlbumDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  if (!isSanityConfigured) return { title: "Album | RTO Beats" };

  const album = await sanityFetch<SanityAlbumDetail | null>({
    query: albumBySlugQuery,
    params: { slug },
    tags: ["album"],
  });

  if (!album) return { title: "Project not found | RTO Beats" };

  const description = getAlbumSummary(album);

  return {
    title: `${album.title} | RTO Beats`,
    description,
    alternates: { canonical: `/albums/${album.slug}` },
    robots: {
      index: album.status !== "draft",
      follow: true,
    },
    openGraph: {
      title: album.title,
      description: description ?? undefined,
      url: `/albums/${album.slug}`,
      type: "website",
      images: album.coverImage?.url
        ? [{ url: album.coverImage.url, alt: album.coverImage.alt ?? album.title }]
        : undefined,
    },
    twitter: {
      card: album.coverImage?.url ? "summary_large_image" : "summary",
      title: album.title,
      description,
      images: album.coverImage?.url ? [album.coverImage.url] : undefined,
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AlbumDetailPage({ params }: AlbumDetailPageProps) {
  const { slug } = await params;

  if (!isSanityConfigured) {
    return <AlbumSetupState />;
  }

  const album = await sanityFetch<SanityAlbumDetail | null>({
    query: albumBySlugQuery,
    params: { slug },
    tags: ["album"],
  });

  if (!album) notFound();

  return <AlbumDetailView album={album} />;
}

