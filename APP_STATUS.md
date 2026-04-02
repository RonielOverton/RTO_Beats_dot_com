# RTO Beats App Status

Last updated: 2026-04-02

## Project Snapshot
- Framework: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- CMS: Sanity v5 (schema authoring + `@sanity/client` for data fetching)
- Design: dark premium theme — Bebas Neue headings, Manrope body, amber/cyan accent palette
- Build: ✅ 15/15 pages, zero errors

---

## Architecture

```
.github/
  agents/
    security.agent.md      — Specialist agent for security, webhooks, secrets, and fulfillment hardening
  prompts/
    audio-player.prompt.md  — Specialist agent for playback and media-player work
    storefront.prompt.md    — Specialist agent for store and checkout work

app/
  page.tsx                  — Homepage (Hero, Bio, FeaturedWork, CTA, YouTube)
  albums/
    page.tsx                — Albums index — Sanity-driven, SanityAlbumCard grid
    [slug]/page.tsx         — Album detail — Sanity-driven, full layout
  store/
    page.tsx                — Store index — local + Sanity catalog merge
    [slug]/page.tsx         — Store item detail — local + Sanity lookup chain
    success/page.tsx        — Stripe order confirmation page
  cart/page.tsx             — Cart page with Stripe checkout handoff
  api/
    checkout/route.ts       — Stripe Checkout session creator (buy-now + cart)
    download/route.ts       — Signed-ticket digital delivery with server-streamed files
    webhooks/stripe/route.ts — Stripe webhook verification + order persistence
    youtube/route.ts        — YouTube feed (API key or RSS fallback)

components/site/
  albums/
    AlbumCard.tsx           — Reusable card with explicit flat props
    SanityAlbumCard.tsx     — Thin adapter: SanityAlbumListItem → AlbumCard
  Header.tsx / Footer.tsx
  Hero.tsx / BioSection.tsx / CtaSection.tsx
  FeaturedWorkSection.tsx   — Still reads from local lib/catalog.ts
  YoutubeSection.tsx        — Client component, fetches /api/youtube

sanity/
  schemaTypes/
    documents/album.ts      — Album document type (4 field groups)
    objects/
      track.ts / credit.ts / streamingLinks.ts
  lib/
    client.ts               — sanityFetch helper (conditional on isSanityConfigured)
    queries.ts              — allAlbumsQuery, allAlbumSlugsQuery, albumBySlugQuery
    types.ts                — SanityAlbumListItem, SanityAlbumDetail + sub-types
  env.ts                    — Env var reading, isSanityConfigured, assertSanityEnv

data/
  albums.ts                 — ⏳ Legacy local album data (FeaturedWorkSection still reads this)
  store.ts / site.ts        — Local store and site config data

lib/
  catalog.ts                — Local query helpers (getAlbumBySlug etc.) — partially still in use
  seo.ts / utils.ts
```

---

## Current Features

### Homepage
- Hero with Spotlight visual effect
- Bio section
- FeaturedWorkSection (reads local `data/albums.ts` — not yet Sanity-driven)
- CTA section
- YoutubeSection — fetches `/api/youtube` on mount, renders 3 latest video cards

### YouTube API (`/api/youtube`)
- Uses `YOUTUBE_API_KEY` if set
- Falls back to RSS scraping from YouTube channel feed
- Falls back to local static cards

### Albums (`/albums` + `/albums/[slug]`)
- **Index page**: fully Sanity-driven — `allAlbumsQuery`, renders `SanityAlbumCard` grid
- **Detail page**: fully Sanity-driven — `albumBySlugQuery` by slug, renders full layout:
  - Cover image + hero metadata
  - Release date + status badge (Released / Upcoming / Draft)
  - Genre tags, featured artists
  - Full description
  - Tracklist with track numbers, featuring credits, durations
  - Streaming links (Spotify, Apple Music, YouTube, SoundCloud, Bandcamp)
  - Credits grid (name + role)
  - Gallery image grid
  - Bandcamp embed player (if `bandcampEmbedCode` set in Sanity)
