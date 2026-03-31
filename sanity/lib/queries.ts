// Backward-compatible barrel. Prefer importing from:
// - @/sanity/lib/queries/albums
// - @/sanity/lib/queries/products
// - @/sanity/lib/queries
export {
  allAlbumSlugsQuery,
  allAlbumsQuery,
  albumBySlugQuery,
  featuredAlbumsQuery,
  playableMediaAlbumsQuery,
  allProductSlugsQuery,
  allProductsQuery,
  productsByKindQuery,
  featuredProductsQuery,
  productBySlugQuery,
  playableMediaProductsQuery,
} from "./queries/index";
