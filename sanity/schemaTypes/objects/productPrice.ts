import { defineField, defineType } from "sanity";

export const productPriceType = defineType({
  name: "productPrice",
  title: "Product price",
  type: "object",
  fields: [
    defineField({
      name: "amount",
      title: "Amount",
      type: "number",
      description: "Whole dollar amount shown on the store card, for example 49",
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      initialValue: "USD",
      options: {
        list: [{ title: "USD", value: "USD" }],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      amount: "amount",
      currency: "currency",
    },
    prepare({ amount, currency }) {
      return {
        title: amount != null ? `${currency ?? "USD"} ${amount}` : "No price",
      };
    },
  },
});