- Both pages guard on `isSanityConfigured` and render a setup banner if env vars are absent
- `generateStaticParams` pulls slugs from Sanity when configured
- `generateMetadata` outputs title, description, canonical, OpenGraph image
- JSON-LD `MusicAlbum` schema via `StructuredData`

### Store (`/store` + `/store/[slug]`)
- Sanity products and albums merged into the store catalog
- Product detail page resolves local products, Sanity products, and Sanity albums by slug
- Direct Stripe checkout for single-item Buy Now flow
- Direct Stripe checkout for multi-item cart flow
- Success page renders paid order summary and line items from Stripe
- Digital fulfillment uses short-lived signed download tickets and server-streamed files
- Supports digital albums, beats, plugins, and digital download products after payment

### Cart
- CartProvider with React context + localStorage persistence
- Cart checkout posts only `slug` and `quantity` to `/api/checkout`
- Cart lines preserve Stripe price IDs so Checkout uses Sanity-backed Stripe prices when available

### Stripe Fulfillment
- `POST /api/webhooks/stripe` verifies Stripe signatures with `STRIPE_WEBHOOK_SECRET`
- On `checkout.session.completed`, the app fetches Stripe line items and persists an `order` document to Sanity when a write token is available
- Order schema now supports an `items` array for multi-item carts plus fulfillment metadata for digital delivery access windows
- Download access is authorized from saved order data and streamed through the app, so permanent asset URLs are not exposed to customers

---

## Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Yes (for Sanity) | Sanity project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | Yes (for Sanity) | Dataset name (default: `production`) |
| `NEXT_PUBLIC_SANITY_API_VERSION` | Yes (for Sanity) | API version (default: `2026-03-29`) |
| `SANITY_API_READ_TOKEN` | Optional | For draft/private content |
| `SANITY_API_WRITE_TOKEN` | Optional | Required for local import scripts that create/update Sanity docs |
| `YOUTUBE_API_KEY` | Optional | Improves YouTube feed reliability |
| `STRIPE_SECRET_KEY` | Yes (for checkout) | Stripe secret key — server-side only, never expose to client |
| `STRIPE_WEBHOOK_SECRET` | Yes (for webhooks) | Stripe webhook signing secret for `POST /api/webhooks/stripe` |
| `DIGITAL_FULFILLMENT_SECRET` | Recommended | Separate secret for signing short-lived download tickets; falls back to Stripe secrets if absent |
| `NEXT_PUBLIC_BASE_URL` | Yes (for checkout) | Full origin URL, e.g. `https://rtobeats.com` (for Stripe redirect URLs) |

Copy `.env.example` → `.env.local` and fill in `NEXT_PUBLIC_SANITY_PROJECT_ID` to enable live Sanity data.

---

## Pending Work

- [x] **FeaturedAlbumsSection** — Sanity-powered, replaces local `FeaturedWorkSection` on homepage
- [x] **Store pages** — Sanity products + albums wired to `/store` and `/store/[slug]`; Stripe checkout live
- [x] **Stripe webhook** — `POST /api/webhooks/stripe` verifies signatures and persists paid orders to Sanity
- [x] **Digital fulfillment** — paid digital products use signed ticket downloads and saved order authorization
- [x] **Production security audit** — dependencies reviewed, unused packages removed, headers/CSP configured; see `SECURITY_PRE_LAUNCH.md`
- [ ] **Rate-limit hardening** — Current in-memory implementation safe for Vercel; must add Redis if multi-instance deployment
- [ ] **Sanity Studio** — set up Studio UI at `/studio` route or standalone
- [ ] **ESLint** — install as dev dependency (recurring build warning)
- [ ] **`.env.local`** — populate `NEXT_PUBLIC_SANITY_PROJECT_ID`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `DIGITAL_FULFILLMENT_SECRET`, `NEXT_PUBLIC_BASE_URL`

---

## Change Log

