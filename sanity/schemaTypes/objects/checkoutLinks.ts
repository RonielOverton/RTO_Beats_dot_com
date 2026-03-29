import { defineField, defineType } from "sanity";

export const checkoutLinksType = defineType({
  name: "checkoutLinks",
  title: "Checkout links",
  type: "object",
  fields: [
    defineField({
      name: "stripePriceId",
      title: "Stripe price ID",
      type: "string",
      description: "Optional. Example: price_123...",
    }),
    defineField({
      name: "shopifyVariantId",
      title: "Shopify variant ID",
      type: "string",
      description: "Optional. If you use Shopify, paste the variant ID",
    }),
    defineField({
      name: "externalCheckoutUrl",
      title: "External checkout URL",
      type: "url",
      description: "Optional. Direct checkout link for Gumroad, Lemon Squeezy, etc.",
    }),
  ],
});
