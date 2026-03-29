export interface SanityImage {
  url?: string;
  alt?: string;
}

export interface SanitySlug {
  slug: string;
}

export interface SanitySeoSummary {
  shortDescription?: string;
}

export interface SanityMoney {
  amount: number;
  currency: "USD";
}

export interface SanityPortableTextSpan {
  text?: string;
}

export interface SanityPortableTextBlock {
  _type?: string;
  children?: SanityPortableTextSpan[];
}
