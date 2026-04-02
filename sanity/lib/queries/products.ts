import groq from "groq";
import { productImageFields } from "./fragments";

// Future-ready product queries for merch, beats, plugins, and digital products.
// Expected product document type: "product"

const productListFields = `
  _id,
  title,
  "slug": slug.current,
  "kind": productType,
  status,
  shortDescription,
  featured,
  "stockStatus": select(
    inventoryType == "limited" && stock > 0 => "limited",
    inventoryType == "limited" => "out-of-stock",
    "in-stock"
  ),
  ${productImageFields},
  "price": {
    "amount": coalesce(price, 0),
    "currency": "USD"
  }
`;

export const allProductSlugsQuery = groq`
  *[_type == "product" && status in ["published", "upcoming"]] {
    "slug": slug.current
  }
`;

export const allProductsQuery = groq`
  *[_type == "product" && status in ["published", "upcoming"]] | order(featured desc, _updatedAt desc) {
    ${productListFields}
  }
`;

export const productsByKindQuery = groq`
  *[_type == "product" && productType == $kind && status in ["published", "upcoming"]] | order(featured desc, _updatedAt desc) {
    ${productListFields}
  }
`;

export const featuredProductsQuery = groq`
  *[_type == "product" && featured == true && status in ["published", "upcoming"]] | order(_updatedAt desc) [0...$limit] {
    ${productListFields}
  }
`;

export const productBySlugQuery = groq`
  *[_type == "product" && slug.current == $slug && status in ["published", "upcoming"]][0] {
    _id,
    title,
    "slug": slug.current,
    "kind": productType,
    status,
    shortDescription,
    fullDescription,
    featured,
    tags,
    downloadable,
    downloadVersion,
    relatedAlbumSlug,
    bpm,
    key,
    licenseType,
    "stockStatus": select(
      inventoryType == "limited" && stock > 0 => "limited",
      inventoryType == "limited" => "out-of-stock",
      "in-stock"
    ),
    "checkout": {
      "stripePriceId": stripePriceId,
      "externalCheckoutUrl": null
    },
    ${productImageFields},
    "previewImages": galleryImages[] {
      "url": asset->url,
      "alt": coalesce(alt, "Gallery image")
    },
    "price": {
      "amount": coalesce(price, 0),
      "currency": "USD"
    }
  }
`;

export const downloadableProductBySlugQuery = groq`
  *[_type == "product" && slug.current == $slug && status in ["published", "upcoming"]][0] {
    title,
    "slug": slug.current,
    "kind": productType,
    "downloadVersion": downloadVersion,
    "downloadable": deliveryType == "digital",
    "downloadAsset": {
      "url": downloadFile.asset->url,
      "mimeType": downloadFile.asset->mimeType,
      "originalFilename": downloadFile.asset->originalFilename
    }
  }
`;

// Media player query for digital products with uploaded playable assets.
export const playableMediaProductsQuery = groq`
  *[
    _type == "product" &&
    status == "published" &&
    defined(downloadFile.asset) &&
    (
      downloadFile.asset->mimeType match "audio/*" ||
      downloadFile.asset->mimeType match "video/*"
    )
  ]
  | order(featured desc, releaseDate desc) {
    _id,
    title,
    "slug": slug.current,
    "itemType": "product",
    productType,
    shortDescription,
    releaseDate,
    featured,
    downloadVersion,
    "coverImage": {
      "url": coverImage.asset->url,
      "alt": coalesce(coverImage.alt, title)
    },
    "mediaFile": {
      "url": downloadFile.asset->url,
      "mimeType": downloadFile.asset->mimeType,
      "originalFilename": downloadFile.asset->originalFilename
    }
  }
`;
