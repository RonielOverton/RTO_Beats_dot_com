import groq from "groq";
import { albumCoverImageFields } from "./fragments";

const albumOrdering = "order(releaseDate desc)";

const albumBaseFields = `
  _id,
  title,
  "slug": slug.current,
  releaseDate,
  status,
  bandcampUrl,
  shortDescription,
  featured,
  genre,
  featuredArtists,
  ${albumCoverImageFields}
`;

const albumDetailFields = `
  ${albumBaseFields},
  fullDescription,
  tracklist[] {
    trackNumber,
    title,
    duration,
    featuring
  },
  streamingLinks {
    spotify,
    appleMusic,
    youtube,
    soundcloud,
    bandcamp
  },
  credits[] {
    name,
    role
  },
  galleryImages[] {
    "url": asset->url,
    "alt": coalesce(alt, "Gallery image")
  },
  bandcampUrl,
  bandcampEmbedCode
`;

export const allAlbumSlugsQuery = groq`
  *[_type == "album"] {
    "slug": slug.current
  }
`;

export const allAlbumsQuery = groq`
  *[_type == "album"] | ${albumOrdering} {
    ${albumBaseFields}
  }
`;

export const albumBySlugQuery = groq`
  *[_type == "album" && slug.current == $slug][0] {
    ${albumDetailFields}
  }
`;

export const featuredAlbumsQuery = groq`
  *[_type == "album" && featured == true] | ${albumOrdering} [0...$limit] {
    ${albumBaseFields}
  }
`;