### 2026-04-02 — Production security audit and pre-launch checklist
- Reviewed all production dependencies: removed 3 unused packages (motion, styled-components, class-variance-authority), pinned security-critical versions to exact releases (Stripe, Sanity, Next.js, React) to prevent auto-minor updates in production
- Confirmed Stripe webhook security: signature verification enabled, payload size limits enforced, rate limiting in place (120 req/min per IP), error handling produces safe public messages
- Confirmed HTTP security headers: CSP with strict source allowlist, HSTS (2-year) in production, X-Frame-Options DENY, Permissions-Policy restricting camera/mic/geo, COOP/CORP for cross-origin isolation
- Confirmed server-side validation: store slug patterns validated, quantity bounds checked (1–10), origin validation enforces same-site requests, Sanity asset URLs whitelisted to cdn.sanity.io only
- Created comprehensive pre-launch security checklist in `SECURITY_PRE_LAUNCH.md` including: vulnerability inventory, env var requirements, secrets scanning commands, Stripe webhook configuration steps, deployment risks (especially multi-instance rate-limiting), and launch readiness criteria
- Why: ensures production launch meets security baseline and gives ops team actionable checklist for pre-deploy verification

### 2026-04-01 — Sanity production hardening audit
- Restricted public Sanity product and album queries to non-draft publishable states so draft entries are not exposed in slug generation, listings, detail pages, or featured rails — `sanity/lib/queries/products.ts`, `sanity/lib/queries/albums.ts`
- Removed direct `downloadUrl` exposure from the public product detail query and kept downloadable asset access in the dedicated server-side fulfillment query path — `sanity/lib/queries/products.ts`
- Hardened JSON-LD rendering by escaping script-sensitive characters before injecting structured data from CMS-backed content — `components/site/StructuredData.tsx`
- Why: enforces clearer public/private data boundaries for Sanity content and reduces XSS/script-breakout risk from CMS-derived values

### 2026-04-01 — Stripe production hardening follow-up audit
- Minimized client checkout request bodies so buy-now sends only product slug and cart checkout sends only slug + quantity, reducing client-controlled payment input surface — `components/store/BuyNowButton.tsx`, `components/cart/CartTable.tsx`
- Added strict Stripe-hosted redirect URL validation before returning checkout URLs to clients, enforcing `https://checkout.stripe.com` — `app/api/checkout/route.ts`
- Tightened payment error handling to use safe public messages in production when Stripe config/session creation fails — `app/api/checkout/route.ts`
- Simplified webhook gatekeeping to signature-first verification and added payload size limits to reduce abuse risk while preserving Stripe compatibility — `app/api/webhooks/stripe/route.ts`
- Why: improves production resilience by reducing trusted client input, constraining redirect behavior, and making webhook/session failure handling safer

### 2026-04-01 — Next.js production security hardening pass
- Added production-oriented security headers and CSP at framework level, including clickjacking, MIME sniffing, referrer, permissions, COOP/CORP, and HSTS controls — `next.config.ts`
- Hardened checkout route by enforcing same-origin requests, JSON content-type checks, rate limiting, server-side product lookup, and Stripe Price validation from trusted data instead of client-submitted pricing — `app/api/checkout/route.ts`, `lib/server-store.ts`, `lib/server-security.ts`, `lib/rate-limit.ts`
- Hardened webhook and download routes with stricter request validation, rate limiting, safer production error handling, and stricter download URL allowlisting — `app/api/webhooks/stripe/route.ts`, `app/api/download/route.ts`, `lib/server-security.ts`, `lib/rate-limit.ts`
- Replaced dangerous raw embed HTML rendering with sanitized Bandcamp iframe source extraction to reduce XSS exposure — `components/site/albums/AlbumDetailView.tsx`, `components/site/albums/album-utils.ts`
- Tightened Sanity token handling by requiring a write token for order persistence operations — `sanity/lib/orders.ts`
- Upgraded Next.js to a patched production release and reduced dependency advisories via `npm audit fix --omit=dev` — `package.json`, `package-lock.json`
- Added a production pre-deploy security checklist and explicit security tradeoffs for Stripe/Sanity/images/embeds/scripts — `README.md`
- Why: prepares the app and store for production deployment with stronger defaults against XSS, CSRF-like cross-origin abuse, SSRF-style fetch misuse, and payment/download abuse paths

