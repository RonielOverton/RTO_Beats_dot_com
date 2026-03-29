import type { SanityImage, SanityPortableTextBlock } from "./shared";

export type AlbumStatus = "draft" | "upcoming" | "released";
export type SanityStreamingPlatform = "spotify" | "appleMusic" | "youtube" | "soundcloud" | "bandcamp";

export interface SanityAlbumBase {
  _id: string;
  title: string;
  slug: string;
  releaseDate: string;
  status: AlbumStatus;
  shortDescription?: string;
  featured?: boolean;
  genre?: string[];
  featuredArtists?: string[];
  coverImage?: SanityImage;
}

export interface SanityAlbumListItem extends SanityAlbumBase {
  shortDescription: string;
}

export interface SanityTrack {
  trackNumber?: number;
  title: string;
  duration?: string;
  featuring?: string[];
}

export type SanityStreamingLinks = Partial<Record<SanityStreamingPlatform, string>>;

export interface SanityCredit {
  name: string;
  role?: string;
}

export interface SanityGalleryImage extends SanityImage {}

export interface SanityAlbumDetail extends SanityAlbumBase {
  fullDescription?: SanityPortableTextBlock[];
  tracklist?: SanityTrack[];
  streamingLinks?: SanityStreamingLinks;
  credits?: SanityCredit[];
  galleryImages?: SanityGalleryImage[];
  bandcampUrl?: string;
  bandcampEmbedCode?: string;
}
