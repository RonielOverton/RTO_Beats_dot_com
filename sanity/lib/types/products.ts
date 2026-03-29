import type { SanityImage, SanityMoney, SanityPortableTextBlock } from "./shared";

export type SanityProductKind = "merch" | "beat" | "plugin" | "digital-product";
export type SanityProductStatus = "draft" | "coming-soon" | "active" | "archived";

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
  previewImages?: SanityImage[];
}