### 2026-04-01 — Added security specialist agent prompt
- Created a new workspace custom agent for application security, Stripe/webhook hardening, secret handling, API defense, and secure fulfillment work — `.github/agents/security.agent.md`
- Updated architecture notes to include the repo's custom agent alongside the existing prompt files — `APP_STATUS.md`
- Why: gives the workspace a dedicated security-focused specialist alongside the storefront and audio-player store workflows

### 2026-04-01 — Local Stripe fulfillment config prepared
- Added missing local environment placeholders for `STRIPE_WEBHOOK_SECRET` and `NEXT_PUBLIC_BASE_URL`, and generated a local `DIGITAL_FULFILLMENT_SECRET` for signed download tickets — `.env.local`
- Documented the local Stripe CLI webhook forwarding flow and expected fulfillment behavior — `README.md`
- Why: makes the new checkout and digital-fulfillment pipeline runnable in local development instead of remaining only code-complete

### 2026-04-01 — Secure digital fulfillment flow added for paid downloads
- Replaced direct download redirects with a signed-ticket fulfillment model and server-streamed file responses so customers never receive permanent public asset URLs — `lib/fulfillment.ts`, `app/api/download/route.ts`
- Extended saved Stripe order records with fulfillment status and download access expiry metadata, keeping the system ready for digital albums, beats, plugins, and other downloadable products — `sanity/lib/orders.ts`, `sanity/schemaTypes/documents/order.ts`
- Added a dedicated server-only product download query and updated the success page to issue short-lived secure download links for paid items, including cart orders with multiple digital products — `sanity/lib/queries/products.ts`, `app/store/success/page.tsx`
- Why: makes post-purchase delivery safer and more production-ready by moving authorization and file delivery fully behind server-side checks

### 2026-04-01 — Stripe cart checkout now uses Sanity price IDs and webhook fulfillment is prepared
- Extended cart lines to preserve `stripePriceId` and `downloadable` flags so cart checkout can use Stripe Prices stored in Sanity instead of only inline price data — `types/content.ts`, `lib/cart.ts`, `components/cart/CartProvider.tsx`
- Updated `POST /api/checkout` to create cart sessions with Stripe Price IDs when available, carry order metadata for fulfillment, and keep the existing buy-now flow aligned with the same metadata model — `app/api/checkout/route.ts`, `components/store/BuyNowButton.tsx`
- Enhanced the order success page to show Stripe line items for cart orders, preserving the existing store UI language while improving post-checkout clarity — `app/store/success/page.tsx`
- Added verified Stripe webhook handling and Sanity order persistence helpers, and expanded the `order` schema to support multi-item carts — `app/api/webhooks/stripe/route.ts`, `sanity/lib/orders.ts`, `sanity/schemaTypes/documents/order.ts`
- Why: completes the direct checkout loop for both single-product and cart purchases and prepares reliable fulfillment hooks for paid orders

### 2026-04-01 — Full storefront integration with Stripe checkout
- Installed `stripe` SDK — `package.json`
- Fixed 6 GROQ bugs: `productImageFields` used wrong `image` field (→ `coverImage`); `productListFields` queried non-existent `kind` field (→ `"kind": productType`); status filters referenced schema-mismatched values (→ `published`/`upcoming`); `productBySlugQuery` fetched a non-existent nested `checkout {}` object (→ top-level `stripePriceId`); `stockStatus` fetched as field (→ derived via `select()` from `inventoryType`+`stock`); `previewImages[]` used wrong field name (→ `galleryImages`) — `sanity/lib/queries/fragments.ts`, `sanity/lib/queries/products.ts`
- Fixed `SanityProductKind` and `SanityProductStatus` TypeScript types to match actual Sanity schema values — `sanity/lib/types/products.ts`
- Added `mapSanityProductToStoreItem()` adapter — `lib/store-mappers.ts`
- Wired Sanity `product` documents into `/store` page alongside existing album + local product merge — `app/store/page.tsx`
- Updated `/store/[slug]` to try local → Sanity product → Sanity album lookup chain — `app/store/[slug]/page.tsx`
- Replaced checkout placeholder with full `POST /api/checkout` Stripe session creator (supports single-product `buy-now` and multi-item `cart` modes) — `app/api/checkout/route.ts`
- Created `BuyNowButton` client component (Stripe redirect on click) — `components/store/BuyNowButton.tsx`
- Updated `CartTable` with real Stripe cart checkout button — `components/cart/CartTable.tsx`
- Added `compact` prop to `AddToCartButton` for use in product grid cards — `components/cart/AddToCartButton.tsx`
- Upgraded `ProductCard` with hover lift, stock badges, and compact cart button for Stripe products — `components/site/ProductCard.tsx`
- Created `/store/success` order confirmation page with download CTA for digital products — `app/store/success/page.tsx`
- Created `GET /api/download` endpoint: verifies Stripe payment → redirects to Sanity CDN file URL — `app/api/download/route.ts`
- Why: completes the full e-commerce loop — products from Sanity, paid via Stripe, digital files delivered securely, all within the existing site design language

