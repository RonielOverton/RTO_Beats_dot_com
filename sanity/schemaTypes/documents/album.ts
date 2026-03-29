import { defineArrayMember, defineField, defineType } from "sanity";

export const albumType = defineType({
  name: "album",
  title: "Album",
  type: "document",
  initialValue: () => ({
    status: "draft",
    featured: false,
    releaseDate: new Date().toISOString().slice(0, 10),
  }),
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
      description: "Album name shown on cards, detail pages, and SEO metadata",
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
        slugify: (input) =>
          input
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .slice(0, 96),
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
          validation: (rule) =>
            rule.required().min(6).max(140).warning("Use 6-140 characters for clearer accessibility text"),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "releaseDate",
      title: "Release date",
      type: "date",
      group: "editorial",
      description: "Used for sorting on the website and shown on album cards",
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
      description: "Controls publication stage label shown on cards and detail pages",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      group: "editorial",
      description: "Turn on to highlight this album on the homepage or featured sections",
    }),
    defineField({
      name: "shortDescription",
      title: "Short description",
      type: "text",
      rows: 3,
      group: "editorial",
      description: "Short summary for album cards and SEO descriptions",
      validation: (rule) =>
        rule.required().min(40).max(220).warning("Aim for 40-220 characters for better card and SEO snippets"),
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
      description: "Use tags like Boom Bap, Trap, Jazz Rap, Cinematic",
      of: [defineArrayMember({ type: "string" })],
      options: {
        layout: "tags",
      },
      validation: (rule) => rule.required().min(1).unique(),
    }),
    defineField({
      name: "featuredArtists",
      title: "Featured artists",
      type: "array",
      group: "music",
      description: "Add guest artists connected to the project",
      of: [defineArrayMember({ type: "string" })],
      options: {
        layout: "tags",
      },
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: "tracklist",
      title: "Tracklist",
      type: "array",
      group: "music",
      description: "Add every track in release order",
      of: [defineArrayMember({ type: "track" })],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "credits",
      title: "Credits",
      type: "array",
      group: "music",
      description: "List key contributors and their roles",
      of: [defineArrayMember({ type: "credit" })],
    }),
    defineField({
      name: "streamingLinks",
      title: "Streaming links",
      type: "streamingLinks",
      group: "links",
      description: "Paste only the platforms that are live",
    }),
    defineField({
      name: "bandcampUrl",
      title: "Bandcamp URL",
      type: "url",
      group: "links",
      description: "Public Bandcamp album page link",
    }),
    defineField({
      name: "bandcampEmbedCode",
      title: "Bandcamp embed code",
      type: "text",
      rows: 5,
      group: "links",
      description: "Paste the Bandcamp embed HTML snippet here if you want an embedded player on the album page",
      validation: (rule) =>
        rule.custom((value) => {
          if (!value) return true;
          return value.includes("bandcamp.com")
            ? true
            : "Embed code should come from Bandcamp and include bandcamp.com";
        }),
    }),
    defineField({
      name: "galleryImages",
      title: "Gallery images",
      type: "array",
      group: "media",
      description: "Optional photos for the album detail gallery",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt text",
              type: "string",
              description: "Describe the image for accessibility",
              validation: (rule) =>
                rule.max(140).warning("Keep image alt text under 140 characters"),
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
      featured: "featured",
    },
    prepare({ title, subtitle, media, releaseDate, featured }) {
      const dateLabel = releaseDate ? new Date(releaseDate).getFullYear() : "No date";
      const statusLabel = subtitle ? subtitle.charAt(0).toUpperCase() + subtitle.slice(1) : "Draft";
      const featuredLabel = featured ? "Featured" : "Standard";
      return {
        title,
        subtitle: `${statusLabel} · ${dateLabel} · ${featuredLabel}`,
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
    {
      title: "Release date, oldest first",
      name: "releaseDateAsc",
      by: [{ field: "releaseDate", direction: "asc" }],
    },
    {
      title: "Featured first, then newest",
      name: "featuredThenReleaseDate",
      by: [
        { field: "featured", direction: "desc" },
        { field: "releaseDate", direction: "desc" },
      ],
    },
    {
      title: "Title A-Z",
      name: "titleAsc",
      by: [{ field: "title", direction: "asc" }],
    },
  ],
});
