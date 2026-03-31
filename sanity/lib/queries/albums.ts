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
    _key,
    trackNumber,
    title,
    duration,
    featuring,
    "audioUrl": audioFile.asset->url
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

// Media player query for all published/upcoming albums (surface via Bandcamp embed or streaming links).
export const playableMediaAlbumsQuery = groq`
  *[_type == "album" && status in ["released", "upcoming"]] | ${albumOrdering} {
    _id,
    title,
    "slug": slug.current,
    "itemType": "album",
    shortDescription,
    releaseDate,
    featured,
    bandcampEmbedCode,
    bandcampUrl,
    streamingLinks {
      spotify,
      appleMusic,
      youtube,
      soundcloud,
      bandcamp
    },
    "coverImage": {
      "url": coverImage.asset->url,
      "alt": coalesce(coverImage.alt, title)
    }
  }
`;
