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
      validation: (rule) => rule.required().integer().positive(),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "duration",
      title: "Duration",
      type: "string",
      description: "Use a format like 3:42",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "featuring",
      title: "Featuring",
      type: "array",
      description: "Optional guest artists on this track",
      of: [{ type: "string" }],
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
