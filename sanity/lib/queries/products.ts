import groq from "groq";
import { productImageFields } from "./fragments";

// Future-ready product queries for merch, beats, plugins, and digital products.
// Expected product document type: "product"

const productListFields = `
  _id,
  title,
  "slug": slug.current,
  kind,
  status,
  shortDescription,
  featured,
  ${productImageFields},
  "price": {
    "amount": price,
    "currency": currency
  }
`;

export const allProductSlugsQuery = groq`
  *[_type == "product"] {
    "slug": slug.current
  }
`;

export const allProductsQuery = groq`
  *[_type == "product" && status in ["active", "coming-soon"]] | order(featured desc, _updatedAt desc) {
    ${productListFields}
  }
`;

export const productsByKindQuery = groq`
  *[_type == "product" && kind == $kind && status in ["active", "coming-soon"]] | order(featured desc, _updatedAt desc) {
    ${productListFields}
  }
`;

export const featuredProductsQuery = groq`
  *[_type == "product" && featured == true && status in ["active", "coming-soon"]] | order(_updatedAt desc) [0...$limit] {
    ${productListFields}
  }
`;

export const productBySlugQuery = groq`
  *[_type == "product" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    kind,
    status,
    shortDescription,
    fullDescription,
    featured,
    tags,
    stockStatus,
    downloadable,
    relatedAlbumSlug,
    checkout {
      stripePriceId,
      shopifyVariantId,
      externalCheckoutUrl
    },
    ${productImageFields},
    previewImages[] {
      "url": asset->url,
      "alt": coalesce(alt, "Product preview image")
    },
    "price": {
      "amount": price,
      "currency": currency
    }
  }
`;
