import type { Metadata } from "next";
import Link from "next/link";
import Stripe from "stripe";
import { createDownloadTicket } from "@/lib/fulfillment";
import { getOrderBySessionId } from "@/sanity/lib/orders";

export const metadata: Metadata = {
  title: "Order Confirmed | RTO Beats",
  description: "Your payment was successful. Thank you for your purchase.",
};

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { session_id } = await searchParams;

  // If Stripe isn't configured or no session, show a generic confirmation
  if (!session_id || !process.env.STRIPE_SECRET_KEY) {
    return <SuccessLayout title="Order received" description="Thank you for your purchase. You will receive a confirmation email shortly." />;
  }

  let session: Stripe.Checkout.Session | null = null;
  let lineItems: Stripe.LineItem[] = [];
  let downloadableLinks: { slug: string; title: string; href: string }[] = [];
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    session = await stripe.checkout.sessions.retrieve(session_id);
    const response = await stripe.checkout.sessions.listLineItems(session_id, { limit: 20 });
    lineItems = response.data;
  } catch {
    // Session retrieval failed — fall back to a generic message
  }

  if (!session || session.payment_status !== "paid") {
    return (
      <SuccessLayout
        title="Processing payment"
        description="Your payment is being processed. You will receive a confirmation email once it is confirmed."
      />
    );
  }

  const orderType = session.metadata?.orderType ?? "buy-now";
  const itemCount = Number(session.metadata?.itemCount ?? lineItems.reduce((total, item) => total + (item.quantity ?? 0), 0) ?? 1);
  const productTitle =
    orderType === "cart"
      ? `${itemCount} item${itemCount === 1 ? "" : "s"}`
      : session.metadata?.productTitle ?? lineItems[0]?.description ?? "your item";
  const isDownloadable = session.metadata?.downloadable === "true";
  const amountTotal = session.amount_total ?? 0;
  const customerEmail = session.customer_details?.email;
  const savedOrder = await getOrderBySessionId(session_id).catch(() => null);

  if (savedOrder?.items?.length) {
    downloadableLinks = savedOrder.items
      .filter((item) => item.downloadable && item.slug)
      .map((item) => ({
        slug: item.slug as string,
        title: item.title,
        href: `/api/download?ticket=${createDownloadTicket({
          sessionId: session_id,
          slug: item.slug as string,
          expiresAt: Date.now() + 1000 * 60 * 15,
        })}`,
      }));
  } else {
    const slugs = (session.metadata?.productSlugs ?? session.metadata?.productSlug ?? "").split(",").filter(Boolean);
    const downloadableSlugs = new Set(
      (session.metadata?.downloadableSlugs ?? "").split(",").filter(Boolean)
    );

    downloadableLinks = lineItems
      .map((item, index) => ({
        slug: slugs[index] ?? slugs[0],
        title: item.description ?? `Download ${index + 1}`,
      }))
      .filter((item) => Boolean(item.slug) && (downloadableSlugs.has(item.slug) || (isDownloadable && item.slug === session.metadata?.productSlug)))
      .map((item) => ({
        ...item,
        href: `/api/download?ticket=${createDownloadTicket({
          sessionId: session_id,
          slug: item.slug,
          expiresAt: Date.now() + 1000 * 60 * 15,
        })}`,
      }));
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Order confirmed</p>
          <h1 className="text-4xl font-semibold text-zinc-50">Payment successful</h1>
        </div>

        {/* Order summary */}
        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6 space-y-3">
          <p className="text-zinc-300">
            Thank you for your purchase of{" "}
            <span className="font-medium text-amber-100">{productTitle}</span>.
            {customerEmail && (
              <> A receipt has been sent to <span className="text-zinc-200">{customerEmail}</span>.</>
            )}
          </p>
          <p className="text-2xl font-semibold text-amber-200">
            Total: ${(amountTotal / 100).toFixed(2)}
          </p>
          {lineItems.length > 0 && (
            <div className="space-y-2 border-t border-white/10 pt-3">
              {lineItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 text-sm text-zinc-400">
                  <span>{item.description}</span>
                  <span>x{item.quantity ?? 1}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Digital download section */}
        {downloadableLinks.length > 0 && (
          <div className="rounded-2xl border border-amber-200/20 bg-amber-200/5 p-6 space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-amber-100">Your download{downloadableLinks.length === 1 ? " is" : "s are"} ready</h2>
              <p className="text-sm text-zinc-400">
                Download links are short-lived and generated from your paid order. The files are served through
                your account session instead of exposing permanent public asset URLs.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {downloadableLinks.map((item) => (
                <a
                  key={item.slug}
                  href={item.href}
                  className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-black transition hover:bg-amber-200"
                >
                  Download {item.title}
                </a>
              ))}
            </div>
          </div>
        )}

        {isDownloadable && downloadableLinks.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6 space-y-2">
            <h2 className="text-lg font-semibold text-zinc-100">Preparing your secure downloads</h2>
            <p className="text-sm text-zinc-400">
              Your payment is confirmed. Download access is being finalized from the webhook; refresh this page in a few seconds.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/store"
            className="rounded-full border border-white/20 px-5 py-2 text-sm text-zinc-200 transition hover:border-white/40"
          >
            Back to store
          </Link>
          <Link
            href="/"
            className="rounded-full border border-amber-200/30 px-5 py-2 text-sm text-amber-100 transition hover:border-amber-200/60"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}

// ─── Fallback layout for unconfigured / processing states ─────────────────────

function SuccessLayout({ title, description }: { title: string; description: string }) {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <div className="space-y-8">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Order confirmed</p>
          <h1 className="text-4xl font-semibold text-zinc-50">{title}</h1>
        </div>
        <p className="text-zinc-300 leading-relaxed">{description}</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/store" className="rounded-full border border-white/20 px-5 py-2 text-sm text-zinc-200 transition hover:border-white/40">
            Back to store
          </Link>
          <Link href="/" className="rounded-full border border-amber-200/30 px-5 py-2 text-sm text-amber-100 transition hover:border-amber-200/60">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
