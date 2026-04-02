import "server-only";
import { createClient } from "@sanity/client";
import groq from "groq";
import Stripe from "stripe";
import { assertSanityEnv, isSanityConfigured, sanityEnv } from "@/sanity/env";

interface StripeOrderItemInput {
  title: string;
  slug?: string;
  kind?: string;
  quantity: number;
  unitAmount: number;
  amountTotal: number;
  currency: string;
  stripePriceId?: string;
  downloadable?: boolean;
}

interface StoredOrderItem {
  title: string;
  slug?: string;
  kind?: string;
  quantity: number;
  unitAmount: number;
  amountTotal: number;
  currency: string;
  stripePriceId?: string;
  downloadable?: boolean;
}

export interface StoredOrder {
  stripeSessionId: string;
  customerEmail: string;
  status: string;
  fulfillmentType: "digital" | "physical" | "license";
  fulfillmentStatus?: "pending" | "ready" | "fulfilled" | "revoked" | "expired";
  downloadAccessExpiresAt?: string;
  fulfilledAt?: string;
  items: StoredOrderItem[];
}

function getSanityWriteClient() {
  if (!isSanityConfigured) {
    assertSanityEnv();
    throw new Error("Sanity is not configured");
  }

  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) {
    throw new Error("Missing Sanity write token. Set SANITY_API_WRITE_TOKEN for webhook order persistence.");
  }

  return createClient({
    projectId: sanityEnv.projectId,
    dataset: sanityEnv.dataset,
    apiVersion: sanityEnv.apiVersion,
    useCdn: false,
    token,
    perspective: "published",
  });
}

function getSanityReadClient() {
  if (!isSanityConfigured) {
    assertSanityEnv();
    throw new Error("Sanity is not configured");
  }

  return createClient({
    projectId: sanityEnv.projectId,
    dataset: sanityEnv.dataset,
    apiVersion: sanityEnv.apiVersion,
    useCdn: false,
    token: process.env.SANITY_API_READ_TOKEN ?? process.env.SANITY_API_WRITE_TOKEN,
    perspective: "published",
  });
}

const orderBySessionIdQuery = groq`
  *[_type == "order" && stripeSessionId == $sessionId][0] {
    stripeSessionId,
    customerEmail,
    status,
    fulfillmentType,
    fulfillmentStatus,
    downloadAccessExpiresAt,
    fulfilledAt,
    items[] {
      title,
      slug,
      kind,
      quantity,
      unitAmount,
      amountTotal,
      currency,
      stripePriceId,
      downloadable
    }
  }
`;

function inferFulfillmentType(items: StripeOrderItemInput[]): "digital" | "physical" | "license" {
  if (items.some((item) => item.kind === "merch")) {
    return "physical";
  }

  if (items.some((item) => item.downloadable)) {
    return "digital";
  }

  return "license";
}

export async function persistStripeOrder({
  session,
  items,
}: {
  session: Stripe.Checkout.Session;
  items: StripeOrderItemInput[];
}) {
  const client = getSanityWriteClient();
  const orderId = `order-${session.id}`;
  const primaryItem = items[0];
  const customerEmail = session.customer_details?.email ?? session.customer_email ?? "unknown@rto.invalid";
  const hasDigitalItems = items.some((item) => item.downloadable);
  const createdAt = new Date((session.created ?? Math.floor(Date.now() / 1000)) * 1000).toISOString();
  const downloadAccessExpiresAt = hasDigitalItems
    ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString()
    : undefined;

  await client.createIfNotExists({
    _id: orderId,
    _type: "order",
    stripeSessionId: session.id,
    createdAt,
  });

  await client
    .patch(orderId)
    .set({
      stripeSessionId: session.id,
      customerEmail,
      productTitle: items.length === 1 ? primaryItem?.title ?? "Order" : `${items.length} items`,
      productSlug: items.length === 1 ? primaryItem?.slug ?? "unknown" : "cart",
      amountTotal: (session.amount_total ?? 0) / 100,
      currency: session.currency ?? "usd",
      status: session.payment_status === "paid" ? "paid" : "pending",
      fulfillmentType: inferFulfillmentType(items),
      fulfillmentStatus: hasDigitalItems
        ? session.payment_status === "paid"
          ? "ready"
          : "pending"
        : "pending",
      downloadAccessExpiresAt,
      fulfilledAt: hasDigitalItems && session.payment_status === "paid" ? new Date().toISOString() : undefined,
      items: items.map((item) => ({
        _key: `${item.slug ?? item.title}-${item.stripePriceId ?? item.quantity}`,
        title: item.title,
        slug: item.slug,
        kind: item.kind,
        quantity: item.quantity,
        unitAmount: item.unitAmount / 100,
        amountTotal: item.amountTotal / 100,
        currency: item.currency.toLowerCase(),
        stripePriceId: item.stripePriceId,
        downloadable: Boolean(item.downloadable),
      })),
    })
    .commit();
}

export async function getOrderBySessionId(sessionId: string): Promise<StoredOrder | null> {
  const client = getSanityReadClient();
  return client.fetch<StoredOrder | null>(orderBySessionIdQuery, { sessionId });
}