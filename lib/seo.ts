import type { Album, StoreItem } from "@/types/content";

export function buildAlbumJsonLd(album: Album, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "MusicAlbum",
    name: album.title,
    byArtist: {
      "@type": "MusicGroup",
      name: album.artist,
    },
    image: `${siteUrl}${album.coverImage}`,
    datePublished: album.releaseDate,
    genre: album.genres,
    track: album.tracklist.map((track, index) => ({
      "@type": "MusicRecording",
      position: index + 1,
      name: track.title,
      duration: track.duration,
    })),
  };
}

export function buildProductJsonLd(item: StoreItem, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: item.title,
    image: `${siteUrl}${item.image}`,
    description: item.description,
    category: item.kind,
    offers: {
      "@type": "Offer",
      priceCurrency: item.currency,
      price: item.price,
      availability:
        item.stockStatus === "in-stock"
          ? "https://schema.org/InStock"
          : item.stockStatus === "limited"
            ? "https://schema.org/LimitedAvailability"
            : "https://schema.org/PreOrder",
      url: `${siteUrl}/store/${item.slug}`,
    },
  };
}
