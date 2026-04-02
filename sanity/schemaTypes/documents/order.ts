import { defineField, defineType } from "sanity";

export const orderType = defineType({
  name: "order",
  title: "Order",
  type: "document",
  initialValue: () => ({
    status: "pending",
    fulfillmentType: "digital",
    createdAt: new Date().toISOString(),
  }),
  fields: [
    defineField({
      name: "stripeSessionId",
      title: "Stripe session ID",
      type: "string",
      description: "Stripe Checkout session identifier, for example cs_test_...",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "customerEmail",
      title: "Customer email",
      type: "string",
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: "productTitle",
      title: "Product title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "productSlug",
      title: "Product slug",
      type: "string",
      description: "Store the purchased product slug for fulfillment workflows",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "amountTotal",
      title: "Amount total",
      type: "number",
      description: "Final paid amount in major currency units (for example 29.99)",
      validation: (rule) => rule.required().min(0).precision(2),
    }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      options: {
        list: [
          { title: "USD", value: "usd" },
          { title: "EUR", value: "eur" },
          { title: "GBP", value: "gbp" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Paid", value: "paid" },
          { title: "Fulfilled", value: "fulfilled" },
          { title: "Canceled", value: "canceled" },
          { title: "Refunded", value: "refunded" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "fulfillmentType",
      title: "Fulfillment type",
      type: "string",
      options: {
        list: [
          { title: "Digital", value: "digital" },
          { title: "Physical", value: "physical" },
          { title: "License", value: "license" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "createdAt",
      title: "Created at",
      type: "datetime",
      description: "Timestamp of order creation in UTC",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "fulfillmentStatus",
      title: "Fulfillment status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Ready", value: "ready" },
          { title: "Fulfilled", value: "fulfilled" },
          { title: "Revoked", value: "revoked" },
          { title: "Expired", value: "expired" },
        ],
        layout: "radio",
      },
      initialValue: "pending",
    }),
    defineField({
      name: "downloadAccessExpiresAt",
      title: "Download access expires at",
      type: "datetime",
      description: "If set, digital download access should stop after this UTC timestamp.",
    }),
    defineField({
      name: "fulfilledAt",
      title: "Fulfilled at",
      type: "datetime",
      description: "Timestamp when the system made digital delivery available.",
    }),
    defineField({
      name: "items",
      title: "Items",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "slug",
              title: "Slug",
              type: "string",
            }),
            defineField({
              name: "kind",
              title: "Kind",
              type: "string",
            }),
            defineField({
              name: "quantity",
              title: "Quantity",
              type: "number",
              validation: (rule) => rule.required().min(1),
            }),
            defineField({
              name: "unitAmount",
              title: "Unit amount",
              type: "number",
              validation: (rule) => rule.required().min(0).precision(2),
            }),
            defineField({
              name: "amountTotal",
              title: "Line total",
              type: "number",
              validation: (rule) => rule.required().min(0).precision(2),
            }),
            defineField({
              name: "currency",
              title: "Currency",
              type: "string",
            }),
            defineField({
              name: "stripePriceId",
              title: "Stripe price ID",
              type: "string",
            }),
            defineField({
              name: "downloadable",
              title: "Downloadable",
              type: "boolean",
              initialValue: false,
            }),
          ],
          preview: {
            select: {
              title: "title",
              quantity: "quantity",
              amountTotal: "amountTotal",
            },
            prepare({ title, quantity, amountTotal }) {
              const lineTotal = typeof amountTotal === "number" ? amountTotal.toFixed(2) : "0.00";
              return {
                title: title ?? "Order item",
                subtitle: `Qty ${quantity ?? 1} · $${lineTotal}`,
              };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "productTitle",
      status: "status",
      amountTotal: "amountTotal",
      currency: "currency",
      customerEmail: "customerEmail",
      createdAt: "createdAt",
    },
    prepare({ title, status, amountTotal, currency, customerEmail, createdAt }) {
      const statusLabel = status
        ? String(status).charAt(0).toUpperCase() + String(status).slice(1)
        : "Pending";
      const amountLabel = typeof amountTotal === "number" ? amountTotal.toFixed(2) : "0.00";
      const dateLabel = createdAt ? new Date(createdAt).toLocaleDateString() : "No date";
      return {
        title: title ?? "Untitled order",
        subtitle: `${statusLabel} · ${amountLabel} ${(currency ?? "usd").toUpperCase()} · ${customerEmail ?? "No email"} · ${dateLabel}`,
      };
    },
  },
  orderings: [
    {
      title: "Newest first",
      name: "createdAtDesc",
      by: [{ field: "createdAt", direction: "desc" }],
    },
  ],
});