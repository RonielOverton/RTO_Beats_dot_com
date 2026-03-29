import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Checkout adapter placeholder",
    status: "ready",
    providers: {
      stripe: {
        enabled: false,
        nextStep: "Create POST /api/checkout session endpoint and use stripePriceId from product data.",
      },
      shopify: {
        enabled: false,
        nextStep:
          "Create Storefront API checkout flow and use shopifyVariantId from product data entries.",
      },
    },
  });
}