### 2026-03-30 and replaced the simulated EQ animation with a real Web Audio analyser graph in [components/site/albums/AlbumTrackPlayer.tsx](components/site/albums/AlbumTrackPlayer.tsx)
- Why: gives users direct transport controls and ensures EQ bars react to the actual frequencies of the current audio track

### 2026-03-30
- Added an animated EQ-style playback graph to [components/site/albums/AlbumTrackPlayer.tsx](components/site/albums/AlbumTrackPlayer.tsx) for the active track controls
- Why: improves player feedback by visualizing playback activity directly on album pages

### 2026-03-30
- Added in-player volume control to [components/site/albums/AlbumTrackPlayer.tsx](components/site/albums/AlbumTrackPlayer.tsx) for album track playback on the album detail page
- Why: gives customers direct loudness control while listening to uploaded track audio files

### 2026-03-30
- Removed the dedicated media route by deleting [app/media/page.tsx](app/media/page.tsx) and removed the Media link from [components/site/Header.tsx](components/site/Header.tsx)
- Why: aligns site navigation with the new direction to play audio directly on album pages instead of a standalone media page

### 2026-03-30
- Updated [components/site/HeroSection.tsx](c:/Users/Roniel/Documents/Coding_RTO/React/rto_beats_dot_com/components/site/HeroSection.tsx) to use the actual uploaded hero asset at [public/images/home](c:/Users/Roniel/Documents/Coding_RTO/React/rto_beats_dot_com/public/images/home) (`96664861-IMG_2455.JPG`)
- Why: connects the homepage hero directly to the real image added to the repo so the new photography appears without renaming files

### 2026-03-30
- Updated the homepage hero in [components/site/HeroSection.tsx](c:/Users/Roniel/Documents/Coding_RTO/React/rto_beats_dot_com/components/site/HeroSection.tsx) to support a dedicated local background image with layered cinematic overlays and created [public/images/home](c:/Users/Roniel/Documents/Coding_RTO/React/rto_beats_dot_com/public/images/home) for the hero asset
- Why: prepares the "Cinematic hip hop production for artists with vision" section to use a custom photography-driven hero image instead of a gradient-only background

### 2026-03-30
- Fixed media route integration bug where `sanity/lib/queries.ts` compatibility barrel shadowed new query exports, preventing `playableMediaProductsQuery` from resolving
- Fixed `/media` runtime crash by normalizing null query results to arrays in `app/media/page.tsx` and `components/site/MediaPlayerSection.tsx`
- Why: ensures recent media-player changes compile and render reliably in the running dev site

### 2026-03-30
- Added mini-player dock and expand controls with persisted preference in `components/media/MediaPlayerProvider.tsx` and `components/media/PersistentMiniPlayer.tsx`
- Added active-track auto-scroll sync in `components/site/MediaPlayerSection.tsx` so Next/Prev from the mini-player keeps the media library focused on the current item
- Why: improves media browsing flow and keeps the current selection visible during playback navigation

### 2026-03-30
- Added persistent global media playback state with `components/media/MediaPlayerProvider.tsx` and fixed mini-player UI in `components/media/PersistentMiniPlayer.tsx`
- Updated `app/providers.tsx` to mount the mini player app-wide so playback can continue across route navigation
- Enhanced `components/site/MediaPlayerSection.tsx` with custom play/pause, progress scrubbing, animated waveform bars, and shared player state integration
- Added custom media slider/thumb and waveform animation utilities in `app/globals.css`
- Why: enables cross-page playback persistence and a more polished media player experience

