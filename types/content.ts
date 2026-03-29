export type MusicPlatform = "spotify" | "appleMusic" | "bandcamp" | "youtube" | "soundcloud";

export type ProductKind = "album" | "merch" | "plugin" | "beat" | "digital-download";

export type CurrencyCode = "USD";

export interface AlbumTrack {
  title: string;
  duration: string;
  featuredArtist?: string;
}

export interface Album {
  id: string;
  slug: string;
  title: string;
  artist: string;
  year: number;
  releaseDate: string;
  shortDescription: string;
  description: string;
  coverImage: string;
  genres: string[];
  moods: string[];
  featured: boolean;
  tracklist: AlbumTrack[];
  links: Partial<Record<MusicPlatform, string>>;
}

export interface ProductCheckout {
  stripePriceId?: string;
  shopifyVariantId?: string;
  externalCheckoutUrl?: string;
}

export interface StoreItem {
  id: string;
  slug: string;
  kind: ProductKind;
  title: string;
  shortDescription: string;
  description: string;
  image: string;
  price: number;
  currency: CurrencyCode;
  featured: boolean;
  tags: string[];
  stockStatus: "in-stock" | "limited" | "preorder";
  checkout: ProductCheckout;
  relatedAlbumSlug?: string;
  downloadable: boolean;
}

export interface CartLine {
  itemId: string;
  slug: string;
  title: string;
  kind: ProductKind;
  unitPrice: number;
  quantity: number;
  image: string;
}

export interface SiteConfig {
  siteName: string;
  artistName: string;
  siteUrl: string;
  location: string;
  bio: string;
  heroHeadline: string;
  heroSubheadline: string;
  ctaPrimary: {
    label: string;
    href: string;
  };
  ctaSecondary: {
    label: string;
    href: string;
  };
}
