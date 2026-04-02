import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { enforceRateLimit } from "@/lib/rate-limit";
import { toPublicErrorMessage } from "@/lib/server-security";
import { persistStripeOrder } from "@/sanity/lib/orders";

export const runtime = "nodejs";
const MAX_WEBHOOK_PAYLOAD_BYTES = 1024 * 1024;

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }

  return new Stripe(key);
}

function getWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  }

  return secret;
}

export async function POST(req: NextRequest) {
  const rateLimit = enforceRateLimit(req, {
    key: "stripe-webhook",
    limit: 120,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many webhook requests" },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  let stripe: Stripe;
  let webhookSecret: string;
  try {
    stripe = getStripe();
    webhookSecret = getWebhookSecret();
  } catch (error) {
    return NextResponse.json(
      { error: toPublicErrorMessage(error, "Webhook is not configured") },
      { status: 503 }
    );
  }

  const payload = await req.text();

  if (payload.length > MAX_WEBHOOK_PAYLOAD_BYTES) {
    return NextResponse.json({ error: "Webhook payload too large" }, { status: 413 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true, ignored: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  try {
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
    const slugs = (session.metadata?.productSlugs ?? session.metadata?.productSlug ?? "").split(",").filter(Boolean);
    const kinds = (session.metadata?.productKinds ?? session.metadata?.productKind ?? "").split(",").filter(Boolean);
    const downloadableSlugs = new Set((session.metadata?.downloadableSlugs ?? "").split(",").filter(Boolean));
    const defaultDownloadable = session.metadata?.downloadable === "true";

    await persistStripeOrder({
      session,
      items: lineItems.data.map((item, index) => ({
        title: item.description ?? `Item ${index + 1}`,
        slug: slugs[index] ?? slugs[0],
        kind: kinds[index] ?? kinds[0],
        quantity: item.quantity ?? 1,
        unitAmount: item.price?.unit_amount ?? 0,
        amountTotal: item.amount_total ?? 0,
        currency: item.currency ?? session.currency ?? "usd",
        stripePriceId: item.price?.id,
        downloadable: slugs[index] ? downloadableSlugs.has(slugs[index]) : defaultDownloadable,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: toPublicErrorMessage(error, "Webhook processing failed") },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}