### 2026-03-30
- Added Sanity-powered media playback route at `app/media/page.tsx` with a library/player UI in `components/site/MediaPlayerSection.tsx`
- Added `playableMediaProductsQuery` in `sanity/lib/queries/products.ts` to fetch published products with playable audio/video file assets
- Added media-specific TypeScript models and exports in `sanity/lib/types/products.ts`, `sanity/lib/types/index.ts`, `sanity/lib/queries/index.ts`, and `sanity/lib/index.ts`
- Updated `components/site/Header.tsx` navigation to include a Media link
- Why: provides a direct on-site player for audio/video media uploaded in Sanity product documents

### 2026-03-30
- Rebuilt `sanity/schemaTypes/documents/product.ts` into a unified commerce-ready product model covering album, beat, plugin, merch, and digital products
- Added conditional Studio logic for album-only, beat-only, and plugin-only fields, plus conditional stock and digital download fields
- Added new `sanity/schemaTypes/documents/order.ts` document schema for Stripe order tracking and fulfillment state management
- Updated `sanity/schemaTypes/documents/index.ts` and `sanity/schemaTypes/index.ts` to register the new `order` document schema
- Why: enables direct-sales workflows with a single scalable product schema and a dedicated order record model

### 2026-03-29 — Store now surfaces Sanity albums for purchase flow
- Updated `app/store/page.tsx` to merge Sanity albums into the store catalog so imported albums are listed in `/store`
- Updated `app/store/[slug]/page.tsx` to resolve slug pages from either local products or Sanity albums
- Added `lib/store-mappers.ts` to map Sanity album docs into the existing `StoreItem` shape
- Updated `sanity/lib/queries/albums.ts` to include `bandcampUrl` in album list projections used by the store
- Updated `types/content.ts` to allow `out-of-stock` in store item stock status union
- Added purchase UX for Sanity album entries: product detail now shows **Buy on Bandcamp** when an external checkout URL exists
- Why: imported albums were visible on album pages but not purchasable from the store experience

### 2026-03-29 — Bandcamp album importer command
- Added `scripts/import-bandcamp-albums.mjs` to import existing Bandcamp album pages into Sanity `album` documents
- Added npm script `import:bandcamp` in `package.json`
- Importer maps title, slug, cover image (uploads to Sanity assets), release date, description, genre, tracks, and Bandcamp link fields
- Added `--dry-run` and `--update` flags for safer workflows
- Updated `README.md` with usage instructions and required env vars
- Why: lets you bootstrap older releases from Bandcamp without manually filling every Studio field

### 2026-03-29 — Sanity env validation hardening
- Updated `sanity/env.ts` to validate `NEXT_PUBLIC_SANITY_PROJECT_ID` format (`a-z`, `0-9`, `-` only)
- Added `invalidSanityEnvVars` tracking and included it in `isSanityConfigured`
- `assertSanityEnv()` now throws a clear error for invalid project IDs, not just missing vars
- Prevents Next.js runtime 500s when placeholder IDs like `your_project_id_here` are present; app now falls back gracefully to setup states

### 2026-03-29 — Local Studio env setup
- Updated `.env.local` with required Sanity variables:
  - `NEXT_PUBLIC_SANITY_PROJECT_ID`
  - `NEXT_PUBLIC_SANITY_DATASET`
  - `NEXT_PUBLIC_SANITY_API_VERSION`
  - `SANITY_API_READ_TOKEN`
- Existing local variables for Stripe/YouTube/Admin were preserved
- Next step: replace placeholder project ID with real Sanity project ID and restart Studio

### 2026-03-29 — Album system production refactor
- Refactored repeated album UI logic into shared utilities: `components/site/albums/album-utils.ts`
  - shared status badge metadata
  - shared date formatter with invalid-date fallback
  - shared fallback image + blur placeholder constants
  - shared portable-text paragraph extraction and album summary helper
