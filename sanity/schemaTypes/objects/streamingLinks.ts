import { defineField, defineType } from "sanity";

const platformFields = [
  defineField({
    name: "spotify",
    title: "Spotify",
    type: "url",
    description: "Paste the full Spotify album URL",
  }),
  defineField({
    name: "appleMusic",
    title: "Apple Music",
    type: "url",
    description: "Paste the full Apple Music album URL",
  }),
  defineField({
    name: "youtube",
    title: "YouTube",
    type: "url",
    description: "Paste the full YouTube playlist or album URL",
  }),
  defineField({
    name: "soundcloud",
    title: "SoundCloud",
    type: "url",
    description: "Paste the full SoundCloud album or playlist URL",
  }),
  defineField({
    name: "bandcamp",
    title: "Bandcamp",
    type: "url",
    description: "Paste the full Bandcamp album URL",
  }),
];

export const streamingLinksType = defineType({
  name: "streamingLinks",
  title: "Streaming links",
  type: "object",
  description: "Add only links that are currently live",
  fields: platformFields,
});
