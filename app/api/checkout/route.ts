import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getServerBaseUrl, hasAllowedOrigin, isJsonRequest, isValidStoreSlug, parseQuantity, toPublicErrorMessage } from "@/lib/server-security";
import { getStoreItemBySlug } from "@/lib/server-store";
import type { CartLine } from "@/types/content";

export const runtime = "nodejs";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BuyNowProduct {
  slug: string;
}

interface BuyNowBody {
  mode: "buy-now";
  product: BuyNowProduct;
}

interface CartBody {
  mode: "cart";
  lines: CartLine[];
}

type CheckoutBody = BuyNowBody | CartBody;

function encodeJoinedMetadata(values: string[], maxLength = 500): string {
  let result = "";

  for (const value of values.filter(Boolean)) {
    const nextValue = result ? `${result},${value}` : value;
    if (nextValue.length > maxLength) {
      break;
    }
    result = nextValue;
  }

  return result;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key);
}

function getCheckoutRedirectUrl(session: Stripe.Checkout.Session): string {
  if (!session.url) {
    throw new Error("Stripe checkout URL is missing");
  }

  const parsed = new URL(session.url);
  if (parsed.protocol !== "https:" || parsed.hostname !== "checkout.stripe.com") {
    throw new Error("Unexpected Stripe checkout redirect URL");
  }

  return parsed.toString();
}

// ─── Diagnostic GET (keep for health checks) ─────────────────────────────────

export async function GET() {
  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);
  return NextResponse.json(
    {
      message: stripeConfigured ? "RTO Beats checkout endpoint" : "RTO Beats checkout endpoint unavailable",
    },
    { status: stripeConfigured ? 200 : 503 }
  );
}

// ─── Checkout session creation ────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!hasAllowedOrigin(req)) {
    return NextResponse.json({ error: "Origin not allowed" }, { status: 403 });
  }

  if (!isJsonRequest(req)) {
    return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
  }

  const rateLimit = enforceRateLimit(req, {
    key: "checkout-create-session",
    limit: 20,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many checkout attempts. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  let stripe: Stripe;
  try {
    stripe = getStripe();
  } catch (error) {
    return NextResponse.json(
      { error: toPublicErrorMessage(error, "Checkout is not available right now") },
      { status: 503 }
    );
  }

  let body: CheckoutBody;
  try {
    body = (await req.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  let base: URL;
  try {
    base = getServerBaseUrl();
  } catch (error) {
    return NextResponse.json(
      { error: toPublicErrorMessage(error, "Checkout is not available right now") },
      { status: 503 }
    );
  }

  // ── Single product "Buy Now" ───────────────────────────────────────────────
  if (body.mode === "buy-now") {
    const { product } = body;

    if (!product?.slug || !isValidStoreSlug(product.slug)) {
      return NextResponse.json({ error: "Invalid product slug" }, { status: 400 });
    }

    const item = await getStoreItemBySlug(product.slug);

    if (!item) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (item.checkout.externalCheckoutUrl) {
      return NextResponse.json({ error: "This product uses an external checkout flow" }, { status: 400 });
    }

    if (item.stockStatus === "out-of-stock") {
      return NextResponse.json({ error: "This product is out of stock" }, { status: 409 });
    }

    if (!item.checkout.stripePriceId) {
      return NextResponse.json({ error: "Missing Stripe Price configuration for this product" }, { status: 409 });
    }

    const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
      price: item.checkout.stripePriceId,
      quantity: 1,
    };

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [lineItem],
        success_url: `${base.origin}/store/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${base.origin}/store/${item.slug}`,
        metadata: {
          orderType: "buy-now",
          itemCount: "1",
          productSlug: item.slug,
          productKind: item.kind,
          productTitle: item.title,
          downloadable: String(Boolean(item.downloadable)),
        },
      });

      return NextResponse.json(
        { url: getCheckoutRedirectUrl(session) },
        { headers: { "Cache-Control": "no-store" } }
      );
    } catch (error) {
      return NextResponse.json(
        { error: toPublicErrorMessage(error, "Unable to start checkout right now") },
        { status: 502, headers: { "Cache-Control": "no-store" } }
      );
    }
  }

  // ── Cart checkout ─────────────────────────────────────────────────────────
  if (body.mode === "cart") {
    const { lines } = body;

    if (!Array.isArray(lines) || lines.length === 0 || lines.length > 25) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const resolvedLines = await Promise.all(
      lines.map(async (line) => {
        if (!line?.slug || !isValidStoreSlug(line.slug)) {
          return { error: "Invalid cart item slug" as const };
        }

        const quantity = parseQuantity(line.quantity);
        if (!quantity) {
          return { error: `Invalid quantity for ${line.slug}` as const };
        }

        const item = await getStoreItemBySlug(line.slug);

        if (!item) {
          return { error: `Product not found for ${line.slug}` as const };
        }

        if (item.checkout.externalCheckoutUrl) {
          return { error: `${item.title} uses an external checkout flow and cannot be added to cart` as const };
        }

        if (item.stockStatus === "out-of-stock") {
          return { error: `${item.title} is out of stock` as const };
        }

        if (!item.checkout.stripePriceId) {
          return { error: `${item.title} is missing a Stripe Price ID` as const };
        }

        return { item, quantity };
      })
    );

    const invalidLine = resolvedLines.find((entry) => "error" in entry);
    if (invalidLine && "error" in invalidLine) {
      return NextResponse.json({ error: invalidLine.error }, { status: 400 });
    }

    const validLines = resolvedLines.filter((entry): entry is { item: Awaited<ReturnType<typeof getStoreItemBySlug>> extends infer T ? Exclude<T, null> : never; quantity: number } => "item" in entry);

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = validLines.map(({ item, quantity }) => ({
      price: item.checkout.stripePriceId!,
      quantity,
    }));

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: lineItems,
        success_url: `${base.origin}/store/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${base.origin}/cart`,
        metadata: {
          orderType: "cart",
          itemCount: String(validLines.reduce((total, line) => total + line.quantity, 0)),
          productSlugs: encodeJoinedMetadata(validLines.map((line) => line.item.slug)),
          productKinds: encodeJoinedMetadata(validLines.map((line) => line.item.kind)),
          downloadableSlugs: encodeJoinedMetadata(validLines.filter((line) => line.item.downloadable).map((line) => line.item.slug)),
        },
      });

      return NextResponse.json(
        { url: getCheckoutRedirectUrl(session) },
        { headers: { "Cache-Control": "no-store" } }
      );
    } catch (error) {
      return NextResponse.json(
        { error: toPublicErrorMessage(error, "Unable to start checkout right now") },
        { status: 502, headers: { "Cache-Control": "no-store" } }
      );
    }
  }

  return NextResponse.json({ error: "Invalid checkout mode. Use 'buy-now' or 'cart'." }, { status: 400 });
}

