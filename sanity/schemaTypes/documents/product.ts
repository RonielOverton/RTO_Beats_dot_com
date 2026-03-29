import { defineArrayMember, defineField, defineType } from "sanity";

export const productType = defineType({
  name: "product",
  title: "Product",
  type: "document",
  initialValue: () => ({
    status: "draft",
    featured: false,
    downloadable: false,
    stockStatus: "in-stock",
    price: {
      currency: "USD",
    },
  }),
  groups: [
    { name: "editorial", title: "Editorial", default: true },
    { name: "commerce", title: "Commerce" },
    { name: "media", title: "Media" },
    { name: "relations", title: "Relations" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "editorial",
      description: "Public product name shown in store cards and detail pages",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "editorial",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "kind",
      title: "Kind",
      type: "string",
      group: "editorial",
      options: {
        list: [
          { title: "Merch", value: "merch" },
          { title: "Beat", value: "beat" },
          { title: "Plugin", value: "plugin" },
          { title: "Digital Product", value: "digital-product" },
        ],
        layout: "radio",
      },
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
          { title: "Coming Soon", value: "coming-soon" },
          { title: "Active", value: "active" },
          { title: "Archived", value: "archived" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      group: "editorial",
      description: "Feature this product on the homepage/store highlights",
    }),
    defineField({
      name: "shortDescription",
      title: "Short description",
      type: "text",
      rows: 3,
      group: "editorial",
      validation: (rule) => rule.required().max(220),
    }),
    defineField({
      name: "fullDescription",
      title: "Full description",
      type: "array",
      group: "editorial",
      of: [defineArrayMember({ type: "block" })],
    }),
    defineField({
      name: "price",
      title: "Price",
      type: "productPrice",
      group: "commerce",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "stockStatus",
      title: "Stock status",
      type: "string",
      group: "commerce",
      options: {
        list: [
          { title: "In stock", value: "in-stock" },
          { title: "Limited", value: "limited" },
          { title: "Preorder", value: "preorder" },
          { title: "Out of stock", value: "out-of-stock" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "downloadable",
      title: "Downloadable",
      type: "boolean",
      group: "commerce",
      description: "Turn on for instantly downloadable products",
    }),
    defineField({
      name: "checkout",
      title: "Checkout",
      type: "checkoutLinks",
      group: "commerce",
    }),
    defineField({
      name: "image",
      title: "Main image",
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
          validation: (rule) => rule.required().min(6).max(140),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "previewImages",
      title: "Preview images",
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
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      group: "editorial",
      of: [defineArrayMember({ type: "string" })],
      options: {
        layout: "tags",
      },
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: "relatedAlbumSlug",
      title: "Related album slug",
      type: "string",
      group: "relations",
      description: "Optional. Link this product to an album by slug",
    }),
  ],
  preview: {
    select: {
      title: "title",
      kind: "kind",
      status: "status",
      featured: "featured",
      media: "image",
    },
    prepare({ title, kind, status, featured, media }) {
      const kindLabel = kind ? String(kind).replace("-", " ") : "product";
      const statusLabel = status ?? "draft";
      return {
        title,
        subtitle: `${kindLabel} · ${statusLabel}${featured ? " · Featured" : ""}`,
        media,
      };
    },
  },
  orderings: [
    {
      title: "Featured first",
      name: "featuredFirst",
      by: [
        { field: "featured", direction: "desc" },
        { field: "_updatedAt", direction: "desc" },
      ],
    },
    {
      title: "Title A-Z",
      name: "titleAsc",
      by: [{ field: "title", direction: "asc" }],
    },
  ],
});
