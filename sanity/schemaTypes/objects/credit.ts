import { defineField, defineType } from "sanity";

export const creditType = defineType({
  name: "credit",
  title: "Credit",
  type: "object",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "role",
      title: "Role",
      type: "string",
      description: "Examples: Producer, Mixing Engineer, Artwork, Vocals",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "role",
    },
  },
});
