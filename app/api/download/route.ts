import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { sanitizeDownloadFilename, verifyDownloadTicket } from "@/lib/fulfillment";
import { enforceRateLimit } from "@/lib/rate-limit";
import { isAllowedSanityAssetUrl, toPublicErrorMessage } from "@/lib/server-security";
import { isSanityConfigured } from "@/sanity/env";
import { sanityFetch } from "@/sanity/lib/client";
import { getOrderBySessionId } from "@/sanity/lib/orders";
import { downloadableProductBySlugQuery } from "@/sanity/lib/queries/products";

interface DownloadableProductRecord {
  title: string;
  slug: string;
  kind: string;
  downloadVersion?: string;
  downloadable?: boolean;
  downloadAsset?: {
    url?: string;
    mimeType?: string;
    originalFilename?: string;
  };
}

/**
 * GET /api/download?ticket=...
 *
 * Verifies a short-lived signed download ticket, checks saved order authorization,
 * and then streams the file through the application server.
 *
 * Security model:
 * - Customers receive a short-lived HMAC-signed ticket instead of a permanent file URL.
 * - The file is fetched server-side and streamed back to the browser; the asset URL is not exposed.
 * - Saved order data remains the authorization record for digital delivery.
 */
export async function GET(req: NextRequest) {
  const rateLimit = enforceRateLimit(req, {
    key: "digital-download",
    limit: 30,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many download attempts" }, { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } });
  }

  const ticket = req.nextUrl.searchParams.get("ticket");

  if (!ticket) {
    return NextResponse.json({ error: "Missing download ticket" }, { status: 400 });
  }

  let sessionId: string;
  let productSlug: string;
  try {
    const payload = verifyDownloadTicket(ticket);
    sessionId = payload.sessionId;
    productSlug = payload.slug;
  } catch {
    return NextResponse.json(
      { error: "Invalid download ticket" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  // ── Stripe verification ────────────────────────────────────────────────────

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe is not configured on this server" }, { status: 503 });
  }

  let session: Stripe.Checkout.Session;
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return NextResponse.json({ error: "Invalid or expired session" }, { status: 400 });
  }

  if (session.payment_status !== "paid") {
    return NextResponse.json({ error: "Payment has not been completed" }, { status: 402 });
  }

  const savedOrder = await getOrderBySessionId(sessionId).catch(() => null);
  const orderItem = savedOrder?.items.find((item) => item.slug === productSlug && item.downloadable);

  if (savedOrder) {
    if (savedOrder.status !== "paid") {
      return NextResponse.json({ error: "Order is not marked as paid yet" }, { status: 409, headers: { "Cache-Control": "no-store" } });
    }

    if (savedOrder.fulfillmentStatus && ["revoked", "expired"].includes(savedOrder.fulfillmentStatus)) {
      return NextResponse.json({ error: "Download access is no longer available" }, { status: 403, headers: { "Cache-Control": "no-store" } });
    }

    if (savedOrder.downloadAccessExpiresAt && Date.now() > new Date(savedOrder.downloadAccessExpiresAt).getTime()) {
      return NextResponse.json({ error: "Download access has expired" }, { status: 410, headers: { "Cache-Control": "no-store" } });
    }

    if (!orderItem) {
      return NextResponse.json({ error: "This order does not grant access to that download" }, { status: 403, headers: { "Cache-Control": "no-store" } });
    }
  } else {
    const fallbackProductSlug = session.metadata?.productSlug;
    const fallbackDownloadable = session.metadata?.downloadable === "true";
    const fallbackDownloadableSlugs = new Set(
      (session.metadata?.downloadableSlugs ?? "").split(",").filter(Boolean)
    );

    const isAuthorizedFallback =
      (fallbackProductSlug === productSlug && fallbackDownloadable) ||
      fallbackDownloadableSlugs.has(productSlug);

    if (!isAuthorizedFallback) {
      return NextResponse.json({ error: "This session does not authorize that download" }, { status: 403, headers: { "Cache-Control": "no-store" } });
    }
  }

  // ── Sanity product lookup ─────────────────────────────────────────────────

  if (!isSanityConfigured) {
    return NextResponse.json({ error: "CMS is not configured on this server" }, { status: 503 });
  }

  const product = await sanityFetch<DownloadableProductRecord | null>({
    query: downloadableProductBySlugQuery,
    params: { slug: productSlug },
    tags: ["product"],
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const downloadUrl = product.downloadAsset?.url;

  if (!product.downloadable || !downloadUrl) {
    return NextResponse.json(
      { error: "No downloadable file is attached to this product in Sanity" },
      { status: 404 }
    );
  }

  if (!isAllowedSanityAssetUrl(downloadUrl)) {
    return NextResponse.json({ error: "Download asset URL is not allowed" }, { status: 400 });
  }

  let assetResponse: Response;
  try {
    assetResponse = await fetch(downloadUrl, {
      cache: "no-store",
      redirect: "error",
    });
  } catch (error) {
    return NextResponse.json({ error: toPublicErrorMessage(error, "Unable to fetch the download asset") }, { status: 502 });
  }

  if (!assetResponse.ok || !assetResponse.body) {
    return NextResponse.json({ error: "Unable to fetch the download asset" }, { status: 502 });
  }

  const filename = sanitizeDownloadFilename(
    product.downloadAsset?.originalFilename ?? `${product.slug}-${product.downloadVersion ?? "download"}`
  );

  const headers = new Headers({
    "Content-Type": product.downloadAsset?.mimeType ?? assetResponse.headers.get("content-type") ?? "application/octet-stream",
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Cache-Control": "private, no-store, max-age=0",
    "X-Content-Type-Options": "nosniff",
  });

  const contentLength = assetResponse.headers.get("content-length");
  if (contentLength) {
    headers.set("Content-Length", contentLength);
  }

  return new NextResponse(assetResponse.body, {
    status: 200,
    headers,
  });
}
