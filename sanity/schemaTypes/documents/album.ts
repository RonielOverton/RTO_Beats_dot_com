import { defineArrayMember, defineField, defineType } from "sanity";

export const albumType = defineType({
  name: "album",
  title: "Album",
  type: "document",
  groups: [
    { name: "editorial", title: "Editorial", default: true },
    { name: "music", title: "Music" },
    { name: "links", title: "Links" },
    { name: "media", title: "Media" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "editorial",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "editorial",
      description: "Used in the website URL, for example /albums/cosmic-odyssey",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "image",
      group: "media",
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          description: "Describe the album cover for accessibility and SEO",
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "releaseDate",
      title: "Release date",
      type: "date",
      group: "editorial",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      group: "editorial",
      options: {
        list: [
          { title: "Draft", value: "draft" },
          { title: "Upcoming", value: "upcoming" },
          { title: "Released", value: "released" },
        ],
        layout: "radio",
      },
      initialValue: "draft",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      group: "editorial",
      initialValue: false,
      description: "Turn on to highlight this album on the homepage or featured sections",
    }),
    defineField({
      name: "shortDescription",
      title: "Short description",
      type: "text",
      rows: 3,
      group: "editorial",
      description: "Short summary for album cards and SEO descriptions",
      validation: (rule) => rule.required().max(220),
    }),
    defineField({
      name: "fullDescription",
      title: "Full description",
      type: "array",
      group: "editorial",
      description: "Full album story or release notes shown on the detail page",
      of: [defineArrayMember({ type: "block" })],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "genre",
      title: "Genre",
      type: "array",
      group: "music",
      of: [defineArrayMember({ type: "string" })],
      options: {
        layout: "tags",
      },
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "featuredArtists",
      title: "Featured artists",
      type: "array",
      group: "music",
      description: "Add guest artists connected to the project",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "tracklist",
      title: "Tracklist",
      type: "array",
      group: "music",
      of: [defineArrayMember({ type: "track" })],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "credits",
      title: "Credits",
      type: "array",
      group: "music",
      of: [defineArrayMember({ type: "credit" })],
    }),
    defineField({
      name: "streamingLinks",
      title: "Streaming links",
      type: "streamingLinks",
      group: "links",
    }),
    defineField({
      name: "bandcampUrl",
      title: "Bandcamp URL",
      type: "url",
      group: "links",
    }),
    defineField({
      name: "bandcampEmbedCode",
      title: "Bandcamp embed code",
      type: "text",
      rows: 5,
      group: "links",
      description: "Paste the Bandcamp embed HTML snippet here if you want an embedded player on the album page",
    }),
    defineField({
      name: "galleryImages",
      title: "Gallery images",
      type: "array",
      group: "media",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt text",
              type: "string",
            }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "status",
      media: "coverImage",
      releaseDate: "releaseDate",
    },
    prepare({ title, subtitle, media, releaseDate }) {
      const dateLabel = releaseDate ? new Date(releaseDate).getFullYear() : "No date";
      return {
        title,
        subtitle: `${subtitle ?? "draft"} · ${dateLabel}`,
        media,
      };
    },
  },
  orderings: [
    {
      title: "Release date, newest first",
      name: "releaseDateDesc",
      by: [{ field: "releaseDate", direction: "desc" }],
    },
  ],
});
