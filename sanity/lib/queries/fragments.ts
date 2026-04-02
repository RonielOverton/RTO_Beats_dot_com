// Shared GROQ fragments to keep query projections consistent across domains.

export const albumCoverImageFields = `
  "coverImage": {
    "url": coverImage.asset->url,
    "alt": coalesce(coverImage.alt, title)
  }
`;

export const productImageFields = `
  "image": {
    "url": coverImage.asset->url,
    "alt": coalesce(coverImage.alt, title)
  }
`;
