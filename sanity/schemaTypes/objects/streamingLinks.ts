import { defineField, defineType } from "sanity";

const platformFields = [
  defineField({
    name: "spotify",
    title: "Spotify",
    type: "url",
  }),
  defineField({
    name: "appleMusic",
    title: "Apple Music",
    type: "url",
  }),
  defineField({
    name: "youtube",
    title: "YouTube",
    type: "url",
  }),
  defineField({
    name: "soundcloud",
    title: "SoundCloud",
    type: "url",
  }),
  defineField({
    name: "bandcamp",
    title: "Bandcamp",
    type: "url",
  }),
];

export const streamingLinksType = defineType({
  name: "streamingLinks",
  title: "Streaming links",
  type: "object",
  fields: platformFields,
});
