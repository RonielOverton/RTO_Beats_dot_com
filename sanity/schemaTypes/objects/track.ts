import { defineField, defineType } from "sanity";

export const trackType = defineType({
  name: "track",
  title: "Track",
  type: "object",
  fields: [
    defineField({
      name: "trackNumber",
      title: "Track number",
      type: "number",
      description: "Use the final sequence number as it appears on the release",
      validation: (rule) => rule.required().integer().positive(),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Track title as shown on streaming platforms",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "duration",
      title: "Duration",
      type: "string",
      description: "Use a format like 3:42",
      validation: (rule) =>
        rule
          .required()
          .regex(/^\d{1,2}:[0-5]\d$/, { name: "mm:ss" })
          .error("Use mm:ss format, for example 3:42 or 12:08"),
    }),
    defineField({
      name: "featuring",
      title: "Featuring",
      type: "array",
      description: "Optional guest artists on this track",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "audioFile",
      title: "Audio file",
      type: "file",
      description: "Upload an MP3, WAV, or AAC file for in-browser playback on the album page",
      options: {
        accept: "audio/*",
      },
    }),
  ],
  preview: {
    select: {
      title: "title",
      trackNumber: "trackNumber",
      duration: "duration",
    },
    prepare({ title, trackNumber, duration }) {
      return {
        title: `${trackNumber ?? "-"}. ${title ?? "Untitled track"}`,
        subtitle: duration ? `Duration: ${duration}` : "No duration set",
      };
    },
  },
});
