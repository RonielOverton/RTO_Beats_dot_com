import { defineArrayMember, defineField, defineType } from "sanity";

export const productType = defineType({
  name: "product",
  title: "Product",
  type: "document",
  initialValue: () => ({
    status: "draft",
    productType: "digital",
    featured: false,
    isForSale: true,
    inventoryType: "unlimited",
    currency: "usd",
    deliveryType: "digital",
    releaseDate: new Date().toISOString().slice(0, 10),
  }),
  groups: [
    { name: "editorial", title: "Editorial", default: true },
    { name: "delivery", title: "Delivery" },
    { name: "music", title: "Music" },
    { name: "commerce", title: "Commerce" },
    { name: "media", title: "Media" },
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
      name: "productType",
      title: "Product type",
      type: "string",
      group: "editorial",
      options: {
        list: [
          { title: "Album", value: "album" },
          { title: "Merch", value: "merch" },
          { title: "Beat", value: "beat" },
          { title: "Plugin", value: "plugin" },
          { title: "Digital Download", value: "digital" },
        ],
        layout: "radio",
      },
      description: "Determines which specialized fields are shown for this product",
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
          { title: "Published", value: "published" },
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
      description: "Short summary used in cards, listings, and SEO snippets",
      validation: (rule) => rule.required().max(220),
    }),
    defineField({
      name: "fullDescription",
      title: "Full description",
      type: "array",
      group: "editorial",
      description: "Long-form product details shown on detail pages",
      of: [defineArrayMember({ type: "block" })],
    }),
    defineField({
      name: "releaseDate",
      title: "Release date",
      type: "date",
      group: "editorial",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "deliveryType",
      title: "Delivery type",
      type: "string",
      group: "delivery",
      options: {
        list: [
          { title: "Digital", value: "digital" },
          { title: "Physical", value: "physical" },
          { title: "License", value: "license" },
        ],
        layout: "radio",
      },
      description: "How this product is fulfilled after purchase",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "downloadFile",
      title: "Download file",
      type: "file",
      group: "delivery",
      options: {
        accept: ".zip,.wav,.mp3,.aif,.aiff,.pdf,.txt,.exe,.dmg,.pkg,.vst,.vst3",
      },
      description: "Upload the downloadable file delivered to customers",
      hidden: ({ document }) => document?.deliveryType !== "digital",
      validation: (rule) =>
        rule.custom((value, context) => {
          if (context.document?.deliveryType !== "digital") return true;
          return value ? true : "Download file is required when delivery type is digital";
        }),
    }),
    defineField({
      name: "downloadVersion",
      title: "Download version",
      type: "string",
      group: "delivery",
      description: "Version label for the file, for example v1.0.2",
      hidden: ({ document }) => document?.deliveryType !== "digital",
      validation: (rule) =>
        rule.custom((value, context) => {
          if (context.document?.deliveryType !== "digital") return true;
          return value ? true : "Download version is required when delivery type is digital";
        }),
    }),
    defineField({
      name: "isForSale",
      title: "For sale",
      type: "boolean",
      group: "commerce",
      description: "Toggle off for display-only products that are not purchasable",
    }),
    defineField({
      name: "price",
      title: "Price",
      type: "number",
      group: "commerce",
      description: "Set the customer-facing price for checkout",
      validation: (rule) =>
        rule.min(0).precision(2).custom((value, context) => {
          if (!context.document?.isForSale) return true;
          if (typeof value !== "number") return "Price is required when the product is for sale";
          return value >= 0 ? true : "Price cannot be negative";
        }),
    }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      group: "commerce",
      options: {
        list: [
          { title: "USD", value: "usd" },
          { title: "EUR", value: "eur" },
          { title: "GBP", value: "gbp" },
        ],
        layout: "radio",
      },
      description: "Currency used for pricing and Stripe checkout",
      validation: (rule) =>
        rule.custom((value, context) => {
          if (!context.document?.isForSale) return true;
          return value ? true : "Currency is required when the product is for sale";
        }),
    }),
    defineField({
      name: "stripePriceId",
      title: "Stripe price ID",
      type: "string",
      group: "commerce",
      description: "Stripe Price identifier, for example price_123abc, used by checkout",
      validation: (rule) =>
        rule.custom((value, context) => {
          if (!context.document?.isForSale) return true;
          return value ? true : "Stripe price ID is required when the product is for sale";
        }),
    }),
    defineField({
      name: "inventoryType",
      title: "Inventory type",
      type: "string",
      group: "commerce",
      options: {
        list: [
          { title: "Unlimited", value: "unlimited" },
          { title: "Limited", value: "limited" },
        ],
        layout: "radio",
      },
      description: "Use limited for finite stock such as merch drops",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "stock",
      title: "Stock",
      type: "number",
      group: "commerce",
      description: "Available quantity for limited inventory products",
      hidden: ({ document }) => document?.inventoryType !== "limited",
      validation: (rule) =>
        rule.integer().min(0).custom((value, context) => {
          if (context.document?.inventoryType !== "limited") return true;
          return typeof value === "number"
            ? true
            : "Stock is required when inventory type is limited";
        }),
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
          description: "Describe the image for accessibility and SEO",
          validation: (rule) => rule.required().min(6).max(140),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "galleryImages",
      title: "Gallery images",
      type: "array",
      group: "media",
      description: "Optional additional images for product detail galleries",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt text",
              type: "string",
              validation: (rule) => rule.required().min(6).max(140),
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "tracks",
      title: "Tracks",
      type: "array",
      group: "music",
      description: "Album-only tracklist in release order",
      of: [defineArrayMember({ type: "track" })],
      hidden: ({ document }) => document?.productType !== "album",
      validation: (rule) =>
        rule.custom((value, context) => {
          if (context.document?.productType !== "album") return true;
          return Array.isArray(value) && value.length > 0
            ? true
            : "At least one track is required for album products";
        }),
    }),
    defineField({
      name: "credits",
      title: "Credits",
      type: "array",
      group: "music",
      description: "Album-only contributor credits",
      of: [defineArrayMember({ type: "credit" })],
      hidden: ({ document }) => document?.productType !== "album",
    }),
    defineField({
      name: "featuredArtists",
      title: "Featured artists",
      type: "array",
      group: "music",
      description: "Album-only list of featured artists",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
      hidden: ({ document }) => document?.productType !== "album",
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: "streamingLinks",
      title: "Streaming links",
      type: "streamingLinks",
      group: "music",
      description: "Album-only links to streaming platforms",
      hidden: ({ document }) => document?.productType !== "album",
    }),
    defineField({
      name: "bpm",
      title: "BPM",
      type: "number",
      group: "music",
      description: "Beat-only tempo in beats per minute",
      hidden: ({ document }) => document?.productType !== "beat",
      validation: (rule) =>
        rule.integer().min(1).custom((value, context) => {
          if (context.document?.productType !== "beat") return true;
          return typeof value === "number" ? true : "BPM is required for beat products";
        }),
    }),
    defineField({
      name: "key",
      title: "Key",
      type: "string",
      group: "music",
      description: "Beat-only musical key",
      options: {
        list: [
          { title: "C", value: "C" },
          { title: "C# / Db", value: "C# / Db" },
          { title: "D", value: "D" },
          { title: "D# / Eb", value: "D# / Eb" },
          { title: "E", value: "E" },
          { title: "F", value: "F" },
          { title: "F# / Gb", value: "F# / Gb" },
          { title: "G", value: "G" },
          { title: "G# / Ab", value: "G# / Ab" },
          { title: "A", value: "A" },
          { title: "A# / Bb", value: "A# / Bb" },
          { title: "B", value: "B" },
          { title: "Cm", value: "Cm" },
          { title: "C#m / Dbm", value: "C#m / Dbm" },
          { title: "Dm", value: "Dm" },
          { title: "D#m / Ebm", value: "D#m / Ebm" },
          { title: "Em", value: "Em" },
          { title: "Fm", value: "Fm" },
          { title: "F#m / Gbm", value: "F#m / Gbm" },
          { title: "Gm", value: "Gm" },
          { title: "G#m / Abm", value: "G#m / Abm" },
          { title: "Am", value: "Am" },
          { title: "A#m / Bbm", value: "A#m / Bbm" },
          { title: "Bm", value: "Bm" },
        ],
      },
      hidden: ({ document }) => document?.productType !== "beat",
      validation: (rule) =>
        rule.custom((value, context) => {
          if (context.document?.productType !== "beat") return true;
          return value ? true : "Key is required for beat products";
        }),
    }),
    defineField({
      name: "licenseType",
      title: "License type",
      type: "string",
      group: "music",
      options: {
        list: [
          { title: "Basic", value: "basic" },
          { title: "Premium", value: "premium" },
          { title: "Exclusive", value: "exclusive" },
        ],
        layout: "radio",
      },
      description: "Beat-only licensing tier",
      hidden: ({ document }) => document?.productType !== "beat",
      validation: (rule) =>
        rule.custom((value, context) => {
          if (context.document?.productType !== "beat") return true;
          return value ? true : "License type is required for beat products";
        }),
    }),
    defineField({
      name: "systemRequirements",
      title: "System requirements",
      type: "text",
      rows: 4,
      group: "delivery",
      description: "Plugin-only requirements such as OS, DAW versions, and CPU/RAM",
      hidden: ({ document }) => document?.productType !== "plugin",
      validation: (rule) =>
        rule.custom((value, context) => {
          if (context.document?.productType !== "plugin") return true;
          return value ? true : "System requirements are required for plugin products";
        }),
    }),
    defineField({
      name: "version",
      title: "Version",
      type: "string",
      group: "delivery",
      description: "Plugin-only version label, for example 1.2.0",
      hidden: ({ document }) => document?.productType !== "plugin",
      validation: (rule) =>
        rule.custom((value, context) => {
          if (context.document?.productType !== "plugin") return true;
          return value ? true : "Version is required for plugin products";
        }),
    }),
  ],
  preview: {
    select: {
      title: "title",
      productType: "productType",
      status: "status",
      featured: "featured",
      isForSale: "isForSale",
      price: "price",
      currency: "currency",
      media: "coverImage",
    },
    prepare({ title, productType, status, featured, isForSale, price, currency, media }) {
      const productTypeLabel = productType
        ? String(productType).charAt(0).toUpperCase() + String(productType).slice(1)
        : "Product";
      const statusLabel = status
        ? String(status).charAt(0).toUpperCase() + String(status).slice(1)
        : "Draft";
      const priceLabel = isForSale
        ? `${typeof price === "number" ? price.toFixed(2) : "0.00"} ${(currency ?? "usd").toUpperCase()}`
        : "Not for sale";
      return {
        title,
        subtitle: `${productTypeLabel} · ${statusLabel} · ${priceLabel}${featured ? " · Featured" : ""}`,
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
        { field: "releaseDate", direction: "desc" },
      ],
    },
    {
      title: "Release date, newest",
      name: "releaseDateDesc",
      by: [{ field: "releaseDate", direction: "desc" }],
    },
    {
      title: "Title A-Z",
      name: "titleAsc",
      by: [{ field: "title", direction: "asc" }],
    },
  ],
});
