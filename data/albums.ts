import type { Album } from "@/types/content";

export const albums: Album[] = [
  {
    id: "alb-cosmic-odyssey",
    slug: "cosmic-odyssey",
    title: "Cosmic Odyssey",
    artist: "RTO",
    year: 2025,
    releaseDate: "2025-09-21",
    shortDescription: "A widescreen boom bap project with deep bass and space-age textures.",
    description:
      "Cosmic Odyssey explores late-night city movement through dusty drums, layered synth atmospheres, and dramatic arrangement shifts built for headphones and live listening sets.",
    coverImage: "/images/album-cosmic-odyssey.svg",
    genres: ["Boom Bap", "Cinematic Hip Hop"],
    moods: ["Dark", "Expansive", "Nocturnal"],
    featured: true,
    tracklist: [
      { title: "Orbital Intro", duration: "1:42" },
      { title: "Drift Theory", duration: "3:28" },
      { title: "Golden Transit", duration: "3:11" },
      { title: "Neon Crates", duration: "2:58" },
      { title: "Lunar Exit", duration: "4:03" },
    ],
    links: {
      bandcamp: "https://rtobeats.bandcamp.com/music",
      youtube: "https://www.youtube.com/@RTOBeats",
    },
  },
  {
    id: "alb-concrete-poetry",
    slug: "concrete-poetry",
    title: "Concrete Poetry",
    artist: "RTO",
    year: 2024,
    releaseDate: "2024-06-14",
    shortDescription: "Sample-heavy grooves inspired by urban architecture and street stories.",
    description:
      "Concrete Poetry blends chopped soul motifs with hard drums and warm tape-style saturation, designed for lyricists and listeners who value rhythm and detail.",
    coverImage: "/images/album-concrete-poetry.svg",
    genres: ["Hip Hop", "Lo-Fi"],
    moods: ["Raw", "Reflective", "Warm"],
    featured: true,
    tracklist: [
      { title: "Pillar Smoke", duration: "2:35" },
      { title: "Elevator Cipher", duration: "3:05" },
      { title: "North Block", duration: "3:21" },
      { title: "Steel Verse", duration: "2:46" },
    ],
    links: {
      bandcamp: "https://rtobeats.bandcamp.com/music",
      youtube: "https://www.youtube.com/@RTOBeats/videos",
    },
  },
  {
    id: "alb-after-hours",
    slug: "after-hours-tape",
    title: "After Hours Tape",
    artist: "RTO",
    year: 2023,
    releaseDate: "2023-11-02",
    shortDescription: "Moody loops and minimal percussion for late-night sessions.",
    description:
      "After Hours Tape is a concise beat journey rooted in sparse textures, gentle sidechain movement, and focused groove pockets that leave room for vocal performance.",
    coverImage: "/images/album-after-hours.svg",
    genres: ["Instrumental Hip Hop"],
    moods: ["Minimal", "Melancholic", "Late-night"],
    featured: false,
    tracklist: [
      { title: "1AM Blueprint", duration: "2:22" },
      { title: "Window Lights", duration: "3:00" },
      { title: "No Signal", duration: "2:41" },
      { title: "Dawn Bounce", duration: "2:57" },
    ],
    links: {
      bandcamp: "https://rtobeats.bandcamp.com/music",
    },
  },
];
