This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Bandcamp to Sanity Import

You can import one or more existing Bandcamp album pages into the `album` document type.

Set these env vars in your local environment:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2026-03-29
SANITY_API_WRITE_TOKEN=your_write_token
```

Run importer:

```bash
npm run import:bandcamp -- https://yourname.bandcamp.com/album/album-slug
```

Useful flags:

```bash
# Preview without writing to Sanity
npm run import:bandcamp -- --dry-run https://yourname.bandcamp.com/album/album-slug

# Update existing docs that match slug or bandcampUrl
npm run import:bandcamp -- --update https://yourname.bandcamp.com/album/album-slug
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Stripe Checkout And Fulfillment

Set these local environment variables before testing checkout:

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
DIGITAL_FULFILLMENT_SECRET=generate_a_random_secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Local webhook testing with the Stripe CLI:

```bash
# 1. Forward Stripe events to your local app
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe

# 2. Copy the printed whsec_... value into STRIPE_WEBHOOK_SECRET

# 3. Start the app
npm run dev

# 4. Trigger a checkout.session.completed event manually if needed
stripe trigger checkout.session.completed
```

Expected result:

- Stripe checkout completes successfully.
- `POST /api/webhooks/stripe` verifies the signature and saves an `order` document in Sanity.
- Paid digital items appear on the success page with short-lived signed download links.
- `GET /api/download` streams the purchased file without exposing a permanent asset URL.

## Production Security Checklist

Run this checklist before deploying to Vercel:

- Environment and secrets:
	- Set `STRIPE_SECRET_KEY` only in server-side Vercel env vars.
	- Set `STRIPE_WEBHOOK_SECRET` from your production Stripe webhook endpoint.
	- Set `DIGITAL_FULFILLMENT_SECRET` to a strong random value unique to production.
	- Set `SITE_URL` (or `NEXT_PUBLIC_BASE_URL`) to your HTTPS production origin.
	- Ensure `SANITY_API_WRITE_TOKEN` is present for webhook order persistence.
	- Never expose Sanity or Stripe secrets in client-side code or `NEXT_PUBLIC_*` vars.

- Stripe:
	- In Stripe Dashboard, configure the production webhook endpoint to `https://<your-domain>/api/webhooks/stripe`.
	- Subscribe at minimum to `checkout.session.completed`.
	- Verify webhook deliveries return HTTP 200 in Stripe event logs.

- API and abuse protections:
	- Confirm checkout flow works only from your own origin.
	- Confirm webhook signature validation fails for tampered payloads.
	- Confirm rate limiting responses return HTTP 429 under stress.
	- Confirm `/api/download` requires a valid signed ticket and paid order.

- Browser security headers:
	- Confirm CSP is active in production responses.
	- Confirm `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy` headers are present.
	- Confirm HSTS header is present on production HTTPS responses.

- Content and embeds:
	- Ensure Bandcamp embeds still render from sanitized iframe source extraction.
	- Verify Stripe checkout redirect and return pages still function under CSP.
	- Verify remote images load only from approved hosts.

- Dependency hygiene:
	- Run `npm audit --omit=dev` on CI.
	- Keep Next.js patched (`next@15.5.14` or newer within the approved range).
	- Track remaining Sanity CLI transitive advisories and update Sanity ecosystem after validating compatibility.

- Final validation:
	- Run `npx tsc --noEmit`.
	- Run a full purchase test in Stripe test mode.
	- Validate order record persistence and secure download behavior end-to-end.

### Security Tradeoffs

- CSP currently allows `'unsafe-inline'` styles/scripts for Next.js and third-party compatibility. This is stricter than default, but not as strict as nonce-only CSP.
- Stripe checkout depends on `https://checkout.stripe.com` frame and script origins; blocking these will break payment UX.
- Sanity and media/image hosts are explicitly allowlisted in CSP and remote image patterns. New providers must be added intentionally.
- Bandcamp embedding is constrained to extracted `https://bandcamp.com/EmbeddedPlayer...` iframe URLs, replacing raw HTML injection to reduce XSS risk.
- In-memory rate limiting protects against common abuse but is instance-local; use edge/network rate limiting (Vercel WAF, CDN, or Redis-based limits) for distributed production enforcement.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
