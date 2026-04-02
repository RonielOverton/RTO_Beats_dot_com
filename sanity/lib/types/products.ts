import type { SanityImage, SanityMoney, SanityPortableTextBlock } from "./shared";

export type SanityProductKind = "album" | "merch" | "beat" | "plugin" | "digital";
export type SanityProductStatus = "draft" | "upcoming" | "published";

export interface SanityProductListItem {
  _id: string;
  title: string;
  slug: string;
  kind: SanityProductKind;
  status: SanityProductStatus;
  shortDescription: string;
  featured?: boolean;
  image?: SanityImage;
  price?: SanityMoney;
}

export interface SanityProductDetail extends SanityProductListItem {
  fullDescription?: SanityPortableTextBlock[];
  tags?: string[];
  stockStatus?: "in-stock" | "limited" | "preorder" | "out-of-stock";
  checkout?: {
    stripePriceId?: string;
    shopifyVariantId?: string;
    externalCheckoutUrl?: string;
  };
  relatedAlbumSlug?: string;
  downloadable?: boolean;
  downloadUrl?: string;
  downloadVersion?: string;
  previewImages?: SanityImage[];
  bpm?: number;
  key?: string;
  licenseType?: string;
}

export interface SanityPlayableMediaFile {
  url: string;
  mimeType?: string;
  originalFilename?: string;
}

export interface SanityPlayableStreamingLinks {
  spotify?: string;
  appleMusic?: string;
  youtube?: string;
  soundcloud?: string;
  bandcamp?: string;
}

export interface SanityPlayableMediaItem {
  _id: string;
  title: string;
  slug: string;
  /** "product" = has a direct audio/video file; "album" = Bandcamp/streaming embedded */
  itemType: "product" | "album";
  productType?: "album" | "beat" | "plugin" | "merch" | "digital";
  shortDescription?: string;
  releaseDate?: string;
  featured?: boolean;
  downloadVersion?: string;
  coverImage?: SanityImage;
  /** Present for product items with uploaded audio/video */
  mediaFile?: SanityPlayableMediaFile;
  /** Present for album items — raw Bandcamp iframe HTML */
  bandcampEmbedCode?: string;
  bandcampUrl?: string;
  streamingLinks?: SanityPlayableStreamingLinks;
}