- Extracted album detail presentation out of the route into `components/site/albums/AlbumDetailView.tsx` for cleaner page/data separation
- Extracted setup/empty states into `components/site/albums/AlbumStates.tsx`
- Improved naming consistency in album types:
  - added `SanityAlbumBase`
  - added `SanityStreamingPlatform`
  - reused these through `SanityAlbumListItem` and `SanityAlbumDetail`
- Improved maintainability of album GROQ queries in `sanity/lib/queries/albums.ts`
  - split into `albumBaseFields`, `albumDetailFields`, and shared ordering constant
- Accessibility improvements:
  - added explicit `aria-label`s for album card links, back navigation, and streaming links
  - used list semantics for genre chips on the detail page
  - preserved focus-visible states on interactive elements
- Image handling improvements:
  - centralized fallback image and blur placeholder values
  - added blur placeholders to album detail hero and gallery images
  - centralized alt text fallback logic
- SEO improvements for album pages:
  - added canonical + Open Graph data to `/albums`
  - expanded album detail metadata with Twitter cards and `robots.noindex` for draft albums
- Build verified after refactor: Next.js build passes (15/15 pages)

### 2026-03-29 — Album UX polish
- Added loading states for album routes:
  - `app/albums/loading.tsx`
  - `app/albums/[slug]/loading.tsx`
- Added reusable `components/site/albums/AlbumCardSkeleton.tsx` for a polished index-page skeleton grid
- Added route-specific invalid slug experience with `app/albums/[slug]/not-found.tsx`
- Upgraded `app/albums/page.tsx` empty/setup states with clearer copy and a more polished layout
- Improved `app/albums/[slug]/page.tsx` graceful fallbacks:
  - cover and gallery image fallbacks retained
  - missing rich description now falls back to short description or a safe default
  - optional sections remain hidden cleanly when data is absent
- Fixed album rich-text handling by typing and rendering portable text paragraphs from Sanity instead of treating `fullDescription` like a plain string
- Added shared portable-text types to `sanity/lib/types/shared.ts` and exported them through the type barrels

### 2026-03-29 — Future-ready store architecture foundation
- Refactored Sanity data layer into domain modules while keeping backward compatibility:
  - Added `sanity/lib/queries/albums.ts`, `sanity/lib/queries/products.ts`, `sanity/lib/queries/fragments.ts`, `sanity/lib/queries/index.ts`
  - Added `sanity/lib/types/albums.ts`, `sanity/lib/types/products.ts`, `sanity/lib/types/shared.ts`, `sanity/lib/types/index.ts`
  - Kept `sanity/lib/queries.ts` and `sanity/lib/types.ts` as compatibility barrels so existing imports continue to work
- Expanded `sanity/lib/index.ts` exports for both albums and products
- Added future store schema foundation:
  - `sanity/schemaTypes/documents/product.ts` (supports merch, beats, plugins, digital products)
  - `sanity/schemaTypes/objects/productPrice.ts`
  - `sanity/schemaTypes/objects/checkoutLinks.ts`
  - Registered new schema types in `sanity/schemaTypes/documents/index.ts`, `sanity/schemaTypes/objects/index.ts`, and `sanity/schemaTypes/index.ts`
- Build verified after refactor: Next.js build passes (15/15 pages)

### 2026-03-29 — GROQ query refactor
### 2026-03-29 — Sanity Studio album editing UX improvements
- Upgraded `sanity/schemaTypes/documents/album.ts` for easier single-person editing workflows
- Added document-level `initialValue` defaults: `status: draft`, `featured: false`, `releaseDate: today`
- Strengthened field guidance with richer descriptions across editorial/music/links/media groups
- Kept slug auto-generation from title and added explicit `slugify` normalization for cleaner URLs
- Added/expanded validation: shortDescription length guidance, genre uniqueness, featuredArtists uniqueness, Bandcamp embed source check
- Improved image accessibility support by enforcing/encouraging alt text on cover and gallery images
- Expanded Studio sorting options: newest, oldest, featured-first, title A-Z
- Enhanced Studio preview subtitle to include status, year, and featured flag
- Improved reusable object schemas:
  - `track.ts`: better descriptions + strict `mm:ss` validation
  - `credit.ts`: clearer field guidance + default role
  - `streamingLinks.ts`: per-platform helper descriptions + object description

### 2026-03-29 — FeaturedAlbumsSection
- Created `components/site/FeaturedAlbumsSection.tsx` — async server component, Sanity-driven
- Fetches `featuredAlbumsQuery` with `{ limit: 6 }`, renders `SanityAlbumCard` grid (1→2→3 cols)
- Section hides entirely when no featured albums exist (`return null`)
- Ambient amber radial gradient background for cinematic feel
- "View all albums →" link with animated arrow icon
- Updated `app/page.tsx` to use `FeaturedAlbumsSection` in place of `FeaturedWorkSection`
- `FeaturedWorkSection.tsx` retained for future store drops section
- Rewrote `sanity/lib/queries.ts` with section comments and shared field fragments
- Extracted `coverImageFields` and `albumListFields` fragments — DRY across queries
- Added `featuredAlbumsQuery` (NEW) — filters `featured == true`, accepts `$limit` param, returns list shape for `SanityAlbumCard`
- Improved `albumBySlugQuery` gallery alt: `coalesce(alt, "Gallery image")` instead of nullable
- All 4 queries: `allAlbumSlugsQuery`, `allAlbumsQuery`, `albumBySlugQuery`, `featuredAlbumsQuery`

### 2026-03-29
- Rewrote `/albums/[slug]` detail page — now fully Sanity-driven via `albumBySlugQuery`
- Added `SanityAlbumDetail` type + sub-types (`SanityTrack`, `SanityCredit`, `SanityStreamingLinks`, `SanityGalleryImage`) to `sanity/lib/types.ts`
- Added `allAlbumSlugsQuery` to `sanity/lib/queries.ts` for `generateStaticParams`
- Created `components/site/albums/AlbumCard.tsx` — reusable card with explicit flat props, status badge, hover glow, blur placeholder, arrow CTA
- Refactored `SanityAlbumCard.tsx` to a thin adapter over `AlbumCard`
- Detail page sections: hero, tracklist, credits grid, photo gallery, Bandcamp embed — all optional/gracefully hidden when data absent
- SEO: `generateMetadata` with OG image, JSON-LD `MusicAlbum` schema

### 2026-03-27 – 2026-03-28
- Built albums index page (`/albums`) — Sanity-driven with `allAlbumsQuery`
- Created `SanityAlbumCard` component with premium dark design and status badges
- Added `cdn.sanity.io` to `next.config.ts` `remotePatterns`
- Set up Sanity frontend client (`@sanity/client` + `groq`) — `.env.example`, `sanity/env.ts`, `sanity/lib/client.ts`, `sanity/lib/queries.ts`
- Resolved build crash when Sanity env vars absent: `isSanityConfigured` guard, conditional `createClient`
- Sanity schema: `album` document + `track`, `credit`, `streamingLinks` object types
- Pushed 53 files to GitHub (`hero` branch) — remote: `https://github.com/RonielOverton/RTO_Beats_dot_com.git`

### 2026-03-25 – 2026-03-26
- Full architectural refactor: typed content models, data catalogs (`data/albums.ts`, `data/store.ts`)
- Dynamic routes: `/albums/[slug]`, `/store/[slug]` with `generateStaticParams`
- Cart system: `CartProvider` + localStorage persistence
- Added `YoutubeSection` component — fetches `/api/youtube`, renders 3 latest video cards
- Removed `BandcampAPI` route; YouTube API route preserved
- Header, Footer, Hero, Bio, FeaturedWork, CTA sections created as modular components
- SEO utilities: `buildAlbumJsonLd`, `buildProductJsonLd`, `StructuredData` component

### 2026-03-23
- Restored app to pre-webstore implementation
- Re-enabled Bandcamp API flow and YouTube API flow
- Rewired homepage to use Bandcamp discography and YouTube feed
- Changed primary font color to gold (`#f5c46b`)

---

## Update Policy
Update this file on each implementation step. Add one entry under **Change Log** with: what changed, which files, and why.

